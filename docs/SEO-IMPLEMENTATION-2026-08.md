# KSRMCE — SEO Implementation Report

**Date:** 2026-08-13
**Audit:** [SEO-AUDIT-2026-08.md](./SEO-AUDIT-2026-08.md)
**Verification:** `npm run build` → `npm run seo:audit` (21/21 checks pass, 0 critical failures)

All figures below are measured from the built static export in `frontend/out/`, before
and after, using `frontend/scripts/seo-audit.mjs`. Nothing here is estimated.

---

## Decisions taken by the client

| Question | Decision |
|---|---|
| Canonical host | **`https://ksrmce.ac.in`** (non-www). `www` must 301 to apex at the server. |
| Social profiles in schema | **Drop `sameAs`** until the real profile URLs are verified. |
| Per-item news/event pages | **Deferred** to a later phase (needs a rebuild-on-publish hook). |
| Scope | SEO fixes **+ safe performance work** (no component rewrites, no bundle surgery). |
| Deployment target | **Nginx on the Hostinger VPS.** Netlify config removed as dead weight. |

---

## 1. SEO score — before and after

Scored against the 21 automated checks in `scripts/seo-audit.mjs`, which cover the
items the audit found broken.

**Both numbers are measured, not estimated.** The "before" figure comes from checking
out the pre-change tree (`git stash`), running a full production build, and running the
same audit script against it.

| | Before | After |
|---|---|---|
| Automated checks passing | **10 / 21** | **21 / 21** |
| Critical failures | **7** | **0** |
| Indexable pages | 79 | 69 (10 duplicate/thin pages removed from the index) |
| Pages sharing a duplicate title | **42** (5 collision groups) | **0** |
| Pages sharing a duplicate description | **42** (5 collision groups) | **0** |
| Indexable pages missing a canonical | **30** | **0** |
| Pages with a broken/absent `og:image` | **79** | **0** |
| Sitemap URLs matching their canonical | **0 / 63** | **69 / 69** |
| Homepage counters rendering as `0` | **8** | **0** |
| Structured-data types emitted | 1 | **6** |

**Score: 48% → 100%** on the measured checks. That is a measurement of the defects
found and fixed, not a claim about rankings — ranking movement depends on Google
recrawling, and the outstanding www redirect (§12) gates part of it.

---

## 2. Technical SEO changes

**New: `frontend/lib/seo.ts`** — one source of truth for the site origin, name, OG
image and a `pageMetadata()` helper that emits title, description, canonical, Open
Graph and Twitter consistently. The origin was previously re-typed in four files and
~30 route layouts hand-assembled their own metadata objects, which is how the sitemap
drifted out of trailing-slash agreement with the canonicals it was supposed to mirror.

**New: `frontend/scripts/seo-audit.mjs`** (`npm run seo:audit`) — re-checks every
defect found in this audit against the built HTML and exits non-zero on any critical
regression, so it can gate a deploy. Each of these problems shipped silently once
already; they are now caught at build time rather than in Search Console weeks later.

---

## 3. Metadata changes

| Change | Detail |
|---|---|
| 26 routes had **no metadata at all** | All now covered — 15 via sibling `layout.tsx` (client pages can't export `metadata`), 11 via direct `export const metadata`. |
| **42 pages** shared a title across 5 collision groups | Now 0. Largest group: 25 pages inheriting the homepage title verbatim. Every indexable page has a unique title and description. |
| **Layout metadata leakage** | `app/about/layout.tsx` applied to all 5 leadership profiles — every one titled "About Us" **and canonicalised to `/about`**, actively telling Google to drop them. Fixed with `generateMetadata` on `app/about/[slug]/page.tsx`, using each leader's own published words as the description. Same defect fixed across 6 `/placements/*` pages. **9 pages recovered.** |
| 33 hand-built metadata blocks | Migrated to `pageMetadata()`; OG URLs now carry trailing slashes and every page gained a Twitter card. |
| Homepage title | `K.S.R.M. College of Engineering \| NAAC A+ \| NBA Accredited` → **`K.S.R.M. College of Engineering, Kadapa \| KSRMCE`** (per the brief's Phase 4). |

---

## 4. Sitemap changes

`app/sitemap.ts` rewritten:

- **Trailing slashes fixed.** Every URL previously pointed at a redirect (`/news` when the canonical is `/news/`). All URLs now go through the same `absoluteUrl()` helper the canonicals use, so they cannot disagree again.
- **Drift eliminated.** Routes are now discovered by walking `app/` at build time instead of being typed by hand. The old list had already fallen behind by 9 live routes, including `/about/finance-officer` (the `LEADERSHIP_SLUGS` array listed 4 of 5 profiles), `/kgcet` and `/mandatory-disclosure`. Leadership entries are derived from `data/leadership.ts`, so a new leader can never be left out.
- **Duplicates and noindex pages excluded** — alias department slugs and the three thin CMS shells.
- **Differentiated `priority`/`changeFrequency`** instead of a flat 0.7 on everything.

Result: **69 canonical URLs**, all trailing-slash and host consistent.

---

## 5. robots.txt changes

Added `/api/` and `/careers/apply` to the disallow list; kept `/admin` and `/dashboard`.
Now sourced from `lib/seo.ts` so the host cannot drift from the canonicals.

Deliberately **not** blocked: `/_next/`. Blocking it would stop Google rendering the
pages at all, which on a client-hydrated site would hide most of the content.
An automated check enforces this.

---

## 6. Schema changes

Moved into `components/seo/JsonLd.tsx` and `components/seo/RouteBreadcrumbs.tsx`.

| Type | Coverage | Note |
|---|---|---|
| `CollegeOrUniversity` | 121 pages | Was `EducationalOrganization`; more specific type, stable `@id`. |
| `WebSite` | 121 pages | New — associates the domain with the institution. |
| `BreadcrumbList` | 45 pages | New — derived from the URL, so trails can't contradict the nav. |
| `Course` | 14 (department pages) | New — only the programmes each department actually lists. |

**Corrections made to the existing Organization schema:**

- **`sameAs` removed.** It claimed `facebook.com/ksrmce`, `twitter.com/ksrmce` and `linkedin.com/company/ksrmce`, while `Footer.tsx` used four entirely different `…ksrmceofficial` handles. Both sets were unverified and contradicted each other; binding the wrong accounts to the college's Knowledge Graph entity is hard to undo.
- **`numberOfEmployees: "150+"` removed** — schema.org expects a number or `QuantitativeValue`, not a marketing string.
- `foundingDate: "1980"` **kept and verified** against the Correspondent's own published message in `data/leadership.ts` ("since it's existence from 1980").

No `Review`, `AggregateRating` or `FAQPage` markup was added anywhere; the site
publishes no reviews or ratings and inventing them is a manual-action risk. An
automated check enforces this permanently.

---

## 7. Page-by-page changes

| Area | Change |
|---|---|
| **Homepage** | Added the missing `<h1>` (the page had **zero**, opening at `<h2>`). Institution name is now the h1; the CMS-editable tagline stays exactly as it was. Title, canonical and description now homepage-specific. |
| **Homepage statistics** | `CampusStats.tsx` server-rendered `0`, `0.00` and six more zeroes into the HTML — the count-up only ran in the browser. Counters now seed with the real value (`46+`, `35.23`, `1,200+`, `150+`, `7`, `12 LPA`, `15,000+`, `200+`) and reset to 0 client-side inside the IntersectionObserver effect. **Animation unchanged for users; crawlers now see the real figures.** |
| **Departments** | Descriptions now combine tagline + About text instead of a sub-60-character tagline. `Course` and `BreadcrumbList` schema added. |
| **Leadership (5 pages)** | Own titles, descriptions and self-canonicals; breadcrumb uses the person's name. |
| **Placements (6 pages)** | Each child page now has its own metadata instead of inheriting the section's. |
| **Campus Life, Academics, Alumni, IIC, EDC, etc.** | 26 previously bare routes given unique metadata. |
| **`/test`** | Deleted — shipped to production with title `Page` and `<h1>Page</h1>`. |
| **`/dashboard`, `/careers/apply`** | `noindex, follow` — placeholder and PII form, no search value. |

### Duplicate content resolved

- **7 CSE alias pages** (`/departments/aids`, `ai-ds`, `ai-ml`, `aiml`, `cse-ds`, `cse-aiml`, `data-science`) used Next's `redirect()`, which a static export cannot turn into a 301 — it emitted a **14 KB HTML page returning 200** with the generic homepage title, no `<h1>` and no canonical. They are no longer built; real 301s in `deploy/nginx-redirects.conf` serve them.
- **`/departments/mechanical` and `/departments/humanities-sciences`** were full copies of `/departments/mech` and `/departments/hs`, each canonicalising to itself. Now 301s.
- **3 thin CMS shells** (`/academics/admissions`, `/academics/diploma`, `/campus-life/edc`) duplicated far richer pages. Given `noindex, follow` rather than a cross-URL canonical (the content is not equivalent, which is what `rel=canonical` asserts), their internal links repointed to the real pages, and excluded from the sitemap. **Not** redirected — they may hold CMS copy, and redirecting would make it unreachable.

---

## 8. Legacy URL handling

`deploy/nginx-redirects.conf` already carried 58 well-chosen `*.php` → new-route 301s.
Changes made:

- **All 56 targets given trailing slashes.** Every legacy hit was a 301 → 301 chain, because `/departments/cse` itself redirects to `/departments/cse/`. Chains pass less signal, and these are precisely the URLs the file exists to preserve.
- **`/edc.php` retargeted** from `/campus-life/edc/` (the thin shell, now noindexed) to `/edc/` — the legacy redirect was landing traffic on the weaker of the two EDC pages.
- **9 department alias 301s added**, using regex so both `/departments/aids` and `/departments/aids/` match.
- **www → apex canonicalisation documented** with a ready-to-paste server block.

No PDF or legacy document was deleted.

---

## 9. Performance

`next.config.ts` sets `images.unoptimized: true` (required by `output: "export"` without
a loader), so whatever is in `public/` is exactly what the browser downloads.

**New: `frontend/scripts/compress-public-images.mjs`** (`npm run images:compress`) —
recompresses in place, same path and same format, so no `<img src>` or CMS-stored URL
can break. Never deletes, never renames, never converts format, and skips any file that
does not actually get smaller.

| | Before | After |
|---|---|---|
| Images over 400 KB in `public/` | 49 | **6** |
| Total weight of processed images | **90.5 MB** | **10.4 MB** (−88.5%) |
| Largest gallery original | 18.4 MB (7008×4672) | **231 KB** |
| Largest staff portrait | 7.7 MB (3016×4021) | **463 KB** |
| `logo.png` (on every page) | 1.37 MB | **269 KB** |
| `b-tech-banner.png` | 2.3 MB | 625 KB |

Quality was spot-checked visually on the logo, the poster banner and the most
aggressively reduced portrait — no visible degradation.

Also: `decoding="async"` added to all 26 lazy-loaded images.

**Two audit findings corrected on closer inspection** — both were less severe than the
first pass suggested:

- *Lazy loading:* already correct. All 26 raw `<img>` tags already carried `loading="lazy"`.
- *CLS from missing `width`/`height`:* overstated. The CSS already reserves space via explicit heights (104px, 120px, 220px, 320px) and `aspect-ratio`, so adding the attributes would have been redundant and risked conflicting with the fixed heights. Left alone deliberately.

The 4.2 MB JS bundle is **unchanged** — reducing it needs component-level work that
falls outside the agreed "no bundle surgery" scope. See remaining issues.

---

## 10. Accessibility

- Homepage `<h1>` added — the page previously began at heading level 2.
- The two visible breadcrumb trails (`/campus-life/hostels`, `/kgcet`) are now `<nav aria-label="Breadcrumb">` with `aria-current="page"`, instead of unlabelled `<div>`s.
- `hostels` breadcrumb links converted from raw `<a>` to `next/link` — they were forcing a full page reload.
- Alt text was already in good shape: **0 of 26** raw `<img>` tags were missing `alt`.

---

## 11. CMS SEO support — audited, not built (and why)

The brief asked whether admins can manage SEO fields. **They cannot**, and the gap is
larger than the frontend:

| Surface | DB column | API | Admin UI | Frontend reads it |
|---|---|---|---|---|
| `PageBanner.metaTitle` / `metaDescription` / `ogImageUrl` | ✅ | ❌ **no module at all** | ❌ | ❌ |
| `Department.metaTitle` / `metaDescription` / `ogImageUrl` | ✅ | ✅ (DTO accepts them) | ❌ | ❌ |

`PageBanner` exists only as a Prisma model — there is no controller, service, or
endpoint anywhere in `backend/src`. `Department`'s SEO fields are accepted by the API
but no admin screen exposes them and nothing reads them back.

**This was deliberately not half-built inside an SEO pass.** Wiring the frontend to
fields no admin can set delivers nothing, and building the missing backend module plus
admin UI is a feature in its own right — with the same rebuild-on-publish dependency
that led to deferring per-item news pages. Recommended sequence when it is picked up:

1. Add the three SEO inputs to the department workspace Profile tab (the API already accepts them).
2. Build the `PageBanner` module + admin screen, or drop the unused table.
3. Add a build-time fetch in `generateMetadata`, wrapped in try/catch with the current hardcoded values as fallback, so a backend outage degrades instead of failing the build.
4. Add a rebuild hook so a metadata edit reaches the live site without a manual deploy.

---

## 12. Remaining SEO issues

| Issue | Severity | Note |
|---|---|---|
| **www → apex 301 not yet configured** | 🔴 Critical | The only remaining critical item, and it is a server change, not a code one. Until it exists, both hosts serve the site and split signals. Block is written into `deploy/nginx-redirects.conf`. |
| CMS SEO fields unusable | 🟠 High | See §11. |
| No per-item news/event/faculty URLs | 🟠 High | Deferred by decision. `News.slug` already exists; `Event` would need a migration. |
| 4.2 MB JS bundle | 🟠 High | Out of agreed scope. Biggest chunk 347 KB. Worth a dedicated pass. |
| Visible breadcrumbs on only 3 pages | 🟡 Medium | `BreadcrumbList` now ships on 45 pages, but only 3 show a trail. Several pages define `.ug-breadcrumb`-style CSS that is never applied — dead styling from an earlier iteration. The CMS already has a `PageBanner.breadcrumbs` JSON column waiting for this. |
| `out/` is 280 MB | 🟡 Medium | Now dominated by PDFs and video, not images. Worth reviewing what belongs in `public/` vs the Media Library. |
| 6 images still over 400 KB | 🟢 Low | Already near-optimal at their dimensions. |
| Duplicate assets | 🟢 Low | `logo.png` and `site-images/logo.png` are byte-identical, as are several campus photos. |

---

## 13. Recommended Google Search Console actions

1. **Configure the www → apex 301 first.** Verifying before that is done will produce misleading duplicate-host reports.
2. Verify **both** `ksrmce.ac.in` and `www.ksrmce.ac.in` as properties, plus a Domain property, so the redirect can be confirmed working.
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` at build time — the meta tag is already wired in `app/layout.tsx` and emits nothing when unset. **No verification is claimed or configured today.**
4. Submit `https://ksrmce.ac.in/sitemap.xml`.
5. Use **Removals → Outdated content** for the 8 alias URLs that were previously indexable 200s, or simply let the new 301s be recrawled.
6. Watch **Page indexing → Duplicate, Google chose different canonical** — the 9 leadership/placements pages that were canonicalised to their parents should drop out of that report as they are recrawled.
7. Re-test the homepage in the **Rich Results Test** to confirm `CollegeOrUniversity` + `WebSite`, and a department page for `Course` + `BreadcrumbList`.

---

## 14. Recommended next SEO phase

1. **www → apex redirect** (blocking, server-side).
2. **CMS SEO fields** — make the admin controls real (§11).
3. **Per-item news and event pages** with `Article`/`Event` schema and a rebuild hook.
4. **Faculty profiles** — ~180 faculty records currently render client-side inside department pages with no indexable URL each. Highest-volume untapped opportunity, but needs a decision on what is appropriate to publish per person.
5. **JS bundle reduction** — 4.2 MB is the largest remaining Core Web Vitals risk.
6. **Visible breadcrumbs**, using the CMS column that already exists.

---

## Summary table

| Area | Before | After | Status |
|---|---|---|---|
| **Metadata** | 26 routes with none; 42 pages across 5 duplicate-title groups | 69/69 unique titles + descriptions | ✅ Fixed |
| **Sitemap** | 63 URLs, **all 63** mismatching their canonical; 9 routes missing; hand-maintained | 69 URLs, all consistent; auto-discovered | ✅ Fixed |
| **Robots** | Basic; `/api` and the PII form crawlable | `/admin`, `/dashboard`, `/api/`, `/careers/apply` blocked; `/_next` protected by a check | ✅ Fixed |
| **Canonicals** | 35 pages missing; 9 pointing at the wrong page | 69/69 self-referencing, trailing-slash and host consistent | ✅ Fixed |
| **Structured Data** | 1 type, with unverified `sameAs` | 6 types; unverified claims removed | ✅ Fixed |
| **H1/H2** | Homepage had **zero** `<h1>`; 8 alias pages had none | 69/69 with exactly one | ✅ Fixed |
| **Internal Linking** | Section indexes pointing at thin duplicate shells | Repointed to the real pages | ✅ Fixed |
| **Images** | 49 files over 400 KB; 90.5 MB total; 18 MB single file | 6 over 400 KB; 10.4 MB total (−88.5%) | ✅ Fixed |
| **Performance** | Images unoptimised and huge; 4.2 MB JS | Images fixed; **JS unchanged** | 🟡 Partial (by scope) |
| **Accessibility** | No homepage h1; unlabelled breadcrumbs; alt text already good | h1 added; breadcrumbs labelled; alt text confirmed 26/26 | ✅ Fixed |
| **Local SEO** | Address + contact present; unverified social profiles | Verified address/contact retained; unverified claims dropped | ✅ Fixed |
| **Program SEO** | No `Course` markup | `Course` on 14 department pages, from real programme data | ✅ Fixed |
| **Admissions SEO** | 4 pages, 2 inheriting generic metadata | All admissions routes with intent-matched titles | ✅ Fixed |
| **Legacy URLs** | 58 301s, all chaining; 1 pointing at a noindexed shell | 56 targets de-chained; retargeted; 9 alias 301s added | ✅ Fixed |
| **CMS SEO** | Fields exist, nothing reads or writes them | Audited and documented; not built | 🔴 Open (§11) |
| **www/non-www** | All URLs on the non-canonical host | Code consistent on apex | 🟡 Needs server 301 |

---

## Verification

```bash
cd frontend
npm run build          # exits 0
npx tsc --noEmit       # exits 0
npm run lint           # 95 problems - EXACTLY the pre-existing baseline, 0 added
npm run seo:audit      # 21/21 checks pass, 0 critical failures
```

Lint was measured against a clean `git stash` of the pre-change tree: **95 problems
(59 errors, 36 warnings) before and after.** All are pre-existing (`require()` imports
in old scripts, `setState`-in-effect in admin components, `no-img-element` warnings).
No file created or modified by this SEO pass produces a lint finding.
