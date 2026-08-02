"use client"

import { createContext, useContext, ReactNode } from "react"
import { getPageTextPublic, PageText } from "@/lib/page-text-api"
import { defaultText, slotKey } from "@/lib/page-text-registry"
import { useLiveData } from "@/lib/use-live-data"

/**
 * Renders one piece of a page's wording, letting the CMS override it.
 *
 * The page's own text comes from the registry, so it is compiled into the
 * static export and is what a crawler sees. If an admin has edited that slot,
 * the edited wording replaces it once the override loads. Nothing in the
 * database, or an API that cannot be reached, means the page reads exactly as
 * it was written.
 *
 * Wrap a page in <CmsTextProvider section="..."> and the whole page's overrides
 * are fetched once; each <CmsText> then reads from that. Used without a
 * provider it fetches for itself, which is fine for a page with one or two
 * slots but wasteful for a page with thirty.
 *
 * Usage:
 *   <CmsTextProvider section="library">
 *     <h1><CmsText section="library" slot="hero.title" /></h1>
 *     <p><CmsText section="library" slot="about.p1" /></p>
 *   </CmsTextProvider>
 */

const OverridesContext = createContext<Map<string, string> | null>(null)

function toMap(rows: PageText[] | null | undefined): Map<string, string> {
  return new Map((rows ?? []).map((r) => [r.key, r.value]))
}

export function CmsTextProvider({ section, children }: { section: string; children: ReactNode }) {
  const rows = useLiveData<PageText[]>(
    () => getPageTextPublic(section).catch(() => [] as PageText[]),
    [section],
  )
  return <OverridesContext.Provider value={toMap(rows)}>{children}</OverridesContext.Provider>
}

/** Reads a slot's live wording - the override if there is one, else the page's own. */
export function usePageTextValue(section: string, slot: string): string {
  const shared = useContext(OverridesContext)
  // With a provider above us the fetch is already done once for the page;
  // `skip` stops every slot from starting its own poller on top of it.
  const own = useLiveData<PageText[]>(
    () => getPageTextPublic(section).catch(() => [] as PageText[]),
    [section, shared !== null],
    { skip: shared !== null },
  )
  const overrides = shared ?? toMap(own)
  const override = overrides.get(slotKey(section, slot))
  return override !== undefined ? override : defaultText(section, slot)
}

export default function CmsText({
  section,
  slot,
  /** Renders each blank line as a paragraph break, for multi-line body copy. */
  multiline = false,
}: {
  section: string
  slot: string
  multiline?: boolean
}) {
  const value = usePageTextValue(section, slot)
  if (!value) return null
  // whiteSpace keeps an admin's line breaks instead of collapsing them, without
  // needing a rich-text editor or dangerouslySetInnerHTML.
  if (multiline) return <span style={{ whiteSpace: "pre-line" }}>{value}</span>
  return <>{value}</>
}
