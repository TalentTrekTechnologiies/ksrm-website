# KSRM Website — Deployment Guide

Two deployables:
- **Backend** — NestJS + PostgreSQL + local media storage. Runs anywhere Docker runs (`docker-compose.prod.yml`).
- **Frontend** — fully static Next.js export (`frontend/out`). Deploy to Netlify (config in `frontend/netlify.toml`) or any static host/CDN.

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
