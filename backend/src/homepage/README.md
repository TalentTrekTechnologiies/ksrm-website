# Homepage Module

Backend for the public homepage's CMS-managed content. Covers Sprint 1A (Hero, Statistics, Quick Links), Sprint 1B (Vision, Mission, About, Admissions, and the generalized Content Cards service), and Sprint 1C (Testimonials, Campus Videos, Accreditation Badges, Recruiters, Department teaser cards, and the section-visibility toggle mechanism).

## Architecture

```
src/homepage/
├── homepage.module.ts        # wires every sub-module below into one NestJS module
├── homepage.controller.ts    # GET /homepage - public aggregator (safe-per-piece, not the hot path - see below)
├── homepage.service.ts
├── optimistic-lock.util.ts   # assertVersionMatch(), used by every service below
├── types.ts                  # RequestAdmin - shape of req.user attached by JwtStrategy
├── dto/is-path-or-url.validator.ts  # shared @IsPathOrUrl() decorator
├── hero/                     # HomepageHero (singleton, id always 1)
├── statistics/                # SiteStatistic, scoped by `scope` (homepage | homepage_placements)
├── content-cards/             # generic CRUD+reorder+soft-delete over ContentCard, scoped by `section`
├── quick-links/                # thin wrapper: ContentCardService + section='homepage_quick_links'
├── admission-programs/          # thin wrapper: ContentCardService + section='homepage_admission_programs'
├── sections/                  # HomepageSection (vision/mission/about/admissions), Draft/Published status
├── testimonials/               # Testimonial - lean CRUD+reorder+soft-delete (Sprint 1C)
├── campus-videos/               # CampusVideo - lean CRUD+reorder+soft-delete (Sprint 1C)
├── accreditation-badges/         # AccreditationBadge - lean CRUD+reorder+soft-delete (Sprint 1C)
├── recruiters/                 # Recruiter - lean CRUD+reorder+soft-delete (Sprint 1C)
├── departments/                # thin wrapper: ContentCardService + section='homepage_departments' (Sprint 1C)
└── section-visibility/          # SiteSetting-backed ON/OFF toggle per homepage section (Sprint 1C)
```

**Sprint 1C design notes:**
- `testimonials/`, `campus-videos/`, `accreditation-badges/`, `recruiters/` each mirror `statistics/`'s CRUD+reorder+soft-delete/restore shape exactly, minus the `scope` dimension (each is a single flat list, not grouped). Deliberately **4 separate lean services, not 1 generic one** - the 4 Prisma models have different field sets and delegate types, and generalizing them wasn't worth the complexity for 4 call sites. See Technical Debt in the Sprint 1C deliverables report.
- `departments/` reuses `ContentCardService` (`section: 'homepage_departments'`) for homepage teaser cards only - **deliberately decoupled from the real `Department` entity** (bio/faculty/labs/programmes), which remains a separate, mostly-unpopulated table outside this module's scope. Don't confuse the two.
- `section-visibility/` is its own NestJS module (not just a provider inside `HomepageModule`) so `NewsModule` can also import it - see "Section visibility" below.

**Design principle carried through both sprints**: prefer reusing/generalizing an existing table+service over adding a new one. `SiteStatistic` and `ContentCard` (both scaffolded in Phase 1B, unused until this module) cover every "list of similarly-shaped cards" need; `HomepageSection` covers every "one fixed named block of structured content" need. Only `HomepageHero` got a dedicated table, because its shape (video + rotating captions + news ticker + two CTAs) doesn't generalize to anything else.

**`ContentCardService`** (Sprint 1B) is the reusable-service pattern going forward: it has no opinion on routing or permissions - callers (`QuickLinksService`, `AdmissionProgramsService`, and future ones) are thin wrappers fixing a `section` value and an `auditModule`/`entityLabel` pair. Adding a new "list of cards" feature to any future page means writing a wrapper + DTOs, not copying the CRUD logic again.

## API endpoints

All routes are under `/homepage`. Public routes have no guard; admin routes require `JwtAuthGuard` + `PermissionsGuard` with the permission noted.

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/homepage` | public | aggregator: hero, statistics, placementStatistics, quickLinks, admissionPrograms, sections |
| GET | `/homepage/hero` | public | |
| GET/POST/PATCH | `/homepage/admin/hero` | `homepage.view`/`edit` | singleton, `POST` only succeeds once |
| GET | `/homepage/statistics?group=` | public | `group`: `homepage` \| `homepage_placements` |
| GET/POST | `/homepage/admin/statistics` | `homepage.view`/`edit` | `?includeDeleted=true` surfaces soft-deleted rows |
| PATCH | `/homepage/admin/statistics/reorder` | `homepage.edit` | |
| PATCH/DELETE | `/homepage/admin/statistics/:id` | `homepage.edit`/`delete` | |
| POST | `/homepage/admin/statistics/:id/restore` | `homepage.restore` | |
| GET | `/homepage/quick-links?section=homepage_quick_links` | public | unchanged since Sprint 1A |
| GET/POST/PATCH/DELETE/reorder/restore | `/homepage/admin/quick-links/...` | as above | unchanged since Sprint 1A |
| GET | `/homepage/admission-programs?section=homepage_admission_programs` | public | new, Sprint 1B |
| GET/POST/PATCH/DELETE/reorder/restore | `/homepage/admin/admission-programs/...` | as above | new, Sprint 1B |
| GET | `/homepage/sections/:key` | public | `key`: `vision`\|`mission`\|`about`\|`admissions`; only returns `PUBLISHED` |
| GET | `/homepage/admin/sections` / `/:key` | `homepage.view` | returns regardless of status |
| PATCH | `/homepage/admin/sections/vision` \| `/mission` \| `/about` \| `/admissions` | `homepage.edit` | one route per key for per-key DTO validation; body is `{content, status, version}` |
| GET | `/audit-logs/target?module=&targetId=` | any authenticated admin | full history for one record; not super-admin-gated like `/audit-logs` (see `AuditLogService.getByTarget`'s doc comment) |
| GET | `/homepage/testimonials` \| `/campus-videos` \| `/accreditation-badges` \| `/recruiters` | public | Sprint 1C - each returns `{ visible: boolean, items: T[] }` (see "Section visibility" below), not a bare array |
| GET/POST/PATCH(`/reorder`, `/:id`)/DELETE(`/:id`)/POST(`/:id/restore`) | `/homepage/admin/testimonials\|campus-videos\|accreditation-badges\|recruiters/...` | `homepage.view`/`edit`/`edit`/`delete`/`restore` | Sprint 1C, same route shape as Statistics |
| GET | `/homepage/departments?section=homepage_departments` | public | Sprint 1C, wrapped like the 4 above |
| GET/POST/PATCH/DELETE/reorder/restore | `/homepage/admin/departments/...` | as above | Sprint 1C, thin `ContentCardService` wrapper |
| GET | `/homepage/admin/section-visibility` | `homepage.view` | all 6 Sprint 1C section keys + current visible state |
| PATCH | `/homepage/admin/section-visibility/:key` | `homepage.edit` | `{ visible: boolean }`, audited under `homepage_section_visibility` |

Full request/response shapes: Swagger UI at `/api/docs`.

## Section visibility (Sprint 1C)

Every homepage section built in Sprint 1C (`testimonials`, `campusVideos`, `accreditation`, `recruiters`, `departments`, `latestNews`) can be toggled ON/OFF independently from its own admin manager page, without deleting any of its content - "don't delete content, just hide it." Backed by the pre-existing, previously-unused `SiteSetting` table (`group: 'homepage_visibility'`, one boolean row per section key: `homepage.visibility.<key>`), not a new table.

The public list endpoints for these 6 sections respond `{ visible: boolean, items: T[] }` instead of a bare array. This distinction matters: if a hidden section just returned `items: []`, the frontend's existing empty/failure fallback logic would show stale hardcoded content instead of actually hiding the section. `visible: false` tells the component to render nothing; `visible: true, items: []` means "genuinely empty right now, show the fallback."

`latestNews` is the one key not owned by this module - it gates the homepage's Latest News teaser via `NewsController`'s `GET /news` (see `backend/src/news/README.md`), which is why `section-visibility/` is its own importable NestJS module rather than a provider private to `HomepageModule`.

**Not retrofitted to Sprint 1A/1B's sections** (Hero, Statistics, Quick Links, Vision, Mission, About, Admissions) - same mechanism would apply cleanly, but touching those shipped pages wasn't part of this sprint's request. Flagged as a natural, low-cost fast-follow, not done silently.

## Permissions

`homepage` module, 7 actions (seeded in `prisma/seed.ts`): `view`, `edit`, `publish`, `delete`, `restore`, `preview`, `seo.edit`. `publish`/`preview`/`seo.edit` are seeded now but only `view`/`edit`/`delete`/`restore` are actually checked by any route so far (`publish`/`seo.edit` arrive with 1D's SEO/scheduling work). Granted to the **CMS Administrator** role automatically (picks up every `CONTENT_MODULES` entry) and explicitly added to **Content Editor**.

**RBAC prerequisite fixed in Sprint 1A**: `JwtStrategy`/`AuthService` resolve `req.user.permissions` via `EffectivePermissionsService` (real `AdminRole → Role → RolePermission` chain), not the legacy `Admin.permissions` column (never populated for role-based grants). This was a pre-existing bug affecting every module, not homepage-specific.

## Database tables

- `HomepageHero` - singleton, `isActive` boolean (no Draft/Published status - deferred to 1D, see Known Limitations).
- `SiteStatistic` (existing, Phase 1B) - `scope` distinguishes homepage's two stat groups from any future page's stats.
- `ContentCard` (existing, Phase 1B) - `section` distinguishes Quick Links, Admission Programs, and (Sprint 1C) Department teasers from any future "card grid" content.
- `HomepageSection` (Sprint 1B) - `key` (unique), `content` (Json, shape depends on `key`), `status` (`SectionStatus`: `DRAFT` | `PUBLISHED`; `SCHEDULED` arrives in 1D), `sortOrder` (reserved for 1C/1D's cross-section drag-reorder, unused today).
- `Testimonial`, `CampusVideo`, `AccreditationBadge`, `Recruiter` (Sprint 1C) - these 4 tables actually already existed in the schema from an earlier Phase 1B pass, unused until this sprint gave them a backend module. `CampusVideo` gained one additive column this sprint: `badgeLabel String?` (replaces the previous by-array-position badge text, which silently mislabeled videos on reorder).
- `SiteSetting` (existing, Phase 1B, previously unused) - now backs the section-visibility toggles (`group: 'homepage_visibility'`).
- `AuditLog` (existing) - `requestId` column added in 1A for correlation-ID tracing; `action` extended with `RESTORE`/`REORDER` (1A) and `PUBLISH`/`UNPUBLISH` (1B), all as plain strings (no enum migration).

Every content table follows the same soft-delete/optimistic-lock shape: `deletedAt`/`deletedBy`/`version`. `HomepageHero` and `HomepageSection` don't expose delete/restore endpoints (they're fixed singleton/named slots, not user-created rows) but keep the columns for shape consistency.

## Edge cases verified (Sprint 1A + 1B + 1C)

Optimistic lock conflicts (every mutable entity, including News for the first time this sprint); permission failures (401 unauthenticated, 403 no-permission, Viewer role view-only); soft delete + restore (Statistics, Quick Links, Admission Programs, and all 5 Sprint 1C entities); reorder duplicate-position rejection; invalid URL/tel-link/email rejection; XSS payloads stored as inert text (no `dangerouslySetInnerHTML` anywhere in the feature); empty states; Draft vs Published divergence (public endpoint never returns a Draft section); audit correctness including Created By/Updated By derivation and PUBLISH/UNPUBLISH vs plain UPDATE action logging; the Sprint 1B refactor didn't change Quick Links' routes/behavior (explicit regression test); testimonial rating bounds (1-5) rejected outside range; section-visibility toggle hides a section's public response without deleting rows, toggle change is audited, toggling back on immediately restores the section (all covered in `test/homepage.e2e-spec.ts`); the News permission-key bug fix is regression-tested end to end in `test/news.e2e-spec.ts` (a Viewer-role admin can list but not create, proving the fix isn't just a relabel).

## Known limitations

- **No Draft/Published status on Hero, Statistics, Quick Links/Admission Programs, or the 5 Sprint 1C list entities** - only `HomepageSection` has the `SectionStatus` enum (per explicit instruction: don't retrofit shipped entities without a compelling reason). 1D unifies every content type onto one status model alongside real `SCHEDULED`/`publishAt`/`expiresAt` support.
- **`HomepageSection.sortOrder` is unused** - reserved for 1C/1D's cross-section drag-reorder, once every homepage section (not just these 4) is under CMS management.
- **`page_content` permission module is seeded but has no controller, and Sprint 1C's new entities deliberately did NOT use it** - its own comment in `seed.ts` lists Testimonial/CampusVideo/AccreditationBadge/Recruiter as intended contents, but the real precedent (`SiteStatistic` under `homepage.*`) was followed instead for consistency with the rest of this module. `page_content` stays unused, flagged, not cleaned up.
- **Section-visibility toggles only cover Sprint 1C's 6 sections** - not retrofitted onto Hero/Statistics/Quick Links/Vision/Mission/About/Admissions. See "Section visibility" above.
- **Department homepage teaser cards are decoupled from the real `Department` entity** - editing a teaser card here does not affect (and is not affected by) the actual department detail pages. The real `Department` table remains mostly unpopulated (1/7 rows) - a separate, pre-existing gap this sprint didn't address.
- **Pre-existing modules (Faculty, Gallery, ...) still use bare module-name permissions** (`'faculty'`, not `'faculty.view'`) - **News was fixed this sprint** (see `backend/src/news/README.md`); the others remain out of scope for this module.

## Future enhancements (backlog, not yet built - see project memory)

Media Library picker for every image-URL field (currently a validated URL string); unsaved-changes navigation guard; autosave (draft, every 30-60s); presence/activity indicator ("Edited by Ravi - 2 minutes ago") when another admin has a record open; bulk image upload for Recruiters (backlogged at Sprint 1C review); retrofitting section-visibility onto 1A/1B's sections; module-level feature flags (`news.enabled`, etc. - broader than section visibility, still deferred).
