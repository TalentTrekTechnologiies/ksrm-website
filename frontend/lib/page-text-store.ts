"use client"

import { useEffect, useState } from "react"
import { getPageTextPublic, PageText } from "./page-text-api"
import { DEFAULT_POLL_INTERVAL_MS } from "./use-live-data"

/**
 * One fetch per page section, shared by every <CmsText> on the page.
 *
 * A page can easily hold thirty editable slots. If each fetched for itself
 * that would be thirty identical requests on mount and thirty pollers running
 * forever. This keeps a single subscription per section: the first component
 * to ask starts the fetch and the interval, the rest attach to it, and the
 * last one to unmount stops it.
 *
 * Deliberately module-level rather than a React context, so a page needs no
 * provider and no restructuring - a component can be slotted in anywhere,
 * including inside a server-rendered page.
 */

interface SectionState {
  overrides: Map<string, string>
  listeners: Set<(m: Map<string, string>) => void>
  timer: ReturnType<typeof setInterval> | null
}

const sections = new Map<string, SectionState>()

function toMap(rows: PageText[]): Map<string, string> {
  return new Map(rows.map((r) => [r.key, r.value]))
}

function load(section: string) {
  const state = sections.get(section)
  if (!state) return
  getPageTextPublic(section)
    .then((rows) => {
      const next = toMap(rows)
      const current = sections.get(section)
      if (!current) return
      // Only notify on an actual change, so polling doesn't re-render the page
      // every interval when nothing has been edited.
      if (sameMap(current.overrides, next)) return
      current.overrides = next
      current.listeners.forEach((fn) => fn(next))
    })
    .catch(() => {
      // Keep whatever loaded last; a hiccup must never blank a page's text.
    })
}

function sameMap(a: Map<string, string>, b: Map<string, string>): boolean {
  if (a.size !== b.size) return false
  for (const [k, v] of a) if (b.get(k) !== v) return false
  return true
}

function subscribe(section: string, fn: (m: Map<string, string>) => void): () => void {
  let state = sections.get(section)
  if (!state) {
    state = { overrides: new Map(), listeners: new Set(), timer: null }
    sections.set(section, state)
  }
  state.listeners.add(fn)

  if (state.timer === null) {
    load(section)
    state.timer = setInterval(() => load(section), DEFAULT_POLL_INTERVAL_MS)
  }

  return () => {
    const current = sections.get(section)
    if (!current) return
    current.listeners.delete(fn)
    if (current.listeners.size === 0 && current.timer !== null) {
      clearInterval(current.timer)
      current.timer = null
    }
  }
}

/** This section's overrides, kept live. Empty until the first fetch lands. */
export function usePageTextSection(section: string): Map<string, string> {
  const [overrides, setOverrides] = useState<Map<string, string>>(
    () => sections.get(section)?.overrides ?? new Map(),
  )

  useEffect(() => {
    // Adopt whatever is already cached before the first fetch of this mount.
    const cached = sections.get(section)?.overrides
    if (cached && cached.size > 0) setOverrides(cached)
    return subscribe(section, setOverrides)
  }, [section])

  return overrides
}
