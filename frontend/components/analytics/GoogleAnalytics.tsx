"use client"

import Script from "next/script"

/**
 * Google Analytics 4. Loads only when NEXT_PUBLIC_GA_ID is set at build time
 * (e.g. "G-XXXXXXXXXX"), so it's a no-op until you plug in your Measurement ID -
 * nothing loads, no cookies, no effect. Works with the static export because
 * gtag runs entirely client-side.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
