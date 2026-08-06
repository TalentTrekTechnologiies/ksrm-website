# Deployment checklist — 7 August 2026

Everything below is verified locally. Run the steps in order; step 3 is the one
that is easy to skip and breaks things quietly.

## Verified before writing this

| Check | Result |
|---|---|
| Backend tests | **407 / 407 pass** |
| Backend `tsc --noEmit` | clean |
| Frontend `tsc --noEmit` | clean |
| Frontend build | 130 pages generated |
| Schema vs migrations | **no difference detected** |
| CMS registry | 52 sections, 1099 slots, **0 broken** |
| Orphan scan | no unimported content files |
| Postgres | 16.14 — `ALTER TYPE … ADD VALUE` in a transaction is supported |

## 1. Back up production first

```bash
pg_dump -U postgres ksrm_db > ~/ksrm-backup-$(date +%F-%H%M).sql
```

Do not skip this. Six of the pending migrations add enum values, and an enum
value cannot be removed by rolling a migration back.

## 2. Pull and migrate

```bash
cd /path/to/ksrm-website
git pull
cd backend
npm ci --omit=dev
npx prisma migrate deploy
```

Migrations pending, all **purely additive** — no existing column is dropped,
narrowed or retyped:

| Migration | What it adds |
|---|---|
| `20260807090000_committee_board_of_studies` | `CommitteeType.BOARD_OF_STUDIES`, `Committee.departmentId` |
| `20260807093000_committee_unique_per_department` | widens the unique index to include `departmentId` |
| `20260807120000_kgcet_module` | `KgcetParticipation`, `KgcetHighlight` |
| `20260807140000_content_style` | `ContentStyle` |
| *(plus everything queued from earlier in the week)* | |

The one index change is a **widening** — a widened unique index never rejects a
row the narrower one accepted, so no existing data can conflict.

## 3. Seed — REQUIRED, not optional

```bash
npm run seed
```

KGCET introduces five new permissions (`kgcet.view/create/update/delete/restore`).
Without this step those rows do not exist in production, so the KGCET screen is
invisible to everyone except a super admin — the module ships and nobody can
find it.

**This is safe to re-run.** `seedRoles` only ever upserts, and the seed contains
no `deleteMany` or `delete` anywhere: it adds the new permissions and grants
them to the system roles **without touching any role that has been customised**.

## 4. Build and restart

```bash
npx prisma generate
npm run build
pm2 restart ksrm-api
pm2 logs ksrm-api --lines 30      # confirm it came up clean

cd ../frontend
npm ci
npm run build                     # writes frontend/out
# deploy frontend/out to the web root
```

## 5. Check after

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ksrmce.ac.in/api/kgcet/participation
curl -s -o /dev/null -w "%{http_code}\n" https://ksrmce.ac.in/api/content-styles
```

Then in the admin:

- **KGCET** appears in the sidebar (proves step 3 ran)
- **Departments → any department → Board of Studies** tab is present
- **Page Content** has a search box and is sorted alphabetically
- **Roles & Permissions** lists five KGCET permissions, described properly —
  not "View undefined"

And on the public site:

- `/campus-life/college-fest` and `/campus-life/health-facilities` load
- the homepage **Upcoming Events** panel scrolls
- `/academics/syllabus` shows branches under B.Tech / M.Tech / MBA
- `/about` shows Academic Council and Finance Committee
- `/campus-life/library` shows **two** floors

## Known, deliberately not changed

- **Disk**: the VPS is unaffected, but the local D: drive ran to 100% during
  this work and broke a build. `frontend/.next` alone was 3.7 GB.
- **`D:\database\u656731312.20260721082752.tar.gz`** (46 GB) still cannot be
  extracted — its database dumps are inside *nested* archives, so a wildcard
  extraction finds nothing. Export the database from hPanel instead.
- Three files remain unimported on purpose: `components/about/leaders.ts`,
  `lib/csv-export.util.ts`, `lib/useCmsCollection.ts` — plumbing, not content.
  Re-check with `node frontend/scripts/find-orphans.mjs`.
