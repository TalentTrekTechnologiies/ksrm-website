"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminNavbar from "@/components/admin/AdminNavbar"
import CmsConfirmProvider from "@/components/admin/cms/CmsConfirmProvider"
import CmsIntroTour from "@/components/admin/cms/CmsIntroTour"
import { isLoggedIn } from "@/lib/auth"

/**
 * Client-side auth guard + admin chrome for every /admin/** route except
 * /admin/login itself. There is no server at runtime (see next.config.ts's
 * `output: "export"`), so this can only ever be a client-side check run
 * after hydration - a brief unauthenticated flash of nothing (not of
 * protected content) is the tradeoff, handled below via `authChecked`.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  // The homepage Preview panel loads this route inside an <iframe> to get a
  // real independent browsing context (so each public component's actual
  // @media breakpoints fire correctly - see CmsPreviewPanel's doc comment).
  // It only ever renders content already authenticated on the parent admin
  // page, so it skips both the Sidebar/Navbar chrome and the auth redirect
  // - a bare content frame, not a nested copy of the whole admin shell.
  const isPreviewRoute = pathname?.startsWith("/admin/homepage/preview/") ?? false
  const skipChrome = isLoginPage || isPreviewRoute

  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    // Reading localStorage (via isLoggedIn) must happen post-hydration, not
    // during render, to avoid a server/client markup mismatch against the
    // statically-exported HTML shell - an effect is the only correct place
    // for this specific check, unlike the data-fetching effects elsewhere
    // in this admin panel, which can be (and are) restructured to set state
    // only after an async boundary.
    if (skipChrome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true)
      return
    }
    if (!isLoggedIn()) {
      router.replace("/admin/login")
      return
    }
    setAuthChecked(true)
  }, [skipChrome, router])

  if (skipChrome) {
    return <CmsConfirmProvider>{children}</CmsConfirmProvider>
  }

  if (!authChecked) {
    return (
      <div style={{ background: "var(--color-admin-bg)" }} className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <CmsConfirmProvider>
    <div className="flex min-h-screen" style={{ background: "var(--color-admin-bg)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        {/* min-w-0 - without it, a flex item's default min-width is "auto"
            (won't shrink below its content's intrinsic width), so a wide
            table on a narrow viewport pushes the whole page into
            horizontal scroll instead of scrolling just the table inside
            its own overflow-x-auto wrapper. */}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
      {/* First-login walkthrough; auto-opens once per admin, reopenable from
          the navbar's ? button. Inside the auth-gated chrome only, so it never
          shows on /admin/login or in the preview iframe. */}
      <CmsIntroTour />
    </div>
    </CmsConfirmProvider>
  )
}
