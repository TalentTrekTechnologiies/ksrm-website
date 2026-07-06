"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Menu, Search, User } from "lucide-react"
import { clearSession, getStoredAdmin } from "@/lib/auth"
import { getRecentActivity, RecentActivityItem } from "@/lib/dashboard-api"

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [ref, onOutside])
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const admin = getStoredAdmin()

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activity, setActivity] = useState<RecentActivityItem[] | null>(null)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(profileRef, () => setProfileOpen(false))

  useEffect(() => {
    if (notifOpen && activity === null) {
      getRecentActivity(5)
        .then((res) => setActivity(res.items))
        .catch(() => setActivity([]))
    }
  }, [notifOpen, activity])

  function handleLogout() {
    clearSession()
    router.push("/admin/login")
  }

  return (
    <header
      style={{ background: "var(--color-admin-card)", borderColor: "var(--color-admin-border)" }}
      className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6"
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg border border-admin-border bg-admin-bg py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v)
              setProfileOpen(false)
            }}
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-admin-border bg-white py-2 shadow-xl">
              <p className="px-4 pb-2 text-sm font-semibold text-slate-700">Recent Activity</p>
              {activity === null ? (
                <div className="space-y-2 px-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">No recent activity.</p>
              ) : (
                <ul>
                  {activity.map((item) => (
                    <li key={item.id} className="px-4 py-2 text-sm hover:bg-admin-bg">
                      <p className="text-slate-700">
                        <span className="font-medium">{item.adminName}</span>{" "}
                        <span className="text-slate-500">
                          {item.action.toLowerCase()}d {item.module}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-primary text-xs font-semibold text-white">
              {admin ? initials(admin.name) : <User className="h-4 w-4" />}
            </div>
            {admin && (
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                {admin.name}
              </span>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-admin-border bg-white py-2 shadow-xl">
              <div className="border-b border-admin-border px-4 py-2.5">
                <p className="truncate text-sm font-semibold text-slate-800">{admin?.name}</p>
                <p className="truncate text-xs text-slate-400">{admin?.email}</p>
                {admin?.isSuperAdmin && (
                  <span className="mt-1.5 inline-block rounded-full bg-admin-gold/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Super Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
