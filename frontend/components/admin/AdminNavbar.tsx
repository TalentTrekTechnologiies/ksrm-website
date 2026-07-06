"use client"

import { useRouter } from "next/navigation"
import { clearSession, getStoredAdmin } from "@/lib/auth"

export default function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const admin = getStoredAdmin()

  function handleLogout() {
    clearSession()
    router.push("/admin/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-[var(--shadow-navbar)] md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      <span className="hidden text-sm text-neutral-500 md:inline">
        KSRM College of Engineering &mdash; Admin
      </span>

      <div className="flex items-center gap-3">
        {admin && (
          <span className="hidden items-center gap-2 text-sm font-medium text-neutral-700 sm:flex">
            {admin.name}
            {admin.isSuperAdmin && (
              <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-navy">
                Super Admin
              </span>
            )}
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-navy px-3 py-1.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
