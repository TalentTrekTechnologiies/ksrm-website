"use client"

import { useEffect } from "react"
import { getPublicSiteSettings } from "@/lib/site-settings-api"

/**
 * Updates the browser tab icon at runtime if a custom favicon is set in
 * Site Settings. `app/favicon.ico` (the static file) is still the real,
 * always-correct fallback shown before this JS runs and if the fetch
 * fails - this component only ever swaps the `<link rel="icon">` href
 * client-side after the fact, since a static export has no server-side way
 * to make the favicon.ico convention route itself dynamic.
 */
export default function DynamicFavicon() {
  useEffect(() => {
    getPublicSiteSettings("branding")
      .then((settings) => {
        const url = settings["site.faviconUrl"]
        if (!url || url === "/favicon.ico") return
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
        if (!link) {
          link = document.createElement("link")
          link.rel = "icon"
          document.head.appendChild(link)
        }
        link.href = url
      })
      .catch(() => {
        // Network/API failure - the static favicon.ico stays as-is.
      })
  }, [])

  return null
}
