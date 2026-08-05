"use client"

import { getDownloadsPublic, Download } from "./downloads-api"
import { useLiveData } from "./use-live-data"

export interface CmsDoc {
  title: string
  url: string
  /** Small label shown beside the title - an academic year, a category. */
  badge?: string
}

/**
 * Documents for one designed block on a page, from the CMS.
 *
 * Several pages render document lists inside their own layout - year badges on
 * the Alumni meets, icons on the About page's policy documents - rather than
 * through the generic PageResources block. Those lists were hardcoded arrays of
 * Media ids, so publishing next year's report meant editing source and
 * redeploying.
 *
 * This reads the page's documents and returns the ones filed under a given
 * group heading, falling back to the built-in list while the CMS has none - so
 * a page never renders empty, and the moment a document is uploaded under that
 * heading it replaces the built-in list wholesale rather than appending to it
 * (otherwise every upload would show twice, once from each source).
 *
 * The group heading is the "Group label" field in Admin -> Documents.
 */
export function useCmsDocGroup(
  section: string,
  group: string,
  fallback: CmsDoc[],
): CmsDoc[] {
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, section).catch(() => [] as Download[]),
    [section],
  )

  const rows = (docs ?? []).filter((d) => (d.groupLabel ?? "").trim() === group)
  if (rows.length === 0) return fallback

  return rows.map((d) => ({
    title: d.title,
    url: d.fileUrl,
    // The description doubles as the badge here - it is the only free field on
    // a Download, and on these lists it is always something short like an
    // academic year.
    badge: d.description ?? undefined,
  }))
}
