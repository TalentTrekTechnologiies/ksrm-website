# CMS component library (`components/admin/cms/`)

Reusable building blocks for every Homepage CMS admin page (and, going forward, News/Gallery/Careers/Downloads/etc.). The standing rule: if you find yourself copying markup between two manager pages, extract a shared component here instead. This catalog exists per the Sprint 1C "every reusable component gets a short usage note" rule - kept intentionally brief.

---

### `PermissionGate`
**Purpose:** Gates an entire admin page behind one permission key, showing a themed "Access denied" state instead of the page content.
**Props:** `permission: string`, `children`.
**Example:** `<PermissionGate permission="homepage.view"><TestimonialsManagerInner /></PermissionGate>`
**Supported features:** Reads the stored admin via `getStoredAdmin()`/`hasPermission()`; no network call.

### `CmsForm` (module: `TextField`, `TextAreaField`, `NumberField`, `SelectField`, `ToggleField`, `ImageUrlField`, `FormActions`, `PrimaryButton`, `SecondaryButton`, `DangerButton`, `PublishButton`)
**Purpose:** Floating-label form primitives + the button color convention (blue Primary / white Secondary / red Danger / gold Publish) used by every editor and manager form.
**Props:** Each field takes `label`, `value`, `onChange`, plus `required`/`error`/`helperText`/`maxLength` as applicable.
**Example:** `<TextField label="Name" value={form.name} onChange={(v) => setForm({...form, name: v})} required maxLength={100} />`
**Supported features:** Inline validation messages, character counters, required-field asterisk, disabled state, leading icons (`TextField`).

### `CmsDragList`
**Purpose:** Drag-to-reorder list for small, database-backed collections with a stable `id` (Statistics, Quick Links, Admission Programs) - row chrome (drag handle, Inactive/Deleted badge, Edit/Delete/Restore) is rendered by the list; `renderRow` supplies only the row's own content.
**Props:** `items: T[]` (`T extends {id, isActive, deletedAt}`), `onReorder`, `renderRow`, `onEdit?`, `onDelete?`, `onRestore?`, `emptyLabel?`.
**Example:** see `StatisticsManager.tsx`.
**Supported features:** Pointer + keyboard drag (`@dnd-kit`), soft-delete/restore state, empty state.

### `CmsCardGrid` (new, Sprint 1C)
**Purpose:** Card-grid counterpart to `CmsDragList`/`CmsTable` - the default view for small, **visual, curated** lists (testimonials, campus videos, accreditation badges, recruiter logos, department teasers) where a plain table hides what an editor actually needs to see (the photo/thumbnail/logo) to edit confidently. Card chrome (selection checkbox, status badge, Edit/Delete/Restore) is rendered by the grid; `renderCard` supplies only the visual body.
**Props:** `items: T[]` (`T extends {id, isActive, deletedAt}`), `renderCard`, `onEdit?`, `onDelete?`, `onRestore?`, `selectedIds?: Set<number>`, `onToggleSelect?`, `emptyTitle?`, `emptyDescription?`.
**Example:** see `TestimonialsManager.tsx` / `CampusVideosManager.tsx` / `AccreditationManager.tsx` / `DepartmentsManager.tsx` / `RecruitersManager.tsx`.
**Supported features:** Responsive grid (1-4 columns), optional multi-select (checkbox overlay + highlighted border, for bulk actions), Inactive/Deleted badges, empty state. No built-in reordering - use a `sortOrder` field in the create/edit form for these smaller curated lists.

### `CmsTable`
**Purpose:** Sticky-header, paginated, optionally row-selectable data table for metadata-dense lists (News: Image/Category/Status/Publish Date/Views/Featured/Actions) or as the alternate view for a large visual list (Recruiters' Grid/Table toggle).
**Props:** `data: T[]` (`T extends {id}`), `columns: ColumnDef<T>[]` (`@tanstack/react-table`), `rowSelection?`, `onRowSelectionChange?`, `emptyTitle?`, `emptyDescription?`, `pageSize?`.
**Example:** see `NewsManager.tsx` (table-only) and `RecruitersManager.tsx` (table as the alternate view).
**Supported features:** Pagination, row selection wired to `RowSelectionState`, sticky header, empty state.

### `CmsToolbar`
**Purpose:** Search input + arbitrary filter slot + bulk-action bar + export button - the header bar every list-shaped manager page needs.
**Props:** `searchValue`, `onSearchChange`, `searchPlaceholder?`, `filters?: ReactNode`, `selectedCount?`, `bulkActions?: {label, onClick, danger?}[]`, `onClearSelection?`, `onExport?`.
**Example:** see any Sprint 1C manager; Recruiters is the first page to wire the `bulkActions` (Delete/Restore) slot.
**Supported features:** Switches automatically between the search/filter row and the bulk-action row based on `selectedCount`.

### `CmsChipList`
**Purpose:** Structured "add one at a time" chip list (Admissions' branch pills, Departments' Programs pills) - not a comma-separated text field, so adding one entry is a content edit, not a developer change.
**Props:** `label`, `items: string[]`, `onChange`, `placeholder?`, `error?`.
**Example:** `<CmsChipList label="Programs" items={form.tags} onChange={(tags) => setForm({...form, tags})} />`
**Supported features:** Add via Enter/comma/blur, per-chip remove, de-dupes on add.

### `CmsDynamicList`
**Purpose:** The generalized "add/remove card" pattern for plain-data lists with no database id (Mission points, About paragraphs/highlights/statistics) - up/down buttons for reordering, not drag-and-drop (these lists are small and the items have no stable identity for `dnd-kit`).
**Props:** `items: T[]`, `onChange`, `newItem: () => T`, `renderItem`, `itemLabel`, `emptyTitle`, `emptyDescription`, `maxItems?`.
**Example:** see `MissionEditor.tsx` / `AboutEditor.tsx`.
**Supported features:** Add/remove/move up/move down, empty state, optional max-items cap.

### `CmsImageField`
**Purpose:** Structured image editor (current preview + URL + alt text + caption) - replaces a bare URL textbox anywhere an image is real content, not just a link.
**Props:** `label`, `value: {url, alt, caption?}`, `onChange`.
**Example:** see `AboutEditor.tsx`.
**Supported features:** Live preview with broken-image fallback.

### `CmsPreviewPanel`
**Purpose:** Desktop/Tablet/Mobile live preview tabs for **singleton section editors** (Hero, Vision, Mission, About, Admissions) - backed by a real `<iframe>` (not a CSS-scaled div) pointed at the dedicated `/admin/homepage/preview/[key]` route, so the public component's actual `@media` breakpoints fire correctly.
**Props:** `previewKey: string`, `draftData: unknown`.
**Example:** see `HeroEditor.tsx`.
**Supported features:** 3 breakpoint tabs. **Not used by list-CRUD managers** (Statistics, Quick Links, and every Sprint 1C manager) - reserved for singleton editors where "preview the whole section" makes sense.

### `CmsRecordMeta`
**Purpose:** "Last updated · Created by · Updated by · vN" strip + an "Audit History" trigger button, shown on every singleton section editor.
**Props:** `updatedAt`, `createdBy: AuditActor | null`, `updatedBy: AuditActor | null`, `version`, `onOpenAuditHistory`.
**Example:** see `HeroEditor.tsx`.
**Supported features:** Derives Created By/Updated By display from `AuditLogService.getCreatorAndUpdater()` - no dedicated schema columns.

### `CmsAuditHistoryDrawer`
**Purpose:** Slide-in timeline of a single record's full audit trail; `UPDATE` entries render a **Field/Old/New diff table** (computed client-side via `lib/audit-diff.util.ts`), not raw JSON.
**Props:** `open`, `onClose`, `module: string`, `targetId: number`.
**Example:** see `HeroEditor.tsx`.
**Supported features:** Per-action icon/color (Create/Update/Delete/Restore/Reorder/Publish/Unpublish), field-level diff for updates, plain description line for non-update actions.

### `CmsStatusBadge` (+ `CmsApplicationStatusBadge`, `CmsPriorityBadge`)
**Purpose:** Color-coded pill+dot status badges - one visual language reused across every status-like vocabulary in the admin, not a per-page ad-hoc color map. `CmsStatusBadge` is Draft (gray) / Published (green) / Scheduled (amber). `CmsApplicationStatusBadge` is the Careers pipeline's 8-stage `ApplicationStatus`. `CmsPriorityBadge` is the Announcement Engine's `AnnouncementPriority` (Critical/High/Normal/Low).
**Props:** `CmsStatusBadge({status: "DRAFT" | "PUBLISHED" | "SCHEDULED"})`, `CmsApplicationStatusBadge({status: ApplicationStatus})`, `CmsPriorityBadge({priority: AnnouncementPriority})`.
**Example:** `<CmsStatusBadge status={row.original.isPublished ? "PUBLISHED" : "DRAFT"} />` (News table); `<CmsApplicationStatusBadge status={item.status} />` (Careers Applications table + detail modal header); `<CmsPriorityBadge priority={item.priority} />` (Announcements table).
**Supported features:** Same pill+dot shape/sizing across all three so they read as one system even though each is a distinct, fixed vocabulary. During the Premium UI Polish pass, `ApplicationsManager`/`ApplicationDetailModal`/`AnnouncementsManager` were found using their own hand-rolled color maps with a different (smaller, dot-less) pill shape than this component - switched over so status/priority always render identically everywhere they appear.

### `CmsTableSkeleton` (new, Premium UI Polish pass)
**Purpose:** Content-shaped loading skeleton (pulsing header + toolbar + N table rows) for table/list manager pages - swap in for `CmsLoadingState` (a bare centered spinner) wherever the page's eventual content is a list, so the loading state previews the real layout instead of a spinner-then-pop-in layout shift.
**Props:** `rows?: number` (default 6), `showHeader?: boolean` (default true - set `false` when the page's own title/toolbar is already rendered above it and only the results themselves are reloading, e.g. a filtered table refresh).
**Example:** `if (loading) return <CmsTableSkeleton />` (`AdminsManager.tsx`, `AuditLogsManager.tsx`, `RolesManager.tsx`, `CareersManager.tsx`, `NewsManager.tsx`, `AnnouncementsManager.tsx`); `<CmsTableSkeleton showHeader={false} />` (`ApplicationsManager.tsx`, where the search/filter bar stays visible while only the table area reloads).
**Supported features:** Not used for card-grid pages (Media Library) or singleton form editors (Hero, Department Workspace tabs) - `CmsLoadingState`'s plain spinner is still correct there since there's no row shape to preview.

### `CmsLoadingState`
**Purpose:** Bare centered spinner for pages/views with no natural "row" shape to preview (singleton form editors, tabbed workspaces, card grids). Prefer `CmsTableSkeleton` instead for any page whose loaded content is a list/table.
**Props:** `label?: string` (screen-reader only).
**Example:** `HeroEditor.tsx`, `DepartmentWorkspace.tsx`, `MediaLibraryManager.tsx`.

### `SectionEditorHeader`
**Purpose:** The pixel-identical "Homepage / {Section} — {description}" header every singleton section editor starts with.
**Props:** `title`, `description`, `status?: SectionStatus`.
**Example:** see `VisionEditor.tsx`.
**Supported features:** Breadcrumb link back to `/admin/homepage`, optional status badge.

### `SectionVisibilityToggle` (new, Sprint 1C)
**Purpose:** Self-contained "Visible on homepage" ON/OFF switch for a manager page's header - fetches and saves its own state independent of whatever entity list the page manages. Turning it off hides the whole section on the public homepage (the public endpoint returns `{visible: false, items: []}`) without deleting any underlying rows.
**Props:** `sectionKey: SectionVisibilityKey` (one of `"testimonials" | "campusVideos" | "accreditation" | "recruiters" | "departments" | "latestNews"`).
**Example:** `<SectionVisibilityToggle sectionKey="testimonials" />` in `TestimonialsManager.tsx`'s header.
**Supported features:** Optimistic-free (waits for the save to confirm before flipping visually), loading skeleton on first mount, inline error message on save failure. Only wired for Sprint 1C's 6 sections - see `backend/src/homepage/README.md`'s "Section visibility" section for why 1A/1B sections aren't included yet.

### `CmsFolderTree` (Media Library)
**Purpose:** Nested folder-tree sidebar/picker for the Media Library, built client-side from a flat, parentId-linked `MediaFolder[]` (the wire format stays a plain list - the tree structure is a rendering concern only). Used both as the full sidebar in `MediaLibraryManager.tsx` (with create/rename/delete) and, selection-only, inside the "Move to folder" modal.
**Props:** `folders: MediaFolder[]`, `selectedFolderId: number | null`, `onSelect`, `onCreateFolder?`, `onRenameFolder?`, `onDeleteFolder?` (omit the last three for a selection-only tree).
**Example:** see `MediaLibraryManager.tsx`.
**Supported features:** Expand/collapse per node, inline create/rename with Enter-to-confirm, "All Media" root option, delete calls straight through to the backend (which itself rejects non-empty folders with a 409 - this component doesn't duplicate that check). Moving an existing item between folders is a separate action (the "Move" button/bulk action in `MediaLibraryManager.tsx`, via `updateMedia({folderId})`) - this tree only ever *selects*, it doesn't drag-and-drop items onto itself.

### `MediaPicker` (Media Library)
**Purpose:** The one shared "Choose From Media Library" / "Upload New" modal every module's forms use instead of a bare URL text field or their own upload widget. Used directly for full control, or via `MediaField` (below) for the common case.
**Props:** `open: boolean`, `onClose`, `onSelect: (media: Media, url: string) => void`, `accept?: MediaType[]` (restrict the library tab to specific types, e.g. `["IMAGE"]` for a photo-only field).
**Example:** see `MediaField.tsx`, or `HeroEditor.tsx` (via `MediaField`) for a live call site.
**Supported features:** Search + grid browse of existing media (Library tab), drag-drop/click upload with progress (Upload tab, reuses `lib/media-api.ts`'s `uploadMedia`, and polls until background processing completes before resolving a URL - uploads are never immediately ready), image variant-size picker (defaults to MEDIUM) before confirming a selection.

### `MediaField` (new, Media Library integration pattern)
**Purpose:** The standard "media-backed field" every module's editor form uses - a thumbnail/icon preview + current URL + "Choose from Media Library" button (opens `MediaPicker`) + a collapsed "paste a URL directly (legacy)" fallback. Extracted from `HeroEditor.tsx`'s original hand-rolled block once Hero proved the integration pattern out, specifically so Gallery/News/Events/Faculty/Departments/Placements/Committees/Downloads/Site Settings/Research/Admissions/Testimonials/Recruiters/Campus Videos don't each re-derive the same JSX.
**Props:** `label`, `url: string`, `mediaId: number | null`, `onChange: (url: string, mediaId: number | null) => void`, `accept?: MediaType[]`, `required?`, `urlPlaceholder?`.
**Example:** `<MediaField label="Background Video" url={form.videoUrl} mediaId={form.mediaId} onChange={(url, mediaId) => setForm({...form, videoUrl: url, mediaId})} accept={["VIDEO"]} required />` (`HeroEditor.tsx`).
**Supported features:** Picking from the library or uploading new both call `onChange(url, media.id)`; manually editing the legacy URL fallback calls `onChange(url, null)` (explicit unlink, matching every backend service's `mediaId: null` = "unlink" contract). Pairs with the backend's `MediaLinkService` (`backend/src/media/media-link.service.ts`) - `prepareLink()`/`syncUsage()` - which is the equivalent server-side half of this same pattern.
