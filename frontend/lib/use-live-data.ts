"use client"

import { useEffect, useRef, useState } from "react"

// Every CMS-driven public section previously fetched its content once on
// mount and never again - since these components live under the persistent
// root layout (ChromeGate/page components aren't remounted by client-side
// navigation), a publish/edit made in the admin panel in another tab would
// never appear without a hard reload. This hook re-fetches on an interval
// so published changes show up on their own.
// Environment-aware: snappy 2s in local dev, a server-friendly 30s in
// production builds (a homepage mounts ~14 polling sections - at 2s that's
// ~7 req/s *per visitor*, which would overwhelm modest hosting under real
// traffic; at 30s content still feels live). Override either way with
// NEXT_PUBLIC_POLL_INTERVAL_MS at build time.
export const DEFAULT_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ??
    (process.env.NODE_ENV === "production" ? 30_000 : 2_000),
)

/**
 * Fetches on mount, then re-fetches on an interval. On failure, whatever
 * was last successfully loaded (or `initialValue`) is kept rather than
 * cleared, so a transient network hiccup never blanks content already
 * showing on the page.
 */
export function useLiveData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  options?: { intervalMs?: number; initialValue?: T | null; skip?: boolean },
): T | null {
  const [data, setData] = useState<T | null>(options?.initialValue ?? null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    if (options?.skip) return
    let cancelled = false
    const load = () => {
      fetcherRef.current()
        .then((result) => {
          if (!cancelled) setData(result)
        })
        .catch(() => {
          // Keep the last successfully loaded value on a transient failure.
        })
    }
    load()
    const interval = setInterval(load, options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return data
}
