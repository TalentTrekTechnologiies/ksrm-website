"use client"

import { useEffect, useState } from "react"
import { getContentStyles, ContentStyle, styleKey } from "./content-styles-api"
import { DEFAULT_POLL_INTERVAL_MS } from "./use-live-data"
import { onContentChange } from "./content-version-store"

/**
 * One fetch per module, shared by every <StyledText> on the page.
 *
 * The same arrangement as page-text-store, for the same reason: a news list of
 * forty items would otherwise make forty identical requests on mount and leave
 * forty pollers running. The first component to ask for a module starts the
 * fetch and the interval, the rest attach to it, and the last to unmount stops
 * it.
 *
 * Module-level rather than a React context, so a component can be dropped
 * anywhere - including inside a server-rendered page - with no provider.
 */

export interface StyleEntry {
  fontSize: string | null
  color: string | null
}

interface ModuleState {
  styles: Map<string, StyleEntry>
  listeners: Set<(m: Map<string, StyleEntry>) => void>
  timer: ReturnType<typeof setInterval> | null
  unsubscribe?: () => void
}

const modules = new Map<string, ModuleState>()

function toMap(rows: ContentStyle[]): Map<string, StyleEntry> {
  return new Map(
    rows.map((r) => [styleKey(r.recordId, r.field), { fontSize: r.fontSize, color: r.color }]),
  )
}

function sameMap(a: Map<string, StyleEntry>, b: Map<string, StyleEntry>): boolean {
  if (a.size !== b.size) return false
  for (const [k, v] of a) {
    const other = b.get(k)
    if (!other) return false
    if ((other.fontSize ?? null) !== (v.fontSize ?? null)) return false
    if ((other.color ?? null) !== (v.color ?? null)) return false
  }
  return true
}

function load(module: string) {
  const state = modules.get(module)
  if (!state) return
  getContentStyles(module)
    .then((rows) => {
      const next = toMap(rows)
      const current = modules.get(module)
      if (!current) return
      // Only notify on a real change, so polling does not re-render the page
      // every interval when nothing has been edited.
      if (sameMap(current.styles, next)) return
      current.styles = next
      current.listeners.forEach((fn) => fn(next))
    })
    .catch(() => {
      // Keep whatever loaded last. Styling is decoration: a failed poll must
      // never be able to change what a page says or strip it back to nothing.
    })
}

function subscribe(module: string, fn: (m: Map<string, StyleEntry>) => void): () => void {
  let state = modules.get(module)
  if (!state) {
    state = { styles: new Map(), listeners: new Set(), timer: null }
    modules.set(module, state)
  }
  state.listeners.add(fn)

  if (state.timer === null) {
    load(module)
    // Reload the instant anything is edited; the interval is only a fallback
    // for when that signal is unavailable, matching useLiveData.
    state.unsubscribe = onContentChange(() => load(module))
    state.timer = setInterval(() => load(module), DEFAULT_POLL_INTERVAL_MS)
  }

  return () => {
    const current = modules.get(module)
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

/** This module's styles, kept live. Empty until the first fetch lands. */
export function useContentStyleModule(module: string): Map<string, StyleEntry> {
  const [state, setState] = useState<{ module: string; styles: Map<string, StyleEntry> }>(() => ({
    module,
    styles: modules.get(module)?.styles ?? new Map(),
  }))

  // Adopt whatever is cached for a new module during render rather than in an
  // effect, so the previous module's styling is never painted for a frame.
  if (state.module !== module) {
    setState({ module, styles: modules.get(module)?.styles ?? new Map() })
  }

  useEffect(() => {
    return subscribe(module, (styles) => setState({ module, styles }))
  }, [module])

  return state.styles
}
