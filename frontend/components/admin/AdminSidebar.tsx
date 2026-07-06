"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ScrollText,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react"
import { getDashboardOverview } from "@/lib/dashboard-api"
import { getStoredAdmin } from "@/lib/auth"
import { widgetIcon } from "@/lib/dashboard-icons"

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

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-admin-primary text-white"
          : "text-slate-400 hover:bg-admin-sidebar-hover hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-admin-gold" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

export default function AdminSidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()
  const [visibleKeys, setVisibleKeys] = useState<Set<string> | null>(null)
  const admin = getStoredAdmin()

  useEffect(() => {
    let cancelled = false
    getDashboardOverview()
      .then((overview) => {
        if (!cancelled) {
          setVisibleKeys(new Set(overview.widgets.map((w) => w.key)))
        }
      })
      .catch(() => {
        // If the overview call fails, fail open to showing no module links
        // rather than crashing the whole admin shell - Dashboard/Audit Logs
        // links (below) don't depend on this and remain usable regardless.
        if (!cancelled) setVisibleKeys(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <nav
      style={{ background: "var(--color-admin-sidebar)", boxShadow: "var(--shadow-admin-sidebar)" }}
      className={`flex h-full flex-col gap-1 py-4 transition-all duration-200 ${
        collapsed ? "w-[76px] px-2" : "w-64 px-3"
      }`}
    >
      <div className={`mb-3 flex items-center gap-2.5 px-2 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          <Image src="/logo.png" alt="KSRM" width={36} height={36} className="mix-blend-screen" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p
              style={{ fontFamily: "var(--font-admin-heading)" }}
              className="truncate text-sm font-bold text-white"
            >
              KSRM CMS
            </p>
            {admin && <p className="truncate text-xs text-slate-400">{admin.name}</p>}
          </div>
        )}
      </div>

      <div onClick={onNavigate}>
        <NavLink
          href="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          active={pathname === "/admin/dashboard"}
          collapsed={collapsed}
        />
      </div>

      <div className={`my-2 border-t border-white/10 ${collapsed ? "mx-1" : ""}`} />

      {visibleKeys === null ? (
        <div className="space-y-2 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : (
        <div onClick={onNavigate} className="contents">
          {NAV_ITEMS.filter((item) => visibleKeys.has(item.widgetKey)).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={widgetIcon(item.widgetKey)}
              active={pathname?.startsWith(item.href) ?? false}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}

      {admin?.isSuperAdmin && (
        <>
          <div className={`my-2 border-t border-white/10 ${collapsed ? "mx-1" : ""}`} />
          <div onClick={onNavigate}>
            <NavLink
              href="/admin/audit-logs"
              label="Audit Logs"
              icon={ScrollText}
              active={pathname === "/admin/audit-logs"}
              collapsed={collapsed}
            />
          </div>
        </>
      )}

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-auto hidden items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-slate-400 hover:bg-admin-sidebar-hover hover:text-white md:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="h-4 w-4" /> Collapse
            </>
          )}
        </button>
      )}
    </nav>
  )
}
