# VPS Production Deployment — K.S.R.M. College of Engineering

Going live on a VPS with the real domain (`ksrmce.ac.in`), replacing the old
PHP site. Follow the sections in order. Written for a **Hostinger VPS running
Ubuntu 22.04/24.04**, driven over SSH.

Two things a VPS fixes that the free Render tier could not:
uploaded media now lives on a real disk (it stops disappearing), and there is
no cold start.

---

## 0. Before you start — decide these

| Thing | Value |
|---|---|
| Site domain | `ksrmce.ac.in` (and `www.`) |
| Backend/API domain | `api.ksrmce.ac.in` (recommended) |
| Admin/CMS domain | `cms.ksrmce.ac.in` (see section 6b) |
| DB name / user | `ksrm_db` / `ksrm` |
| Where the app lives | `/var/www/ksrm` |
| Where uploads live | `/var/www/ksrm-media` ← **outside the repo, so `git pull` never touches it** |

Point all three DNS A-records (`@`/`www`, `api`, `cms`) at the VPS IP before requesting SSL.

---

## 0b. Hostinger VPS — first login and the two gotchas

**OS template.** In hPanel → VPS → *Operating System*, use plain **Ubuntu 22.04
or 24.04**, not a template that ships a control panel (CyberPanel/Plesk/CloudPanel).
Those bind their own Nginx/Apache to ports 80/443 and will fight the config in
section 6. If the VPS was created with one, reinstall the OS as plain Ubuntu
before going further — do it now, it wipes the disk.

**Connect.** Hostinger gives you the IP and root password in hPanel → VPS →
*Overview* / *SSH access*.

```bash
ssh root@YOUR_VPS_IP
```

**Create a non-root user** (do not run the app as root):

```bash
adduser ksrm
usermod -aG sudo ksrm
rsync --archive --chown=ksrm:ksrm ~/.ssh /home/ksrm   # if you use SSH keys
su - ksrm
```

From here on, run everything as `ksrm`.

### Gotcha 1 — Hostinger's own firewall

Hostinger has a firewall **in hPanel**, separate from `ufw` on the server. If
ports 80 and 443 are not open there, the site is unreachable no matter how
correct Nginx is, and certbot will fail with a confusing timeout.

hPanel → VPS → **Firewall** → allow **22 (SSH), 80 (HTTP), 443 (HTTPS)**.

Then also configure `ufw` on the server (section 8). Both must allow the port.

### Gotcha 2 — DNS lives where the domain is registered

`ksrmce.ac.in` is an existing domain already serving the old site, so its DNS is
almost certainly **not** at Hostinger. Change the A-records wherever the domain's
nameservers actually point (check with `dig NS ksrmce.ac.in +short`).

Create/point these at the VPS IP:

| Record | Name | Value |
|---|---|---|
| A | `@` | VPS IP |
| A | `www` | VPS IP |
| A | `api` | VPS IP |
| A | `cms` | VPS IP |

**Do the cutover deliberately.** The moment `@` points at the VPS, visitors get
the new site. Sensible order:

1. Point **`api`** and **`cms`** first, and deploy/verify everything on those.
2. Test the public site meanwhile via the VPS IP or a temporary subdomain.
3. Only then switch **`@`** and **`www`**, once you are happy.

Lower the TTL on the old records to ~300s a day beforehand if you can, so the
switch propagates quickly and can be reverted fast.

Check propagation before requesting SSL:

```bash
dig +short ksrmce.ac.in api.ksrmce.ac.in cms.ksrmce.ac.in
```

### Sizing note

Hostinger's smaller VPS plans (1 vCPU / 4 GB) run this fine, but `npm run build`
on the frontend is memory-hungry. If the build is killed, add swap:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 1. Server packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib

# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

node -v && psql --version && nginx -v
```

---

## 2. PostgreSQL

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE ksrm_db;
CREATE USER ksrm WITH ENCRYPTED PASSWORD 'PUT-A-STRONG-PASSWORD-HERE';
GRANT ALL PRIVILEGES ON DATABASE ksrm_db TO ksrm;
\c ksrm_db
GRANT ALL ON SCHEMA public TO ksrm;
\q
```

---

## 3. Get the code

```bash
sudo mkdir -p /var/www/ksrm && sudo chown -R $USER:$USER /var/www/ksrm
git clone https://github.com/TalentTrekTechnologiies/ksrm-website.git /var/www/ksrm
cd /var/www/ksrm

# Uploads directory, deliberately outside the repo so `git pull` never touches it
sudo mkdir -p /var/www/ksrm-media && sudo chown -R $USER:$USER /var/www/ksrm-media
```

---

## 4. Backend

### 4a. Environment

```bash
cd /var/www/ksrm/backend
cp .env.example .env
nano .env
```

Set at minimum:

```ini
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://ksrm:YOUR-DB-PASSWORD@localhost:5432/ksrm_db?schema=public"

# Long random string. Generate: openssl rand -base64 48
JWT_SECRET="..."

# Every origin the browser will call the API from, comma separated.
CORS_ORIGIN="https://ksrmce.ac.in,https://www.ksrmce.ac.in,https://cms.ksrmce.ac.in"

# Public URL of the API + where uploads are stored on disk.
MEDIA_BASE_URL="https://api.ksrmce.ac.in"
MEDIA_STORAGE_ROOT="/var/www/ksrm-media"

# Email (career application notifications). Use smtp in production.
EMAIL_PROVIDER=smtp
EMAIL_FROM="noreply@ksrmce.ac.in"
HR_NOTIFICATION_EMAIL="hr@ksrmce.ac.in"
SMTP_HOST="..."
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="..."
SMTP_PASS="..."
```

### 4b. Install, migrate, seed, build

```bash
cd /var/www/ksrm/backend
npm ci
npx prisma generate
npx prisma migrate deploy   # creates every table incl. PageTable + academicYear
npx prisma db seed          # permissions, roles, super admin, site settings
npm run build
```

> `migrate deploy` is additive and safe to re-run. `db seed` upserts by key —
> it will not overwrite settings you have already changed.

### 4c. Run it under PM2

```bash
cd /var/www/ksrm/backend
pm2 start dist/main.js --name ksrm-api
pm2 save
pm2 startup      # run the command it prints, so it survives reboot
pm2 logs ksrm-api --lines 50
```

---

## 5. Frontend (static export)

The API URL is **baked in at build time**, so it must be set before building.

```bash
cd /var/www/ksrm/frontend
npm ci

cat > .env.local <<'EOF'
NEXT_PUBLIC_API_URL=https://api.ksrmce.ac.in
# Fill these in once you have them (see section 9)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
EOF

npm run build     # produces frontend/out
```

Sanity check before serving — the built files must point at the real API:

```bash
grep -rl "api.ksrmce.ac.in" out/_next | head -1   # expect a match
grep -rl "localhost:4000" out/_next | head -1     # expect NOTHING
```

---

## 6. Nginx

```bash
sudo nano /etc/nginx/sites-available/ksrm
```

```nginx
# ---------- API ----------
server {
    listen 80;
    server_name api.ksrmce.ac.in;

    client_max_body_size 200M;   # media uploads

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}

# ---------- Public site ----------
server {
    listen 80;
    server_name ksrmce.ac.in www.ksrmce.ac.in;

    root /var/www/ksrm/frontend/out;
    index index.html;

    # 301s from the OLD PHP site. Keeps existing Google rankings and inbound
    # links working. MUST come before the location / block below.
    include /var/www/ksrm/deploy/nginx-redirects.conf;

    # Hashed build assets are immutable; HTML must always revalidate.
    location /_next/static/ { expires 1y; add_header Cache-Control "public, immutable"; }
    location = /index.html  { add_header Cache-Control "public, max-age=0, must-revalidate"; }

    # Next's static export writes /about.html for /about.
    location / {
        try_files $uri $uri.html $uri/index.html /404.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ksrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6b. Separate admin URL (`cms.ksrmce.ac.in`)

The admin panel is part of the same static export (it lives under `/admin`), so
it does not need its own build — just its own hostname pointed at the same
files, with `/` landing on the login page.

Keeping the CMS on its own hostname means the public site never advertises an
admin path, and the admin host can be locked down independently (see below).

```nginx
# ---------- Admin / CMS ----------
server {
    listen 80;
    server_name cms.ksrmce.ac.in;

    root /var/www/ksrm/frontend/out;
    index index.html;

    # Land straight on the login page.
    location = / { return 302 /admin/login; }

    location /_next/static/ { expires 1y; add_header Cache-Control "public, immutable"; }

    location / {
        try_files $uri $uri.html $uri/index.html /404.html;
    }

    # Never indexed - the header below is enough, and needs no inline
    # robots.txt string in the config.

    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
```

Then, on the **public** server block from section 6, stop `/admin` being
reachable there at all, so there is exactly one way in:

```nginx
    # inside the ksrmce.ac.in server block
    location /admin { return 301 https://cms.ksrmce.ac.in$request_uri; }
```

Include `cms.ksrmce.ac.in` in the certbot command in section 7, and make sure
it is listed in `CORS_ORIGIN` (section 4a) — the admin calls the API from that
origin, and a missing entry is the classic "login does nothing" symptom.

### Optional hardening for the CMS host

Because it is a separate server block, you can restrict it without touching the
public site — e.g. limit it to the college's network:

```nginx
    # allow 203.0.113.0/24;   # college IP range
    # deny  all;
```

Only do this if staff always work from a known network; it will lock out
anyone editing from home or a phone.

---

## 7. SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ksrmce.ac.in -d www.ksrmce.ac.in -d api.ksrmce.ac.in -d cms.ksrmce.ac.in
sudo systemctl status certbot.timer     # auto-renewal
```

Certbot rewrites the Nginx files to serve HTTPS and redirect HTTP.

---

## 8. Security — do not skip

1. **Change the seeded super-admin password.** `SuperAdmin@123` is public in
   this repo. Log into `/admin/login`, change it immediately. The backend logs
   a warning on boot while the default is still in use.
2. Confirm `JWT_SECRET` is a real random value, not the example.
3. Firewall:
   ```bash
   sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
   ```
4. Postgres is bound to localhost by default — keep it that way.
5. Review dependency advisories: `cd backend && npm audit --omit=dev`.

---

## 9. Search visibility

The site replaces an already-indexed domain, so this is about **keeping** the
rankings, not building them.

1. Verify the site in **Google Search Console** (HTML tag method) → put the
   token in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, rebuild the frontend.
2. Submit `https://ksrmce.ac.in/sitemap.xml`.
3. Add the **Google Analytics** ID to `NEXT_PUBLIC_GA_ID`, rebuild.
4. Watch Search Console → Coverage for 404s in the first fortnight; every old
   `.php` URL should 301, not 404 (that is what section 6's include does).

---

## 10. Go-live smoke test

```bash
curl -I https://ksrmce.ac.in                     # 200
curl -I https://ksrmce.ac.in/departments         # 200
curl -I https://api.ksrmce.ac.in/exam-notifications  # 200
curl -I https://ksrmce.ac.in/csen.php            # 301 -> /departments/cse
curl -I https://cms.ksrmce.ac.in                 # 302 -> /admin/login
curl -I https://ksrmce.ac.in/admin/login         # 301 -> cms host
curl -s https://ksrmce.ac.in/robots.txt | head -3
curl -s https://ksrmce.ac.in/sitemap.xml | grep -c "<url>"   # ~62
```

In a browser, confirm: admin login works, uploading an image in Media Library
succeeds **and survives `pm2 restart ksrm-api`** (this is the thing that was
broken on the free tier), and a public page shows CMS content.

---

## 11. Updating the site later

```bash
cd /var/www/ksrm
git pull

# backend changed?
cd backend && npm ci && npx prisma migrate deploy && npm run build && pm2 restart ksrm-api

# frontend changed?
cd ../frontend && npm ci && npm run build && sudo systemctl reload nginx
```

Uploaded media lives in `/var/www/ksrm-media`, outside the repo, so it is never
touched by a deploy.

---

## 12. Backups (set this up in week one)

```bash
# nightly DB dump at 02:00, keep 14 days
sudo mkdir -p /var/backups/ksrm && sudo chown $USER:$USER /var/backups/ksrm
crontab -e
```
```cron
0 2 * * * pg_dump -U ksrm ksrm_db | gzip > /var/backups/ksrm/db-$(date +\%F).sql.gz
30 2 * * * tar czf /var/backups/ksrm/media-$(date +\%F).tar.gz /var/www/ksrm-media
0 3 * * * find /var/backups/ksrm -mtime +14 -delete
```

Copy the backups off the VPS periodically — a backup on the same machine is not
a backup.
