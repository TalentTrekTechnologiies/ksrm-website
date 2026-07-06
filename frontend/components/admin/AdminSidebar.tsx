"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getDashboardOverview } from "@/lib/dashboard-api"
import { getStoredAdmin } from "@/lib/auth"

interface NavItem {
  /** Matches a DashboardWidget.key from GET /dashboard/overview. */
  widgetKey: string
  label: string
  href: string
}

// Only modules that already have a real admin page today - see
// DATA_MODEL_DESIGN.md's Phase 1B content entities (departments, research,
// downloads, committees, page_content, contact, site_settings, roles) for
// modules that exist in the data model and would show a real count on the
// dashboard, but have no admin CRUD page yet to link to. Adding one is a
// one-line addition here once that page exists.
const NAV_ITEMS: NavItem[] = [
  { widgetKey: "faculty", label: "Faculty", href: "/admin/faculty" },
  { widgetKey: "news", label: "News", href: "/admin/news" },
  { widgetKey: "gallery", label: "Gallery", href: "/admin/gallery" },
  { widgetKey: "placements", label: "Placements", href: "/admin/placements" },
  {
    widgetKey: "exam_notifications",
    label: "Exam Notifications",
    href: "/admin/exam-notifications",
  },
  {
    widgetKey: "notifications",
    label: "Ticker Notices",
    href: "/admin/notifications",
  },
  {
    widgetKey: "degree_verification",
    label: "Degree Verification",
    href: "/admin/degree-verification",
  },
  { widgetKey: "admins", label: "Admins", href: "/admin/admins" },
]

function SidebarLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  )
}

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [visibleKeys, setVisibleKeys] = useState<Set<string> | null>(null)
  const admin = getStoredAdmin()

  useEffect(() => {
    let cancelled = false
    getDashboardOverview()
      .then((overview) => {
        if (!cancelled) {
          setVisibleKeys(new Set(overview.widgets.map((w) => w.key)));
        }
      })
      .catch(() => {
        // If the overview call fails, fail open to showing no module links
        // rather than crashing the whole admin shell - Dashboard/Audit Logs
        // links (below) don't depend on this and remain usable regardless.
        if (!cancelled) setVisibleKeys(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [])

  return (
    <nav
      style={{ background: "var(--color-navy)" }}
      className="flex h-full w-64 flex-col gap-1 p-4"
    >
      <div className="mb-4 px-3">
        <p style={{ fontFamily: "var(--font-heading)" }} className="text-lg font-bold text-white">
          KSRM CMS
        </p>
        {admin && <p className="truncate text-xs text-white/60">{admin.name}</p>}
      </div>

      <div onClick={onNavigate}>
        <SidebarLink
          href="/admin/dashboard"
          label="Dashboard"
          active={pathname === "/admin/dashboard"}
        />
      </div>

      {visibleKeys === null ? (
        <div className="mt-2 space-y-2 px-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      ) : (
        <div onClick={onNavigate} className="contents">
          {NAV_ITEMS.filter((item) => visibleKeys.has(item.widgetKey)).map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname?.startsWith(item.href) ?? false}
            />
          ))}
        </div>
      )}

      {admin?.isSuperAdmin && (
        <div onClick={onNavigate} className="mt-2 border-t border-white/10 pt-2">
          <SidebarLink
            href="/admin/audit-logs"
            label="Audit Logs"
            active={pathname === "/admin/audit-logs"}
          />
        </div>
      )}
    </nav>
  )
}
