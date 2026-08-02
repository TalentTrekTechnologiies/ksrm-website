"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import FlowerShower from "@/components/layout/FlowerShower"

const FALLBACK_LOGO_URL = "/header.png"

export default function Header() {
  // Fallback shown immediately (and kept if the CMS hasn't set a custom
  // logo, or the API is unreachable) so the header never renders empty -
  // same pattern as Hero.tsx's FALLBACK_* constants.
  //
  // Polled so a branding change in Site Settings reaches an already-open page
  // without a refresh; a failed poll keeps the last good value.
  const settings = useLiveData<Record<string, string>>(
    () => getPublicSiteSettings("branding"),
    [],
    { initialValue: {} },
  )
  // A configured logo whose FILE is missing (404) used to leave the header
  // blank: the setting is non-empty, so the `||` fallback never fired, and the
  // broken <img> rendered as nothing. A visitor with the old logo still cached
  // saw it fine while a fresh device saw an empty header. Remember the URL that
  // failed to load and fall back to the bundled logo; a later poll returning a
  // different URL is tried again rather than being written off.
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const cmsLogoUrl = settings?.["site.logoUrl"] || ""
  const logoUrl = cmsLogoUrl && cmsLogoUrl !== failedLogoUrl ? cmsLogoUrl : FALLBACK_LOGO_URL
  const collegeName = settings?.["site.collegeName"] || "K.S.R.M. College of Engineering"

  const isCustomLogo = logoUrl !== FALLBACK_LOGO_URL
  // Defaults to on when the setting hasn't been created yet.
  const showFlowers = (settings?.["site.headerFlowerShower"] ?? "true") !== "false"

  return (
    <header style={{ width: "100%", background: "#fff", position: "relative" }}>
      <Link href="/">
        {isCustomLogo ? (
          // A Media Library URL is dynamic/remote, not a build-time-known
          // static asset - plain <img>, matching how every other
          // Media-Library-backed image in this codebase is rendered
          // (next/image's static optimization doesn't apply here).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={collegeName}
            onError={() => setFailedLogoUrl(logoUrl)}
            style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
          />
        ) : (
          <Image
            src={FALLBACK_LOGO_URL}
            alt={collegeName}
            width={2048}
            height={333}
            priority
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        )}
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
