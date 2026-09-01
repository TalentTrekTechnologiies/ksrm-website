-- Academic year a document belongs to, e.g. "AY 2026-27".
--
-- Nullable with no default and no backfill: a year is a fact about the
-- document, and guessing one from an upload date would be wrong for every
-- document uploaded late, re-uploaded, or imported in bulk from the old site.
-- Null reads as "not year-specific" and always shows, so existing documents
-- behave exactly as they do today until somebody sets a year deliberately.
ALTER TABLE "Download" ADD COLUMN "academicYear" TEXT;

-- The public pages filter by section and then group by year.
CREATE INDEX "Download_pageSection_academicYear_idx"
  ON "Download" ("pageSection", "academicYear");
