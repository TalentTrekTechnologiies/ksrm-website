# Nginx settings — the performance work that cannot be done in code

Three settings on the server. None of them touch a file or a database row;
each is reversible by deleting the block and reloading.

Measured against the live site, not estimated.

---

## 1. Serve the WebP version when one exists

**Saves ~56 MB of transfer across the site. The gallery alone drops 6.3 MB to 3.4 MB.**

Sixty-six images exist in both formats. The code asks for the `.webp`; the
database still points at the original `.jpg` / `.png`, so anything rendered
from the database — the gallery, department cards, campus photos, news and
event images — downloads the large one.

Rather than deleting originals or rewriting database rows, let Nginx pick:

```nginx
# In the http { } block, once:
map $http_accept $webp_suffix {
    default  "";
    "~*webp" ".webp";
}

# In the server { } block for the site:
location ~* ^(?<img>/.+)\.(jpe?g|png)$ {
    add_header Vary Accept;
    # Try the .webp first, fall back to the file that was actually asked for.
    try_files $img$webp_suffix $uri =404;
}
```

Safe by construction: if no `.webp` exists, or the browser does not accept
WebP, `try_files` falls through to the original. Nothing is deleted, the
database is untouched, and a browser that cannot read WebP still gets a JPEG.

`Vary: Accept` matters — without it a cache could hand a WebP to a client that
asked for JPEG.

---

## 2. Compress the API

**/api/downloads is 27 KB and sends 27 KB — no compression at all. JSON
compresses about 85%.**

```nginx
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_types application/json application/javascript text/css text/plain image/svg+xml;
```

Every page makes several API calls, so this is on every page load.

---

## 3. Cache static files

**Images currently return no `Cache-Control` header at all, so every image is
downloaded again on every page view.**

```nginx
location ~* \.(webp|png|jpe?g|svg|woff2|mp4)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This is the one that matters most for someone browsing more than one page.
Without it the image work only helps the first view.

Note the ordering: this block and the WebP block above both match image
requests. Combine them rather than having two — put the `expires` and
`Cache-Control` lines inside the `try_files` location.

---

## Combined

```nginx
map $http_accept $webp_suffix {
    default  "";
    "~*webp" ".webp";
}

server {
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types application/json application/javascript text/css text/plain image/svg+xml;

    location ~* ^(?<img>/.+)\.(jpe?g|png)$ {
        add_header Vary Accept;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $img$webp_suffix $uri =404;
    }

    location ~* \.(webp|svg|woff2|mp4)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Check with `nginx -t` before `systemctl reload nginx`.

Afterwards, confirm:

```bash
# should report content-type: image/webp
curl -sI -H 'Accept: image/webp,*/*' https://ksrmce.ac.in/site-images/topview.jpg | grep -i 'content-type\|vary'

# should still be a JPEG for a client that cannot take WebP
curl -sI -H 'Accept: image/jpeg' https://ksrmce.ac.in/site-images/topview.jpg | grep -i content-type

# should report content-encoding: gzip
curl -sI -H 'Accept-Encoding: gzip' https://ksrmce.ac.in/api/downloads | grep -i content-encoding
```
