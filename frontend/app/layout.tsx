import type { Metadata, Viewport } from "next"
import { Rajdhani, DM_Sans, Inter } from "next/font/google"
import "./globals.css"
import ChromeGate from "@/components/layout/ChromeGate"
import DynamicFavicon from "@/components/layout/DynamicFavicon"
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics"
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd"
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

// Admin panel only (see globals.css's --font-admin-body) - the public site
// keeps DM Sans throughout, unchanged.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

// Defaults for the whole site AND the homepage's own metadata (the homepage has
// no other file to declare it in). Every other route overrides title,
// description and canonical via its own page/layout - verified at build by
// scripts/seo-audit.mjs, which fails loudly if a route falls back to these.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "",
    fullTitle: `${SITE_NAME}, Kadapa | KSRMCE`,
    description:
      "K.S.R.M. College of Engineering, Kadapa - a UGC Autonomous, NAAC A+ accredited and NBA Tier-1 engineering college in Andhra Pradesh, offering B.Tech, M.Tech and MBA programmes.",
    path: "/",
  }),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  // Google Search Console ownership verification. Set
  // NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the token Search Console gives you;
  // when unset, no tag is emitted (harmless).
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/*
          The institution and the site as entities. Previously this was one
          inline EducationalOrganization object that asserted three social
          profiles the college has not confirmed - and which disagreed with the
          four different handles in the footer. `sameAs` is omitted until the
          real profile URLs are supplied; an unverified sameAs risks binding the
          wrong accounts to the college's Knowledge Graph entity.

          `numberOfEmployees: "150+"` was also dropped: schema.org expects a
          number or QuantitativeValue there, not a marketing string.
        */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className={`${rajdhani.variable} ${dmSans.variable} ${inter.variable} antialiased`}>
        <GoogleAnalytics />
        <DynamicFavicon />
        <ChromeGate>{children}</ChromeGate>
      </body>
    </html>
  )
}