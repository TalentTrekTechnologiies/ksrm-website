#!/usr/bin/env bash
# Rewrite the absolute media URLs stored in the database.
#
# Media file URLs are saved as absolute URLs (e.g.
# http://localhost:4000/media/file/30/ORIGINAL/SOURCE), so they have to be
# retargeted whenever the API's public address changes - which happens twice on
# this project: local -> temporary domain, then temporary -> ksrmce.ac.in.
#
# Two modes:
#
#   1. Rewrite a dump file BEFORE restoring it (safe, no DB involved):
#        ./retarget-media-urls.sh --file dump.sql http://old-api https://new-api
#
#   2. Rewrite a live database IN PLACE (run on the server):
#        ./retarget-media-urls.sh --db "postgresql://user:pass@localhost:5432/ksrm_db" \
#             http://old-api https://new-api
#
# Always take a backup first; mode 2 changes data.

set -euo pipefail

MODE="${1:-}"
TARGET="${2:-}"
OLD="${3:-}"
NEW="${4:-}"

if [[ -z "$MODE" || -z "$TARGET" || -z "$OLD" || -z "$NEW" ]]; then
  grep '^#' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

case "$MODE" in
  --file)
    [[ -f "$TARGET" ]] || { echo "No such file: $TARGET" >&2; exit 1; }
    before=$(grep -o "$OLD" "$TARGET" | wc -l || true)
    cp "$TARGET" "$TARGET.bak"
    # | as the delimiter so URLs containing / need no escaping
    sed -i "s|$OLD|$NEW|g" "$TARGET"
    after=$(grep -o "$OLD" "$TARGET" | wc -l || true)
    echo "rewrote $before occurrence(s) in $TARGET  ($OLD -> $NEW)"
    echo "remaining old refs: $after   (original kept at $TARGET.bak)"
    ;;

  --db)
    echo "Rewriting live database. Ctrl-C now if you have not backed it up."
    sleep 3
    # Every column that can hold a media URL.
    psql "$TARGET" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
UPDATE "GalleryImage" SET "imageUrl"  = replace("imageUrl",  '$OLD', '$NEW') WHERE "imageUrl"  LIKE '%$OLD%';
UPDATE "Download"     SET "fileUrl"   = replace("fileUrl",   '$OLD', '$NEW') WHERE "fileUrl"   LIKE '%$OLD%';
UPDATE "Faculty"      SET "photoUrl"  = replace("photoUrl",  '$OLD', '$NEW') WHERE "photoUrl"  LIKE '%$OLD%';
UPDATE "SiteSetting"  SET "value"     = replace("value",     '$OLD', '$NEW') WHERE "value"     LIKE '%$OLD%';
UPDATE "Department"   SET "logoUrl"   = replace("logoUrl",   '$OLD', '$NEW') WHERE "logoUrl"   LIKE '%$OLD%';
UPDATE "Department"   SET "heroImageUrl" = replace("heroImageUrl", '$OLD', '$NEW') WHERE "heroImageUrl" LIKE '%$OLD%';
COMMIT;
SQL
    echo "done. Verify with:"
    echo "  psql \"$TARGET\" -c \"SELECT count(*) FROM \\\"GalleryImage\\\" WHERE \\\"imageUrl\\\" LIKE '%$OLD%';\""
    ;;

  *)
    echo "Unknown mode: $MODE (expected --file or --db)" >&2
    exit 1
    ;;
esac
