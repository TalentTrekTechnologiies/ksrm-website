"use client"

import { usePathname } from "next/navigation"
import IntroSplash from "@/components/layout/IntroSplash"
import TopBar from "@/components/layout/TopBar"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import BackToTop from "@/components/layout/BackToTop"

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
      <IntroSplash />
      <TopBar />
      <Header />
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
    </>
  )
}
