"use client"

import { usePathname } from "next/navigation"
import IntroSplash from "@/components/layout/IntroSplash"
import DemoRibbon from "@/components/layout/DemoRibbon"
import PopupNotice from "@/components/layout/PopupNotice"
import TopBar from "@/components/layout/TopBar"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import BackToTop from "@/components/layout/BackToTop"
import VisitorCounter from "@/components/layout/VisitorCounter"
import AnnouncementTicker from "@/components/layout/AnnouncementTicker"

/**
 * The public marketing site's chrome (splash screen, top bar, header,
 * navbar, footer, back-to-top) is rendered unconditionally by the root
 * layout - there was no way to opt out of it per route before this. The
 * admin panel (/admin/**) needs its own distinct chrome (Sidebar/Navbar,
 * built separately in app/admin/layout.tsx), not the public site's, so
 * this gate skips the public chrome entirely for any /admin route.
 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") ?? false

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      {/* Single shared Google Fonts stylesheet for every public section
          (React hoists these to <head>). Individual components previously
          each carried their own @import - 16 duplicate render-blocking
          fetches per page - all removed in favour of this one. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,300..600&display=swap"
      />
      <IntroSplash />
      {/* Renders nothing outside the specimen build. */}
      <DemoRibbon />
      <PopupNotice />
      <TopBar />
      <Header />
      <AnnouncementTicker location="HEADER_TICKER" compact />
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
      <VisitorCounter />
    </>
  )
}
