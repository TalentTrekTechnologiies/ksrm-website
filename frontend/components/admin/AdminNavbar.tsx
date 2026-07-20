"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, HelpCircle, LogOut, Menu, User } from "lucide-react"
import { clearSession, getStoredAdmin } from "@/lib/auth"
import { OPEN_TOUR_EVENT } from "@/components/admin/cms/CmsIntroTour"
import AdminQuickSearch from "@/components/admin/AdminQuickSearch"
import {
  AdminNotification,
  getAdminNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/admin-notifications-api"

// How often the bell re-checks the unread count while the admin has a tab open.
const UNREAD_POLL_MS = 60_000

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
  const [notifications, setNotifications] = useState<AdminNotification[] | null>(null)
  const [unread, setUnread] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(profileRef, () => setProfileOpen(false))

  const refreshUnread = useCallback(() => {
    getUnreadNotificationCount()
      .then((r) => setUnread(r.count))
      .catch(() => {
        /* badge just stays as-is if the count call fails */
      })
  }, [])

  // Poll the badge so a notification raised elsewhere shows up without a reload.
  useEffect(() => {
    refreshUnread()
    const t = setInterval(refreshUnread, UNREAD_POLL_MS)
    return () => clearInterval(t)
  }, [refreshUnread])

  // Load the list each time the panel opens, so it is never stale.
  useEffect(() => {
    if (!notifOpen) return
    getAdminNotifications({ limit: 8 })
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [notifOpen])

  async function handleOpenNotification(n: AdminNotification) {
    if (!n.isRead) {
      setNotifications((prev) => prev?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? prev)
      setUnread((c) => Math.max(0, c - 1))
      try {
        await markNotificationRead(n.id)
      } catch {
        refreshUnread() // reconcile if the write failed
      }
    }
    if (n.link) {
      setNotifOpen(false)
      router.push(n.link)
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev?.map((x) => ({ ...x, isRead: true })) ?? prev)
    setUnread(0)
    try {
      await markAllNotificationsRead()
    } catch {
      refreshUnread()
    }
  }

  function handleLogout() {
    clearSession()
    router.push("/admin/login")
  }

  return (
    <header
      style={{ borderColor: "var(--color-admin-border)" }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white/80 px-4 backdrop-blur-xl md:px-6"
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
        <AdminQuickSearch />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_TOUR_EVENT))}
          aria-label="Open the CMS tutorial"
          title="How to use this CMS"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v)
              setProfileOpen(false)
            }}
            aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-admin-border bg-white py-2 shadow-xl">
              <div className="flex items-center justify-between gap-2 px-4 pb-2">
                <p className="text-sm font-semibold text-slate-700">Notifications</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-admin-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications === null ? (
                <div className="space-y-2 px-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">You&apos;re all caught up.</p>
              ) : (
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenNotification(n)}
                        className={`flex w-full gap-2 px-4 py-2.5 text-left text-sm hover:bg-admin-bg ${n.isRead ? "" : "bg-admin-primary/5"}`}
                      >
                        <span
                          aria-hidden
                          className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-admin-primary"}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate ${n.isRead ? "text-slate-600" : "font-semibold text-slate-800"}`}>
                            {n.title}
                          </span>
                          {n.message && <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">{n.message}</span>}
                          <span className="mt-0.5 block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                        </span>
                      </button>
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
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-admin-border bg-white py-2 shadow-xl">
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
