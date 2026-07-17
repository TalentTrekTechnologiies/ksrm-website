"use client"

import Image from "next/image"
import Link from "next/link"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"

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
  const logoUrl = settings?.["site.logoUrl"] || FALLBACK_LOGO_URL
  const collegeName = settings?.["site.collegeName"] || "KSRM College of Engineering"

  const isCustomLogo = logoUrl !== FALLBACK_LOGO_URL

  return (
    <header style={{ width: "100%", background: "#fff" }}>
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
    </header>
  )
}
