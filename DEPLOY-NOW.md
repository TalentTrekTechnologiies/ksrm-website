# Deployment — run in this order

Everything below is additive. No existing VPS row is deleted or overwritten,
apart from one deliberate soft-delete (the MCA department).

**Do step 1 first.** The live site currently calls a dead backend, so until it
is done nothing else you deploy will be visible, and you will not be able to
tell which fault you are looking at.

---

## 0. Take a backup first

```bash
ssh root@200.141.7.253
pg_dump -U postgres ksrm_db > ~/ksrm-backup-$(date +%F-%H%M).sql
ls -lh ~/ksrm-backup-*.sql          # confirm it is not 0 bytes
```

---

## 1. Fix the dead backend URL  ← the current outage

The deployed frontend has `https://ksrm-backend.onrender.com` compiled into it.
That host returns 404 on every path, which is the "Could not reach the server"
message. `api.ksrmce.ac.in` has **no DNS record**, so it cannot be used either.

The site and its API share one origin (`http://200.141.7.253` serves both the
pages and `/api`), so the correct value is the relative `/api`.

```bash
cd /var/www/ksrm/frontend
echo 'NEXT_PUBLIC_API_URL=/api' > .env.local
```

The value is baked in at build time, so this must be set *before* step 3.

---

## 2. Backend: code + migrations

```bash
cd /var/www/ksrm
git pull

cd backend
npm ci
npx prisma migrate deploy
npm run build
pm2 restart ksrm-api
pm2 logs ksrm-api --lines 30      # confirm it came up clean
```

### The three migrations this applies

| Migration | What it does |
|---|---|
| `20260804160000_committee_type_governing_body` | `ALTER TYPE "CommitteeType" ADD VALUE 'GOVERNING_BODY'` |
| `20260804180000_faculty_achievement_detail` | `ALTER TYPE "FacultyAchievementType" ADD VALUE 'DETAIL'` |
| `20260805000000_programme_code_accreditation` | Adds `code` and `accreditation` to `DepartmentProgramme` |

All three are additive — two enum values and two nullable columns. No drops, no
renames, no type changes. Existing rows are untouched.

`ALTER TYPE ... ADD VALUE` is the one to watch: on older PostgreSQL it cannot
run inside a transaction. `migrate deploy` handles this, but if a step is going
to complain it will be one of those two.

Verify:

```bash
psql -U postgres -d ksrm_db -c "\dT+ \"CommitteeType\""
psql -U postgres -d ksrm_db -c "\d \"DepartmentProgramme\"" | grep -E 'code|accreditation'
```

---

## 3. Frontend: build and publish

```bash
cd /var/www/ksrm/frontend
npm ci
npm run build            # slow on 1 vCPU - it is not hung
```

**Check before serving.** Both must print nothing:

```bash
grep -rl "onrender.com"  out/_next | head -1
grep -rl "localhost:4000" out/_next | head -1
```

If either prints a filename the build picked up the wrong API URL — fix
`.env.local` and rebuild rather than shipping it.

```bash
sudo systemctl reload nginx
```

---

## 4. Content

```bash
scp deploy-data.sql root@200.141.7.253:/var/www/ksrm/
ssh root@200.141.7.253
cd /var/www/ksrm
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f deploy-data.sql
```

It prints what it changed. Expected on a first run:

```
MCA departments retired  : 1
Contact records added    : 8
Programmes added         : 12
Disclosure documents     : 6
```

Safe to run twice — a second run reports 0 for everything. Rows are matched on
slug / name / title, never on id, because the two databases assign different
ids for the same records.

**Tested before shipping**: run against the real schema inside a rolled-back
transaction, from both an already-populated and an empty state.

---

## 5. Manual step — 8 PDFs

Eight Mandatory Disclosure documents are **not** in the SQL script:

Accreditation Status (NAAC & NBA) · NBA Accreditation Letter · UGC Autonomous
Letter · Organogram · Committee Co-ordinators · Ombudsman (JNTUA DAAO) · Fee
Collection Terms · Capacity Development Activities

They reference local media ids that hold **different files** on the VPS —
verified by comparing both servers byte for byte. Inserting them would publish
eight documents that silently open the wrong PDF.

Upload them through **Admin → Downloads** on the VPS (`pageSection`
`mandatory-disclosure`, groups *Accreditation Status* / *UGC Autonomous* /
*Other Statutory Documents*) so the VPS assigns its own media ids. They then
appear on both Mandatory Disclosure and Accreditation automatically.

---

## 6. Smoke test

```bash
curl -s http://200.141.7.253/api/health
curl -s -o /dev/null -w "%{http_code}\n" http://200.141.7.253/
```

Then in a browser:

- **Admin login works** — this is what proves step 1 landed
- Admin → **Academics** — 12 programmes, 1,074 seats total
- Admin → **Committees** — "Governing Body" appears in the Type dropdown
- Faculty → edit someone, clear their phone, save — it stays cleared
- `/academics/courses-intake` — seat table populated
- `/contact` — 4 office cards and the info row
- `/mandatory-disclosure` — 6 documents (14 once you upload the other 8)

---

## Still outstanding

**The default admin password `SuperAdmin@123` is still live.** Change it before
announcing the site. It has been flagged repeatedly and never actioned.

`api.ksrmce.ac.in` and `cms.ksrmce.ac.in` have no DNS records. Everything above
works on the IP; if you later point those subdomains at the VPS, change
`NEXT_PUBLIC_API_URL` and `media_base` in `deploy-data.sql` to match.
