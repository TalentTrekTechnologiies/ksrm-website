"use client"

import { useEffect, useState } from "react"
import { getPageTextPublic, PageText } from "./page-text-api"
import { DEFAULT_POLL_INTERVAL_MS } from "./use-live-data"
import { onContentChange } from "./content-version-store"

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

/** A slot's override: its wording, plus any per-slot styling set with it. */
export interface PageTextEntry {
  value: string
  fontSize?: string | null
  color?: string | null
}

interface SectionState {
  overrides: Map<string, PageTextEntry>
  listeners: Set<(m: Map<string, PageTextEntry>) => void>
  timer: ReturnType<typeof setInterval> | null
  unsubscribe?: () => void
}

const sections = new Map<string, SectionState>()

function toMap(rows: PageText[]): Map<string, PageTextEntry> {
  return new Map(rows.map((r) => [r.key, { value: r.value, fontSize: r.fontSize, color: r.color }]))
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

function sameMap(a: Map<string, PageTextEntry>, b: Map<string, PageTextEntry>): boolean {
  if (a.size !== b.size) return false
  for (const [k, v] of a) {
    const other = b.get(k)
    // Compare the styling too, or a colour change would poll in and be
    // discarded as "no change".
    if (!other || other.value !== v.value) return false
    if ((other.fontSize ?? null) !== (v.fontSize ?? null)) return false
    if ((other.color ?? null) !== (v.color ?? null)) return false
  }
  return true
}

function subscribe(section: string, fn: (m: Map<string, PageTextEntry>) => void): () => void {
  let state = sections.get(section)
  if (!state) {
    state = { overrides: new Map(), listeners: new Set(), timer: null }
    sections.set(section, state)
  }
  state.listeners.add(fn)

  if (state.timer === null) {
    load(section)
    // Reload the instant anything is edited; the interval is only a fallback
    // for when that signal is unavailable, matching useLiveData.
    state.unsubscribe = onContentChange(() => load(section))
    state.timer = setInterval(() => load(section), DEFAULT_POLL_INTERVAL_MS)
  }

  return () => {
    const current = sections.get(section)
    if (!current) return
    current.listeners.delete(fn)
    if (current.listeners.size === 0 && current.timer !== null) {
      clearInterval(current.timer)
      current.timer = null
      current.unsubscribe?.()
      current.unsubscribe = undefined
    }
  }
}

/** This section's overrides, kept live. Empty until the first fetch lands. */
export function usePageTextSection(section: string): Map<string, PageTextEntry> {
  const [state, setState] = useState<{ section: string; overrides: Map<string, PageTextEntry> }>(() => ({
    section,
    overrides: sections.get(section)?.overrides ?? new Map(),
  }))

  // If the section changes, adopt whatever is already cached for the new one
  // straight away rather than showing the old section's text for a frame.
  // Adjusting state during render is React's own answer to this; doing it in an
  // effect would render the wrong text first and then correct it.
  if (state.section !== section) {
    setState({ section, overrides: sections.get(section)?.overrides ?? new Map() })
  }

  useEffect(() => {
    return subscribe(section, (overrides) => setState({ section, overrides }))
  }, [section])

  return state.section === section ? state.overrides : new Map()
}
