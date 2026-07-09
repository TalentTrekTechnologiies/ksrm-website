# News module

## Architecture

Standard NestJS controller/service pair over the `News` Prisma model. Brought up to full CMS parity with the Homepage CMS modules in Sprint 1C — before that, this module only had a public read path and an unreachable write path (see "Fixed in Sprint 1C" below).

## API endpoints

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/news` | Public | `isPublished: true`, non-deleted only. Optional `?category=` filter. Ordered featured-first, then by date desc. |
| GET | `/news/admin` | `news.view` | Includes drafts (`isPublished: false`). Optional `?includeDeleted=true`. |
| GET | `/news/:id` | Public | Single article (published or not — used by the admin edit form too; the frontend gates access via the surrounding admin page's `PermissionGate`). |
| POST | `/news` | `news.create` | |
| PATCH | `/news/:id` | `news.update` | Requires `version` in the body — optimistic-lock conflict returns 409. |
| DELETE | `/news/:id` | `news.delete` | Soft delete (`deletedAt`/`deletedBy`), not a hard Prisma delete. |
| POST | `/news/:id/restore` | `news.restore` | |

## Permissions

`news.view` / `news.create` / `news.update` / `news.delete` / `news.restore` — seeded in `prisma/seed.ts`'s `MODULE_ACTIONS.news`, granted to the "Content Editor" and "Super Admin" system roles.

## Fixed in Sprint 1C (was broken before)

- **Permission-key bug**: every write route previously guarded with `@RequirePermission('news')` (a bare, never-seeded key — only `news.view/create/update/delete` were ever granted to any role). This meant **no role, including Super Admin, could create/update/delete a News article** through the API. Fixed by switching to the granular, already-seeded keys.
- **No draft visibility for admins**: `findAll()` unconditionally filtered `isPublished: true`, so there was no way to see or edit an unpublished article once created. Fixed via the new `findAllAdmin()` / `GET /news/admin`.
- **Hard delete**: `delete()` used a real Prisma `.delete()`, inconsistent with every other CMS module's soft-delete/restore pattern (and destructive for audit purposes). Fixed to soft-delete + a new `restore()`.
- **No optimistic locking**: `update()` had no version check, so concurrent edits silently last-write-won. Fixed via `assertVersionMatch` (`backend/src/homepage/optimistic-lock.util.ts`, reused as-is).

## DB table

`News` — pre-existing (Phase 1), unchanged except one additive column this sprint: `isFeatured Boolean @default(false)`, lets the homepage's Latest News section prioritize hand-picked stories.

## Edge cases

- Empty/0-row public response is an honest, valid state (no fabricated seed articles) — the homepage falls back to its existing hardcoded content in that case.
- Optimistic lock conflict on concurrent edits (409, same message format as the rest of the CMS).
- Soft-deleted articles are excluded from both public and admin listings unless `includeDeleted=true` is passed to the admin route.
- `category` filter on the public route is a free-text match, not validated against a fixed enum (matches the pre-existing behavior — not changed this sprint).

## Known limitations

- "Views" (as shown on the admin News table) is a static placeholder — no real view-count tracking is implemented yet.
- No `SectionVisibility` toggle scoped to News itself; the *Latest News homepage section's* visibility is controlled via `homepage.visibility.latestNews` (see `backend/src/homepage/README.md`), which only affects the public homepage teaser, not the `/admin/news` list or the `/news` full listing page.

## Future enhancements

- Real view-count tracking.
- Category taxonomy (currently a free-text string) if it starts drifting/duplicating.
