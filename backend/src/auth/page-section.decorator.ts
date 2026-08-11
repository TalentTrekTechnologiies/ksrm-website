import { SetMetadata } from '@nestjs/common';

export const PAGE_SECTION_SCOPE_KEY = 'pageSectionScope';

export type PageSectionScopeConfig =
  // CREATE endpoints: the target page is `req.body.pageSection`.
  | { source: 'body' }
  // UPDATE/DELETE/restore: the target page has to be read off the existing
  // row (`req.params.id`), since the body may not repeat pageSection.
  // `model` is the PrismaService delegate name - one of the four models that
  // carry a pageSection column: 'download', 'galleryImage', 'pageTable',
  // 'pageText'.
  | { source: 'lookup'; model: string }
  // Batch save endpoints whose body is a list of items each carrying its own
  // pageSection (PageText's upsert). EVERY item must be on an owned page -
  // one foreign item rejects the whole request, since a partial save would
  // be worse than none.
  | { source: 'bodyItems'; field: string }
  // Records addressed by a string key rather than a numeric id
  // (PageText.reset takes `:key`). `model` is the PrismaService delegate.
  | { source: 'lookupKey'; model: string };

/**
 * Marks an endpoint as page-owned for `PageSectionOwnershipGuard`.
 *
 * The module-level analogue of `@DepartmentScoped`: that one answers "which
 * department's rows may this admin touch", this one answers "which page's
 * rows". A Super Admin, or any admin holding no `pages.*` permission at all,
 * is never restricted by it - like the department guard, it only ever
 * narrows access further and never grants anything `PermissionsGuard`
 * wouldn't already allow. Only apply it to mutating routes; read access is
 * deliberately never gated by it.
 */
export const PageSectionScoped = (config: PageSectionScopeConfig) =>
  SetMetadata(PAGE_SECTION_SCOPE_KEY, config);
