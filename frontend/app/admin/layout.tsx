"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminNavbar from "@/components/admin/AdminNavbar"
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

  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Reading localStorage (via isLoggedIn) must happen post-hydration, not
    // during render, to avoid a server/client markup mismatch against the
    // statically-exported HTML shell - an effect is the only correct place
    // for this specific check, unlike the data-fetching effects elsewhere
    // in this admin panel, which can be (and are) restructured to set state
    // only after an async boundary.
    if (isLoginPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true)
      return
    }
    if (!isLoggedIn()) {
      router.replace("/admin/login")
      return
    }
    setAuthChecked(true)
  }, [isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!authChecked) {
    return (
      <div style={{ background: "var(--color-cream)" }} className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-cream)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
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

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
