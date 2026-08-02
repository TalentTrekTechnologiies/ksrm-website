"use client"

import { ReactNode } from "react"
import { defaultText, slotKey } from "@/lib/page-text-registry"
import { usePageTextSection } from "@/lib/page-text-store"

/**
 * Renders one piece of a page's wording, letting the CMS override it.
 *
 * The page's own text comes from the registry, so it is compiled into the
 * static export and is what a crawler sees. If an admin has edited that slot,
 * the edited wording replaces it once the override loads. Nothing in the
 * database, or an API that cannot be reached, means the page reads exactly as
 * it was written.
 *
 * No provider or page restructuring is needed: every <CmsText> for a section
 * shares one fetch and one poller through the module-level store, so a page
 * with thirty slots still makes one request.
 *
 * Usage:
 *   <h1><CmsText section="about" slot="hero-title" /></h1>
 *   <p><CmsText section="about" slot="intro" multiline /></p>
 */

/** Reads a slot's live wording - the override if there is one, else the page's own. */
export function usePageTextValue(section: string, slot: string): string {
  const overrides = usePageTextSection(section)
  const override = overrides.get(slotKey(section, slot))
  return override !== undefined ? override : defaultText(section, slot)
}

export default function CmsText({
  section,
  slot,
  /** Keeps the admin's line breaks, for body copy. */
  multiline = false,
}: {
  section: string
  slot: string
  multiline?: boolean
}) {
  const value = usePageTextValue(section, slot)
  if (!value) return null
  if (multiline) return <span style={{ whiteSpace: "pre-line" }}>{value}</span>
  return <>{value}</>
}

/**
 * Kept so pages wrapped before the shared store existed keep working. The
 * store already dedupes per section, so this is now a plain passthrough and
 * new pages do not need it.
 */
export function CmsTextProvider({ children }: { section: string; children: ReactNode }) {
  return <>{children}</>
}
