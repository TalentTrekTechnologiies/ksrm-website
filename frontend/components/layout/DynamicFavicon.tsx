"use client"

import { useEffect } from "react"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * Updates the browser tab icon at runtime if a custom favicon is set in
 * Site Settings. `app/favicon.ico` (the static file) is still the real,
 * always-correct fallback shown before this JS runs and if the fetch
 * fails - this component only ever swaps the `<link rel="icon">` href
 * client-side after the fact, since a static export has no server-side way
 * to make the favicon.ico convention route itself dynamic.
 *
 * Polled, so changing the favicon in Site Settings retitles an already-open
 * tab without a refresh.
 *
 * Re-applied on every change to <head>, not just when the URL setting
 * changes. Next re-emits its own <link rel="icon"> from the app/favicon.ico
 * convention on each client-side navigation, which overwrites whatever href
 * was set here. Since this component lives in the root layout it never
 * remounts, so a one-shot effect keyed only on the URL ran once and never
 * again - the custom icon survived the first paint and reverted to the
 * default as soon as you clicked through to another page.
 */
export default function DynamicFavicon() {
  const settings = useLiveData<Record<string, string>>(
    () => getPublicSiteSettings("branding"),
    [],
    { initialValue: {} },
  )
  const url = settings?.["site.faviconUrl"]

  useEffect(() => {
    if (!url || url === "/favicon.ico") return

    function apply() {
      const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']")
      if (links.length === 0) {
        const link = document.createElement("link")
        link.rel = "icon"
        link.href = url as string
        document.head.appendChild(link)
        return
      }
      // Compared before writing so re-applying is a no-op once the icon is
      // already ours - otherwise each write would trip the observer that
      // called us and spin.
      links.forEach((link) => {
        if (link.getAttribute("href") !== url) link.setAttribute("href", url as string)
      })
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    })
    return () => observer.disconnect()
  }, [url])

  return null
}
