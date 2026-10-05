import { Prisma } from '@prisma/client';

/**
 * Pages whose documents are shown, never handed over.
 *
 * Deliberately a short allow-list rather than a flag on every document: the
 * protected-docs route rasterises whatever it is pointed at, so if it could be
 * pointed at any id it would become a way to read documents the rest of the
 * CMS keeps behind permissions. A page has to be named here to be reachable at
 * all.
 *
 * A section belongs to a root by the part before its first dot, so `nba` and
 * `nba.minutes` are both protected. `nba-certificates` is NOT: certificates on
 * the NBA page are published openly, on purpose, and a dash keeps them out.
 *
 * Shared because three places must agree on it. The viewer serves these
 * documents as page images; the public file route refuses their originals;
 * and the public document list leaves their file links out. Before the last
 * two existed, the viewer protected the page while the list beside it handed
 * every visitor a direct link to the PDF.
 */
export const PROTECTED_SECTION_ROOTS: ReadonlySet<string> = new Set(['nba']);

export function isProtectedSection(section: string | null | undefined): boolean {
  if (!section) return false;
  return PROTECTED_SECTION_ROOTS.has(section.split('.')[0]);
}

/** Matches download rows filed under a protected section. */
export function protectedSectionWhere(): Prisma.DownloadWhereInput {
  return {
    OR: [...PROTECTED_SECTION_ROOTS].flatMap((root) => [
      { pageSection: root },
      { pageSection: { startsWith: `${root}.` } },
    ]),
  };
}
