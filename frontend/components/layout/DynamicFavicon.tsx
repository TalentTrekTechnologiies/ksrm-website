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
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }
    link.href = url
  }, [url])

  return null
}
