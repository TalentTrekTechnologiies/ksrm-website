"use client"

import { useEffect, useRef, useState } from "react"
import { onContentChange } from "./content-version-store"

// Every CMS-driven public section previously fetched its content once on
// mount and never again - since these components live under the persistent
// root layout (ChromeGate/page components aren't remounted by client-side
// navigation), a publish/edit made in the admin panel in another tab would
// never appear without a hard reload. This hook re-fetches so published
// changes show up on their own.
//
// How that refresh is driven changed once the site got a content-version
// signal. Each section used to poll on its own timer, and with thirteen of them
// on the homepage the interval had to sit at 30 seconds in production to keep
// the request rate reasonable - so an editor could wait half a minute to see
// their own edit. Now a single cheap endpoint is watched centrally and every
// section reloads the moment it moves, which is both faster and lighter.
//
// The interval below is kept purely as a safety net for when that signal is
// unavailable (an older API without the endpoint, or a network blip), so it is
// deliberately slow. Override with NEXT_PUBLIC_POLL_INTERVAL_MS at build time.
export const DEFAULT_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ??
    (process.env.NODE_ENV === "production" ? 120_000 : 15_000),
)

/**
 * Fetches on mount, again whenever content changes anywhere on the site, and
 * on a slow fallback interval. On failure, whatever was last successfully
 * loaded (or `initialValue`) is kept rather than cleared, so a transient
 * network hiccup never blanks content already showing on the page.
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
    // Reload as soon as anything is edited, rather than waiting for the timer.
    const unsubscribe = onContentChange(load)
    const interval = setInterval(load, options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      unsubscribe()
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return data
}
