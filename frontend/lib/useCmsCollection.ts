"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiError } from "./api-client"

/**
 * Extracts the load/refresh/error-state pattern duplicated across every
 * Sprint 1A list manager (StatisticsManager, QuickLinksManager) into one
 * hook, so future list-shaped modules (News, Gallery, ...) don't
 * copy-paste it a third/fourth/fifth time.
 *
 * `fetchFn` must be a stable reference (useCallback/useMemo it, or define
 * it outside the render if it captures no props) - like any effect
 * dependency, a new function identity every render re-triggers the load.
 */
export function useCmsCollection<T>(fetchFn: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // No loading spinner - swaps in fresh data quietly after a mutation
  // (create/update/delete/restore/reorder), unlike the initial load below.
  const refresh = useCallback(async () => {
    try {
      setItems(await fetchFn())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load data")
    }
  }, [fetchFn])

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchFn()
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [fetchFn])

  return { items, setItems, loading, error, setError, refresh }
}
