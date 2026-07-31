# Standard Operating Procedures — K.S.R.M. College Website

Operational runbook for the team that maintains the system. For day-to-day
content editing see [USER-GUIDE.md](USER-GUIDE.md); for first-time server setup
see [../deploy/VPS-DEPLOYMENT.md](../deploy/VPS-DEPLOYMENT.md).

---

## SOP-00 · System at a glance

| Piece | What it is | Where |
|---|---|---|
| Website | Next.js static export (plain HTML/JS) | `/var/www/ksrm-site` |
| Backend API | NestJS, under PM2 as `ksrm-backend` | `~/ksrm-website/backend` |
| Database | PostgreSQL | local, port 5432 |
| Uploads | Files staff upload through the CMS | `MEDIA_STORAGE_ROOT` in `.env` |
| Web server | Nginx — serves the site, proxies `/api` | `/etc/nginx/sites-available/ksrm` |

**Routing:** the site is served at `/`, the API at `/api/`. They must stay
separate, because the API's own paths (`/departments`, `/gallery`) are also real
page addresses. This is why the backend runs with a global `api` prefix.

**Health check:**
```bash
pm2 list                                       # ksrm-backend should be online
curl -o /dev/null -w "%{http_code}\n" http://localhost:4000/api/faculty   # 200
curl -o /dev/null -w "%{http_code}\n" http://localhost/api/faculty        # 200
curl -o /dev/null -w "%{http_code}\n" http://localhost/                   # 200
```

---

## SOP-01 · Deploying a website (frontend) change

**When:** design changes, new pages, bug fixes to the site itself.
**Not needed for content edits** — those are live the moment staff press Save.

```bash
# 1. On your machine, get the latest code
cd ksrm-website && git pull

# 2. Build for production. The env override is REQUIRED - see the warning below
cd frontend
NEXT_PUBLIC_API_URL=/api npm run build

# 3. Verify before uploading. Both must pass
grep -rl "localhost" out/_next | wc -l     # must be 0
ls out/index.html                          # must exist

# 4. Upload
rsync -avz --delete out/ USER@SERVER:/var/www/ksrm-site/
```

> **⚠️ Always pass `NEXT_PUBLIC_API_URL=/api`.** `.env.local` holds the *local
> development* address. Building without the override bakes `localhost` into the
> production files, and every page silently loses its data — with no error
> anywhere. This has happened; always run the `grep` check above.

**Why `/api` and not a full address:** a relative path means the same files work
on the IP, the temporary domain and the final domain, over http or https,
without rebuilding.

**Verify after upload:** hard-refresh (`Ctrl+Shift+R`) and confirm the homepage
ticker shows data.

---

## SOP-02 · Deploying a backend change

```bash
cd ~/ksrm-website && git pull
cd backend
npm ci
npx prisma generate
npx prisma migrate status        # look first
npx prisma migrate deploy        # only if it reports pending migrations
npm run build
pm2 restart ksrm-backend
pm2 logs ksrm-backend --lines 40 # watch for startup errors
```

Do not run `migrate deploy` reflexively — check status first.

---

## SOP-03 · Changing the domain (or moving to HTTPS)

The order matters. Do not skip ahead.

1. **DNS** — point the domain's A-record at the server IP. Confirm:
   `dig +short yourdomain`
2. **Nginx** — add the domain to `server_name`, then `nginx -t && systemctl reload nginx`
3. **Verify over plain http first** — the site must load before SSL
4. **SSL** — `certbot --nginx -d yourdomain` (choose redirect)
5. **Update the backend** `.env`:
   ```ini
   CORS_ORIGIN="https://yourdomain"
   MEDIA_BASE_URL="https://yourdomain/api"
   ```
6. **Rewrite the stored media addresses** — see SOP-04
7. `pm2 restart ksrm-backend`
8. **Re-verify** — see SOP-08

> Steps 5–6 are the ones people forget. Skip them and every previously uploaded
> image breaks, because their web addresses are stored with the old domain.

---

## SOP-04 · Rewriting stored media addresses

**When:** the domain or the API path changes.

**Why this is needed:** when staff upload a file, its full web address is saved
in the database. Change the domain and those saved addresses still point at the
old one.

**Always back up first** (SOP-05), then:

```bash
cd ~/ksrm-website
./deploy/retarget-media-urls.sh --db "$DATABASE_URL" OLD_BASE NEW_BASE
# e.g. ... http://200.141.7.253/api https://ksrmce.ac.in/api
```

**Check afterwards** — this should return 0:
```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM \"GalleryImage\" WHERE \"imageUrl\" LIKE '%OLD_BASE%';"
```

Then `pm2 restart ksrm-backend`.

> Media addresses live in ~33 columns across ~24 tables (hero video, faculty
> photos, department banners, recruiter logos, and more). Use the script rather
> than updating tables by hand — it is easy to miss one, and the symptom is a
> single broken image nobody notices for weeks.

---

## SOP-05 · Backups

### Automatic (set this up once)

```bash
sudo mkdir -p /var/backups/ksrm && sudo chown $USER:$USER /var/backups/ksrm
crontab -e
```
```cron
0 2 * * * pg_dump "$DATABASE_URL" | gzip > /var/backups/ksrm/db-$(date +\%F).sql.gz
30 2 * * * tar czf /var/backups/ksrm/media-$(date +\%F).tar.gz -C ~/ksrm-website/backend storage/media
0 3 * * * find /var/backups/ksrm -mtime +14 -delete
```

**Copy backups off the server regularly.** A backup on the same machine does not
survive that machine failing.

### Before any risky change

```bash
pg_dump "$DATABASE_URL" > ~/before-change-$(date +%F-%H%M).sql
```

### Restoring

```bash
gunzip -c /var/backups/ksrm/db-YYYY-MM-DD.sql.gz | psql "$DATABASE_URL"
pm2 restart ksrm-backend
```

---

## SOP-06 · Adding or removing a staff account

**Adding:** Admin → **Admins** → Add. Set the **Department** if they should only
manage one department; leave blank for site-wide. Assign the narrowest role that
covers their job.

**Removing (staff leaving):** deactivate or delete the account **the same day**.
Their past edits remain in the audit log — that history is kept deliberately.

Never share one login between people. It makes the audit trail meaningless.

---

## SOP-07 · Routine checks

**Weekly**
```bash
pm2 list                      # backend online, restart count not climbing
df -h                         # disk space - uploads grow over time
ls -la /var/backups/ksrm | tail -3   # backups actually being written
```

**Monthly**
- Skim Audit Logs for anything unexpected
- Confirm SSL renewal is healthy: `sudo systemctl status certbot.timer`
- Review admin accounts — remove anyone who has left
- `cd backend && npm audit --omit=dev`

**Each term**
- Test-restore a backup into a scratch database. An untested backup is not a
  backup.

---

## SOP-08 · Verifying the site after any change

```bash
# pages
for p in / /departments /academics /placements /campus-life /gallery /news \
         /events /downloads /careers /admin/login; do
  printf "%-20s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost$p)"
done

# api
for e in faculty departments gallery news events downloads careers; do
  printf "%-14s %s\n" "$e" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/$e)"
done
```

All should be **200**. Then in a browser: hard-refresh, confirm the ticker has
content, images load, and you can log into the CMS.

---

## SOP-09 · Common problems

| Symptom | Cause | Fix |
|---|---|---|
| Site loads, **no data anywhere** | Frontend built with the wrong API address, or the backend is down | `pm2 list`; check `grep -rl localhost /var/www/ksrm-site/_next \| wc -l` is 0; rebuild per SOP-01 |
| **"Request entity too large"** on upload | Nginx body limit (default 1 MB) | Add `client_max_body_size 200M;` to the server block, `nginx -t && systemctl reload nginx` |
| Images broken after a domain change | Stored addresses still use the old domain | SOP-04 |
| **403** on a page like `/admin/login` | A page file and a folder share a name | Ensure `trailingSlash: true` in `next.config.ts`, rebuild, redeploy |
| **500** on one endpoint | Usually a migration that never ran | `pm2 logs ksrm-backend`; the Prisma error names the missing column |
| Login does nothing | `CORS_ORIGIN` does not include the site's address | Fix in `.env`, `pm2 restart ksrm-backend` |
| Backend down after reboot | PM2 startup not saved | `pm2 save && pm2 startup`, then run the command it prints |

**Always start with the logs:**
```bash
pm2 logs ksrm-backend --lines 60
sudo tail -40 /var/log/nginx/error.log
```

---

## SOP-10 · Security

**On handover, and every time someone leaves:**

1. Change the seeded super-admin password. The default is published in the
   source repository and must not survive go-live. The backend logs a warning at
   startup while it is still in use.
2. `JWT_SECRET` must be a long random value, not the example one.
3. Firewall: only 22, 80 and 443 open. On Hostinger, check **both** `ufw` and
   the hPanel firewall.
4. Never commit `.env` to git.
5. Keep `/admin` off search engines (already handled by `robots.txt`).

**If an account is compromised:** deactivate it, change `JWT_SECRET` and restart
(this signs everyone out), then review Audit Logs for what was changed.

---

## SOP-11 · Escalation

Before contacting a developer, collect:

1. The exact URL
2. The exact error text (a screenshot is ideal)
3. What you were doing
4. `pm2 logs ksrm-backend --lines 60`
5. Whether it affects everyone or one account

Most reported faults are one of: a browser cache needing a hard refresh, an item
left inactive, a section hidden in Display Settings, or a permission the account
does not have. Check those four first.
