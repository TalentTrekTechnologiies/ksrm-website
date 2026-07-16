# KSRM Website — Deployment Guide

Two deployables:
- **Backend** — NestJS + PostgreSQL + local media storage. Runs anywhere Docker runs (`docker-compose.prod.yml`, or `render.yaml` for Render).
- **Frontend** — fully static Next.js export (`frontend/out`). Deploy to Netlify
  (config in **`frontend/netlify.toml`**) or any static host/CDN.
  > Netlify resolves `netlify.toml` from inside the **base directory**, so the
  > config must live in `frontend/`, not the repo root. A root-level
  > `netlify.toml` is silently ignored — no warning, no build error.

---

## 0. Demo deploy — Netlify (frontend) + Render free tier (backend)

Config already in the repo: `netlify.toml` (root) and `render.yaml` (root).
Do it in this order — the frontend bakes the API URL in at build time, so the
backend must exist first.

**1. Backend + database (Render)**
1. Render → **New → Blueprint** → pick this repo. It reads `render.yaml` and
   creates `ksrm-backend` (Docker) + `ksrm-db` (free Postgres).
2. It will prompt for the two `sync:false` vars. `CORS_ORIGIN` isn't known yet —
   put a placeholder, you'll fix it in step 3.
   - `MEDIA_BASE_URL` = this service's URL, e.g. `https://ksrm-backend.onrender.com`
3. Deploy. `prisma migrate deploy` runs automatically on boot (see Dockerfile `CMD`).
4. **Seed the database once — from your machine, not the Render shell.** The
   seed is `ts-node prisma/seed.ts`, and the runtime image is built with
   `npm ci --omit=dev`, so ts-node isn't in it (there is also no `prisma.seed`
   config, so `npx prisma db seed` won't work either). Instead, copy the
   **External** connection string from the Render database page and run the
   seed locally against it:
   ```bash
   cd backend
   DATABASE_URL="<render-external-connection-string>" npm run seed
   ```
   (PowerShell: `$env:DATABASE_URL="..."; npm run seed`)

**2. Frontend (Netlify)**
1. Netlify → **Add new site → Import from Git** → pick this repo.
2. Set **Base directory = `frontend`**. Netlify then reads
   `frontend/netlify.toml`, which pins the build command, publish dir, Node
   version and `NEXT_PUBLIC_API_URL`. Nothing else needs typing in the UI.
3. Deploy → note the site URL.

> **`NEXT_PUBLIC_API_URL` is inlined at build time**, not read at runtime.
> If it is missing the build still *succeeds* and ships a broken site:
> `api-client.ts` falls back to `""` so every API call hits the Netlify origin
> and 404s, while `api-base.ts`/`media-api.ts` fall back to `localhost:4000` so
> images and PDFs break. Nothing appears in the build log — the only symptom is
> in the browser console. After changing it, use **Clear cache and deploy site**;
> a plain redeploy can reuse the cached bundle.

**3. Point them at each other**
1. Render → `ksrm-backend` → Environment → set `CORS_ORIGIN` to the real Netlify
   URL (e.g. `https://ksrm.netlify.app`). Save (redeploys).
2. **Rewrite the stored media URLs** — ~167 rows (132 faculty photos, 24
   documents, 7 gallery, 4 news) hold absolute `http://localhost:4000/media/...`
   snapshots and will 404 otherwise. Run it from your machine against the
   database's **External** connection string (Render's free plan has no shell):
   ```bash
   cd backend
   DATABASE_URL="<render-external-connection-string>" \
     node scripts/rebase-media-urls.js --from http://localhost:4000 --to https://ksrm-backend.onrender.com --dry-run
   # re-run without --dry-run once the counts look right
   ```
3. **Change the super-admin password** (the seeded one is public in this repo).

### Free-tier caveats — read before demoing
- **Media survives, new uploads do not.** Render free has an ephemeral
  filesystem and no persistent disk, and it deploys from git — so
  `backend/storage/media` is committed and baked into the image
  (`COPY storage/media`). Existing images/PDFs work and survive restarts;
  anything uploaded *at runtime* is lost on the next restart/sleep.
  Fix properly with a paid disk (uncomment `disk:` in `render.yaml`) or object
  storage (§5).
- **Cold starts.** Free instances sleep after ~15 min idle; the next request
  takes ~50s. Wake the API before showing anyone.
- **Free Postgres expires ~90 days** after creation.
- **Emails go nowhere.** `EMAIL_PROVIDER=console` only logs, so Careers
  applications notify no one until SMTP/SES is configured.

---

## 1. Backend

```bash
# at repo root - create a production env file used by docker compose
cat > .env <<'ENV'
POSTGRES_PASSWORD=<long random>
JWT_SECRET=<long random - the app refuses to boot without it>
CORS_ORIGIN=https://www.ksrmce.ac.in        # the frontend's public origin
MEDIA_BASE_URL=https://api.ksrmce.ac.in     # the backend's public origin
EMAIL_PROVIDER=smtp                          # console = emails silently logged, not sent!
SMTP_HOST=... SMTP_PORT=587 SMTP_USER=... SMTP_PASS=...
HR_NOTIFICATION_EMAIL=hr@ksrmce.ac.in
ENV

docker compose -f docker-compose.prod.yml up -d --build
```

The container runs `prisma migrate deploy` on boot, then serves on :4000. Put a
TLS-terminating reverse proxy (Caddy/nginx/Cloudflare) in front of it as
`MEDIA_BASE_URL`'s domain.

### 1a. One-time data migration (REQUIRED on first deploy)
Historical DB rows store absolute media URLs from local development. Rebase
them to the production origin (dry-run first):

```bash
docker compose -f docker-compose.prod.yml exec backend \
  node scripts/rebase-media-urls.js --from http://localhost:4000 --to https://api.ksrmce.ac.in --dry-run
# then without --dry-run
```

Re-run any time the backend origin changes. Safe to re-run.

### 1b. First-boot checklist
- [ ] Change the super admin password (seed default is `SuperAdmin@123` — the
      server logs a loud warning at boot while it's unchanged)
- [ ] Copy local uploads: `backend/storage/media/**` → the `media` docker volume
      (or re-upload via the Media Library)
- [ ] Verify email: Site Settings → Email → "Send test email"
- [ ] Replace placeholder content flagged in PROJECT_STATUS.md (sample
      news/events/testimonials, EDC/IIC demo documents)

## 2. Frontend (static export)

Set build-time env (Netlify → Site settings → Environment):

| Var | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.ksrmce.ac.in` (no trailing slash) |
| `NEXT_PUBLIC_POLL_INTERVAL_MS` | optional; default is 30000 in production builds |

Then `npm run build` in `frontend/` → deploy `frontend/out`.

**Every media URL in source resolves through `NEXT_PUBLIC_API_URL`**
(`frontend/lib/api-base.ts`) — nothing is hardcoded to localhost.

## 3. Backups
- **Postgres**: `docker compose -f docker-compose.prod.yml exec db pg_dump -U ksrm ksrm_db > backup.sql` (cron it daily)
- **Media volume**: back up the `media` docker volume alongside the DB — DB rows
  reference these files; restore them together.

## 4. Security posture (already wired)
- helmet security headers; CORS locked to `CORS_ORIGIN`
- Rate limits: 600 req/min/IP global, 10/min on login, media files exempt
- JWT (7-day) signed with `JWT_SECRET`; validation whitelist on all inputs
- Swagger disabled when `NODE_ENV=production`

## 5. Known limitations / future upgrades
- In-process media job queue → single backend instance only (scale-out needs Redis/BullMQ)
- No refresh-token flow (schema exists; 7-day access tokens until then)
- Local-disk media storage → S3/CloudFront adapter is the designed next step
  (interface in `backend/src/media/storage/`), then `MEDIA_BASE_URL` points at the CDN
- Polling-based live updates → SSE/WebSocket would cut request volume further
