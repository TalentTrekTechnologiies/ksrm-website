"use client"

import { useState } from "react"
import Link from "next/link"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import FlowerShower from "@/components/layout/FlowerShower"

const FALLBACK_LOGO_URL = "/header.webp"

/**
 * The header banner's shape while it loads: the banner uploaded in Site
 * Settings (1507 x 201). Reserving it is what keeps the page still.
 *
 * The header used to paint the bundled banner first, then swap in the CMS one.
 * The bundled banner is an older design (it even shows a different CGPA on the
 * NAAC badge), its reserved size did not match either image, and the CMS
 * <img> had no size at all - so the header collapsed while the new banner
 * loaded and grew back when it arrived. Measured on the live homepage: the
 * whole page jumped up ~200px and back down again on every load, the largest
 * layout shift on the site.
 */
const RESERVED_RATIO = "1507 / 201"

export default function Header() {
  // null until Site Settings answer, so the header knows which banner to show
  // before showing any - rather than flashing the bundled one first.
  //
  // Polled so a branding change in Site Settings reaches an already-open page
  // without a refresh; a failed poll keeps the last good value.
  const settings = useLiveData<Record<string, string>>(() => getPublicSiteSettings("branding"), [])
  // A configured logo whose FILE is missing (404) used to leave the header
  // blank: the setting is non-empty, so the `||` fallback never fired, and the
  // broken <img> rendered as nothing. A visitor with the old logo still cached
  // saw it fine while a fresh device saw an empty header. Remember the URL that
  // failed to load and fall back to the bundled logo; a later poll returning a
  // different URL is tried again rather than being written off.
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const [loadedLogoUrl, setLoadedLogoUrl] = useState<string | null>(null)
  const cmsLogoUrl = settings?.["site.logoUrl"] || ""
  // The bundled banner only when Site Settings has none (or it failed to load).
  const logoUrl =
    settings === null ? null : cmsLogoUrl && cmsLogoUrl !== failedLogoUrl ? cmsLogoUrl : FALLBACK_LOGO_URL
  const collegeName = settings?.["site.collegeName"] || "K.S.R.M. College of Engineering"

  // Defaults to on when the setting hasn't been created yet.
  const showFlowers = (settings?.["site.headerFlowerShower"] ?? "true") !== "false"

  return (
    <header style={{ width: "100%", background: "#fff", position: "relative" }}>
      <Link href="/" aria-label={collegeName}>
        {/* The box holds the banner's height until the image has loaded, then
            lets the image size itself. */}
        <div style={{ width: "100%", aspectRatio: logoUrl && loadedLogoUrl === logoUrl ? undefined : RESERVED_RATIO }}>
          {logoUrl && (
            // A Media Library URL is dynamic, not a build-time static asset -
            // plain <img>, like every other Media-Library-backed image here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logoUrl}
              src={logoUrl}
              alt={collegeName}
              fetchPriority="high"
              onLoad={() => setLoadedLogoUrl(logoUrl)}
              onError={() => setFailedLogoUrl(logoUrl)}
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
            />
          )}
        </div>
      </Link>
      {/* Petals over the founder's portrait at the right edge of the banner.
          The overlay is positioned against that portrait's place in the banner
          (its right ~11%), so it suits a banner laid out that way.

          This used to be suppressed whenever a logo had been uploaded through
          the CMS, on the reasoning that a custom banner might have something
          else in that corner. In practice the replacement banner keeps the same
          layout, and the effect silently vanished the moment anyone uploaded
          one - leaving a Site Settings switch that was on and did nothing.
          The switch decides now; an admin who dislikes where the petals land
          can see that and turn it off. */}
      {showFlowers && <FlowerShower />}
    </header>
  )
}
