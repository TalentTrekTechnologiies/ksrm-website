# KSRMCE — Technical SEO Audit (Phase 1)

**Date:** 2026-08-13
**Scope:** `frontend/` (Next.js 16.2.6 App Router), backend SEO fields, deploy config
**Method:** source inspection + analysis of the committed build output in `frontend/out/`
(85 public HTML pages). Findings below are measured from rendered HTML, not inferred.

---

## A. Current architecture

| Aspect | Reality |
|---|---|
| Framework | Next.js **16.2.6**, App Router, React 19.2.4 |
| Output mode | **`output: "export"`** — fully static export, no server, no serverless |
| Host | Netlify (`frontend/netlify.toml`, publish `out/`); VPS/Nginx variant also present |
| URL style | **`trailingSlash: true`** + `skipTrailingSlashRedirect: true` |
| Images | **`images.unoptimized: true`** — `next/image` performs no optimisation |
| Data flow | Public pages are static shells; CMS content is fetched **client-side** after hydration (`useLiveData` polling) |
| Backend | NestJS + Prisma + PostgreSQL, consumed only at runtime from the browser |
| Public routes | 64 `page.tsx` under `app/` (excl. admin) → **85 built HTML pages** |

**The single most consequential fact:** because the export is static and CMS data
arrives only after hydration, all database-driven content (news, events, faculty,
gallery, statistics, department detail) is **absent from the HTML crawlers receive**.
Google does render JavaScript, but render-budget is deferred and unreliable for a site
of this size. Anything that matters for ranking should be in the static HTML.

---

## B. Current SEO implementation (what already exists — genuinely good)

Credit where due; this is not a greenfield SEO situation:

- `app/robots.ts` — emits `out/robots.txt`, disallows `/admin` + `/dashboard`, declares sitemap and host.
- `app/sitemap.ts` — emits `out/sitemap.xml`, 61 static paths + 8 departments + 4 leadership pages.
- `app/layout.tsx` — full default metadata: title, description, OG, Twitter, `metadataBase`, Google verification via env var.
- One `EducationalOrganization` JSON-LD block in the root layout.
- **30 routes** carry `alternates.canonical` via the sibling-`layout.tsx` pattern (client pages can't export `metadata`, so a server `layout.tsx` carries it — a correct, deliberate workaround).
- `app/departments/[slug]/page.tsx` has real `generateMetadata` — per-department title/description/canonical.
- `deploy/nginx-redirects.conf` — **58 legacy `*.php` → new-route 301s**. Phase 21 is largely already done and done well.
- CSE alias slugs (`aids`, `aiml`, `data-science`, …) already redirect to `/departments/cse` rather than rendering empty shells.
- `alt` attributes: **0 of 26 raw `<img>` tags are missing `alt`**. Image accessibility is in good shape.
- Google Analytics is env-gated and no-ops when unset.

---

## C. Problems discovered

### C1 — Duplicate titles: 27 pages share the homepage title  🔴 CRITICAL

Measured across `out/`:

| Count | Title |
|---|---|
| **27** | `K.S.R.M. College of Engineering \| NAAC A+ \| NBA Accredited` |
| **7** | `About Us \| K.S.R.M. College of Engineering` |
| **6** | `Placements \| K.S.R.M. College of Engineering` |
| 2 | `Mechanical Engineering \| …` |
| 2 | `Humanities & Sciences \| …` |
| 2 | `Careers \| …` |
| 2 | `Admissions \| …` |

**26 public routes export no metadata at all** and silently inherit the root layout's
homepage title and description verbatim.

Affected (no metadata anywhere):
`/academics/academic-calendar`, `/academics/fee-structure`, `/academics/regulations`,
`/alumni`, `/iic`, `/edc`, `/degree-verification`, `/careers/apply`, `/about/ombudsman`,
`/campus-life/{nss,transport,sedg-cell,equal-opportunity-cell,facilities-for-differently-abled,industry-institute-interaction,hostels,library,sports,campus-facilities}`,
`/placements/{our-recruiters,placements-record,internships,mous,trainings}`,
`/dashboard`, `/test`.

### C2 — Layout metadata leaks onto child routes  🔴 CRITICAL

A `layout.tsx` in Next applies to **every descendant route**, not just its own page.

- `app/about/layout.tsx` → all 5 leadership profiles (`/about/chairman`, `/about/principal`, `/about/correspondent`, `/about/managing-director`, `/about/finance-officer`) are titled **"About Us"** with the About description and, worse, all canonicalise to **`/about`** — telling Google those five pages are duplicates of About and should be dropped from the index.
- `app/placements/layout.tsx` → same defect across 6 placements pages, all canonicalising to `/placements`.

This is actively de-indexing 9 real pages. It is worse than having no canonical at all.

### C3 — Sitemap URLs do not match canonical URLs  🔴 CRITICAL

- `next.config.ts` sets `trailingSlash: true`, so real URLs and emitted canonicals are `https://ksrmce.ac.in/news/`.
- `app/sitemap.ts` emits `https://ksrmce.ac.in/news` — **no trailing slash**.

Every one of the ~73 sitemap URLs is a redirect target rather than the canonical URL.
Search Console will report this across the board.

### C4 — Host mismatch: `www` vs non-`www`  🔴 CRITICAL

The live site is **`https://www.ksrmce.ac.in/`**. Every URL in the codebase —
`metadataBase`, sitemap, robots `host`, JSON-LD `url`/`logo`, OG URLs — is
**`https://ksrmce.ac.in`** (no `www`). Canonicals therefore point at a hostname that
redirects, splitting signals between two hosts.

*Requires the user's decision on which host is canonical — see Open Questions.*

### C5 — Homepage has no `<h1>`  🔴 CRITICAL

`out/index.html` contains **0 `<h1>` elements** and 11 `<h2>`. `components/home/Hero.tsx`
renders the institution name as `motion.h2`. The most important page on the domain has
no primary heading.

### C6 — Animated counters ship `0` in the HTML  🔴 CRITICAL

Exactly the failure mode called out in the brief. `components/home/CampusStats.tsx`
initialises `useState(0)`, so the static HTML crawlers receive contains:

```
class="stat-number">0<
class="stat-number">0.00<
class="stat-number">0<   (×6 more)
```

The real figures (46+ years, 35.23 acres, 1200+ intake, 150+ faculty, 7 departments,
15000+ alumni, 200+ recruiters) exist in `FALLBACK_STATS` but never reach the HTML.

### C7 — 35 pages have no canonical  🟠 HIGH

Including the homepage itself. (Overlaps C1; also covers the 8 alias redirect pages.)

### C8 — OG image is a 404  🟠 HIGH

Root layout points OG and Twitter cards at `https://ksrmce.ac.in/og-image.jpg`.
**No such file exists in `frontend/public/`.** Every social/WhatsApp share of any KSRMCE
page currently renders with a broken preview image.

### C9 — Invented / inconsistent social profiles in JSON-LD  🟠 HIGH

Root layout `sameAs` claims:
`facebook.com/ksrmce`, `twitter.com/ksrmce`, `linkedin.com/company/ksrmce`.

`components/layout/Footer.tsx` uses entirely different handles:
`facebook.com/ksrmceofficial`, `twitter.com/ksrmceofficial`, `instagram.com/ksrmceofficial`,
`youtube.com/ksrmceofficialmedia`.

Both sets are unverified and they contradict each other. This violates the brief's
"do not invent social profiles" rule and risks an entity-mismatch in Google's Knowledge Graph.

### C10 — Structured data is one block, sitewide  🟠 HIGH

Only `EducationalOrganization` exists, in the root layout. Absent: `WebSite`,
`BreadcrumbList`, `Course`, `Article`, `Event`, `Person`, `CollegeOrUniversity`.
No page-level schema anywhere.

### C11 — Breadcrumbs are visual only  🟠 HIGH

~14 pages render breadcrumb trails as styled markup (`.ug-breadcrumb` etc.) with
**no `BreadcrumbList` JSON-LD and no `<nav aria-label>` semantics**. The visual work is
already done; only the machine-readable layer is missing.

### C12 — Duplicate department URLs self-canonicalise  🟠 HIGH

`/departments/mech/` and `/departments/mechanical/` are two full pages with identical
content, each canonicalising to *itself*. Same for `/departments/hs/` and
`/departments/humanities-sciences/`. Confirmed duplicate content.

### C13 — 8 alias pages are indexable 200s, not redirects  🟠 HIGH

`/departments/{aids,ai-ds,ai-ml,aiml,cse-ds,cse-aiml,data-science}` use `redirect()`,
which under static export emits a **14 KB HTML page returning 200** with the generic
homepage title, no H1 and no canonical — instead of a 301.

### C14 — CMS SEO fields exist but are dead  🟠 HIGH

`schema.prisma` defines `PageBanner.metaTitle / metaDescription / ogImageUrl` and the
same three on `Department`. `grep` across `app/`, `components/`, `lib/`, `types/`
confirms **the frontend never reads any of them** (only `lib/departments-api.ts` types
them; `lib/audit-describe.ts` labels them). Admins can fill these fields and nothing
happens anywhere on the site.

### C15 — No indexable URLs for news, events or faculty  🟠 HIGH

- `/news` and `/events` are single client-rendered index pages. There is **no `/news/[slug]` or `/events/[slug]` route**. Individual news items link out to raw PDF media files.
- There is **no `/faculty` route at all**; ~180 faculty records render only inside department pages, client-side.
- `News.slug String? @unique` already exists in the schema. `Event` has no slug field.

*This is a feature addition with a deployment implication — see Open Questions.*

### C16 — Performance  🟠 HIGH

- **4.2 MB total JS** in `_next/static`; largest single chunk **347 KB**.
- `images.unoptimized: true` — no resizing, no WebP/AVIF negotiation, no `srcset`.
- Oversized assets shipped raw: exam staff photos at **7.7 MB / 6.6 MB / 6.3 MB / 4.6 MB / 4.2 MB / 3.7 MB**, `diploma-banner.png` 2.3 MB, `b-tech-banner.png` 2.3 MB, `logo.png` 1.4 MB (duplicated at `site-images/logo.png`).
- Only 2 files import `next/image`; 26 raw `<img>` tags carry no `width`/`height` → CLS risk.

### C17 — Sitemap omissions  🟡 MEDIUM

Built and indexable but absent from `sitemap.ts`:
`/about/finance-officer` (the `LEADERSHIP_SLUGS` array lists 4 of the 5 built profiles),
`/campus-life/college-fest`, `/campus-life/equal-opportunity-cell`,
`/campus-life/facilities-for-differently-abled`, `/campus-life/health-facilities`,
`/campus-life/industry-institute-interaction`, `/campus-life/sedg-cell`,
`/kgcet`, `/mandatory-disclosure`.

Sitemap is also hand-maintained in parallel with the routes — it has already drifted
and will drift again.

### C18 — Junk routes in the production build  🟡 MEDIUM

- `/test/` — ships with title `Page | K.S.R.M. College of Engineering` and `<h1>Page</h1>`.
- `/dashboard/` — renders literally `Coming Soon`. Robots-disallowed, but still built and linkable.

### C19 — Legacy 301s chain  🟡 MEDIUM

`deploy/nginx-redirects.conf` targets non-trailing-slash paths (`/departments/cse`)
while the site's canonical form is `/departments/cse/`. Each legacy hit becomes
301 → 301 rather than a single hop.

### C20 — Accessibility gaps affecting SEO  🟡 MEDIUM

Alt text is in good shape. Remaining: no skip-link, breadcrumb trails lack
`<nav aria-label="Breadcrumb">`, and the homepage H1 gap (C5) is itself a heading-order
defect (page starts at `<h2>`).

### C21 — No `noindex` on thin/utility pages  🟢 LOW

`/careers/apply`, `/dashboard`, `/test` and the alias pages carry no robots directive.

---

## D. Priority ranking

### 🔴 Critical — actively costing rankings today
| # | Issue |
|---|---|
| C1 | 27 pages share the homepage title; 26 routes have no metadata |
| C2 | Layout metadata de-indexes 9 leadership/placements pages via wrong canonicals |
| C3 | Every sitemap URL mismatches its canonical (trailing slash) |
| C4 | `www` vs non-`www` host mismatch across all absolute URLs |
| C5 | Homepage has no `<h1>` |
| C6 | Statistics render as `0` / `0.00` in crawlable HTML |

### 🟠 High
C7 missing canonicals · C8 broken OG image · C9 invented `sameAs` · C10 no page-level schema ·
C11 breadcrumbs unmarked · C12 duplicate department URLs · C13 alias pages are 200s ·
C14 dead CMS SEO fields · C15 no news/event/faculty URLs · C16 performance

### 🟡 Medium
C17 sitemap omissions + drift · C18 junk routes · C19 redirect chains · C20 a11y gaps

### 🟢 Low
C21 missing `noindex` on utility pages

---

## E. Implementation plan

Ordered by value-per-risk. Every step preserves existing layout, styling and CMS behaviour.

**Step 1 — Central SEO config** *(new `lib/seo.ts`)*
Single source of truth for site URL, name, and a `pageMetadata()` helper producing
title + description + canonical + OG + Twitter consistently. Fixes C4 (one constant to
change) and stops future drift. Canonicals emitted **with** trailing slash to match
`next.config.ts`.

**Step 2 — Metadata for all 26 uncovered routes** *(C1)*
Reuse the existing sibling-`layout.tsx` convention for client pages; `export const
metadata` directly on server pages. Titles follow the brief's Phase-4 patterns. No
component or visual change.

**Step 3 — Fix layout metadata leakage** *(C2)*
Add `generateMetadata` to `app/about/[slug]/page.tsx` (per-leader title + own canonical)
and per-page metadata to the 5 `/placements/*` children. This alone recovers 9 pages.

**Step 4 — Sitemap rebuild** *(C3, C17)*
Trailing-slash-consistent URLs, correct host, add the 9 missing routes, add
`/about/finance-officer`, exclude alias duplicates, and derive department/leadership
slugs from the existing data modules so it cannot drift again. Differentiated
`priority`/`changeFrequency` instead of a flat 0.7.

**Step 5 — Homepage semantics + real stat values** *(C5, C6)*
- `Hero.tsx`: promote the institution name to `<h1>`, keep the tagline and all animation. Visual output unchanged (heading level only).
- `CampusStats.tsx`: initialise `useState(target)` so the true value is server-rendered, then reset to 0 and animate **inside** the IntersectionObserver effect (client-only). Crawler sees `46+`; users still see the count-up.

**Step 6 — Structured data** *(C10, C11)*
- Root: keep `EducationalOrganization`, correct it (see C9 decision), add `WebSite`.
- New `components/seo/JsonLd.tsx` + `BreadcrumbJsonLd` — attach `BreadcrumbList` to the ~14 pages that already show breadcrumbs visually, plus `<nav aria-label="Breadcrumb">` semantics (C20).
- `Course` schema on department pages, sourced from existing programme data only.
- **No** FAQ/Review/Rating schema. Nothing not visible on the page.

**Step 7 — Canonicalise duplicates and aliases** *(C12, C13)*
- Point `/departments/mechanical/` and `/departments/humanities-sciences/` canonicals at `/departments/mech/` and `/departments/hs/`.
- Add real 301s for the 8 CSE aliases in `netlify.toml` + `nginx-redirects.conf`; mark the emitted shells `noindex`.
- Normalise legacy 301 targets to trailing-slash form (C19).

**Step 8 — OG image** *(C8)*
Generate a 1200×630 OG image from existing approved brand assets (logo + campus photo
already in `public/`) and commit it. No new imagery invented.

**Step 9 — Wire CMS SEO fields** *(C14)*
Build-time fetch of `PageBanner.metaTitle/metaDescription/ogImageUrl` and the
`Department` equivalents, feeding `generateMetadata` with the hardcoded values as
fallback. Wrapped in try/catch so a backend outage degrades to current behaviour
instead of failing the Netlify build. Admin UI unchanged.

**Step 10 — Performance** *(C16)*
Compress the oversized assets (7.7 MB exam photos, 2.3 MB banners, 1.4 MB duplicated
logo), add `width`/`height` to raw `<img>` tags to kill CLS, and add `loading="lazy"` /
`decoding="async"` below the fold. **No redesign, no component replacement.**

**Step 11 — Hygiene** *(C18, C21)*
Delete `/test`. Add `robots: { index: false }` to `/careers/apply` and `/dashboard`.

**Step 12 — Verify**
`npm run build`, TypeScript check, `npm run lint`, then re-run this audit's measurement
scripts against the new `out/` to produce measured before/after numbers.

---

## Open questions (need the user's answer — I will not guess)

1. **Canonical host: `www.ksrmce.ac.in` or `ksrmce.ac.in`?**
   The brief cites the `www` form; all code uses non-`www`. This decision propagates to
   canonicals, sitemap, robots, JSON-LD and OG. Whichever is chosen, the other must
   301 at the server/DNS layer.

2. **Social profiles.** Neither the JSON-LD set nor the footer set is verified, and they
   contradict each other. Options: (a) supply the real verified URLs, (b) drop `sameAs`
   entirely until verified. Per the brief's "do not invent" rule, **(b) is the safe
   default** and my recommendation absent confirmation.

3. **Per-item news/event pages (C15).** Technically straightforward, but under
   `output: "export"` a newly published news item gets no page **until the site is
   rebuilt**. Doing this properly needs a Netlify build hook fired on publish. Options:
   (a) build the routes + wire the rebuild hook, (b) build the routes now and rebuild
   on the existing schedule, (c) defer to a later phase.

4. **Verified institutional facts.** `foundingDate: "1980"` and `numberOfEmployees: "150+"`
   are currently asserted in JSON-LD; `FALLBACK_STATS` says 46+ years (→ 1979/1980) and
   150+ faculty. Please confirm the founding year so schema and visible content agree.
