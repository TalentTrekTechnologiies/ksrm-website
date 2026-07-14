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
  ChevronDown,
  Globe,
  type LucideIcon,
} from "lucide-react"
import { getDashboardOverview } from "@/lib/dashboard-api"
import { getStoredAdmin, hasPermission } from "@/lib/auth"
import { widgetIcon } from "@/lib/dashboard-icons"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"
import { Building2 } from "lucide-react"

const HOMEPAGE_SUB_ITEMS = [
  { href: "/admin/homepage/hero", label: "Hero Banner" },
  { href: "/admin/homepage/statistics", label: "Statistics" },
  { href: "/admin/homepage/quick-links", label: "Quick Links" },
  { href: "/admin/homepage/sections/vision", label: "Vision" },
  { href: "/admin/homepage/sections/mission", label: "Mission" },
  { href: "/admin/homepage/sections/about", label: "About" },
  { href: "/admin/homepage/sections/admissions", label: "Admissions" },
  { href: "/admin/homepage/departments", label: "Departments" },
  { href: "/admin/homepage/testimonials", label: "Testimonials" },
  { href: "/admin/homepage/campus-videos", label: "Campus Videos" },
  { href: "/admin/homepage/accreditation", label: "Accreditation" },
  { href: "/admin/homepage/recruiters", label: "Recruiters" },
]

interface NavItem {
  /** Matches a DashboardWidget.key from GET /dashboard/overview. */
  widgetKey: string
  label: string
  href: string
}

// Only modules that already have a real admin page today - see
// DATA_MODEL_DESIGN.md's Phase 1B content entities (research, page_content,
// contact, roles) for modules that exist in the data model and would show a
// real count on the dashboard, but have no admin CRUD page yet to link to.
// Adding one is a one-line addition here once that page exists.
// Faculty/Gallery/Downloads are deliberately NOT in this flat list - all
// three are department-owned content and are managed exclusively through
// the per-department workspace (see the "Departments" tree section below),
// per the Department Restructuring pass. The old flat /admin/faculty,
// /admin/gallery, /admin/downloads pages still exist (unlinked, reachable
// via the tree's "All / unassigned records" escape hatch) so a record with
// no departmentId set is never unmanageable.
const NAV_ITEMS: NavItem[] = [
  { widgetKey: "announcements", label: "Announcements", href: "/admin/announcements" },
  { widgetKey: "media", label: "Media Library", href: "/admin/media" },
  { widgetKey: "gallery", label: "Gallery", href: "/admin/gallery" },
  { widgetKey: "downloads", label: "Downloads", href: "/admin/downloads" },
  { widgetKey: "news", label: "News", href: "/admin/news" },
  { widgetKey: "placements", label: "Placements", href: "/admin/placements" },
  { widgetKey: "careers", label: "Careers", href: "/admin/careers" },
  { widgetKey: "career_applications", label: "Job Applications", href: "/admin/careers/applications" },
  { widgetKey: "events", label: "Events", href: "/admin/events" },
  { widgetKey: "committees", label: "Committees", href: "/admin/committees" },
  {
    widgetKey: "exam_notifications",
    label: "Exam Notifications",
    href: "/admin/exam-notifications",
  },
  { widgetKey: "site_settings", label: "Site Settings", href: "/admin/settings" },
  { widgetKey: "admins", label: "Admins", href: "/admin/admins" },
  { widgetKey: "roles", label: "Roles & Permissions", href: "/admin/roles" },
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
  const isOnHomepageSection = pathname?.startsWith("/admin/homepage") ?? false
  const [homepageExpanded, setHomepageExpanded] = useState(isOnHomepageSection)
  const isOnDepartmentsSection =
    (pathname?.startsWith("/admin/departments") ||
      pathname === "/admin/faculty" ||
      pathname === "/admin/gallery" ||
      pathname === "/admin/downloads") ??
    false
  const [departmentsExpanded, setDepartmentsExpanded] = useState(isOnDepartmentsSection)
  const [departments, setDepartments] = useState<Department[] | null>(null)

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

  useEffect(() => {
    if (!hasPermission(admin, "departments.view")) return
    let cancelled = false
    getDepartmentsAdmin()
      .then((all) => {
        if (!cancelled) setDepartments(all.filter((d) => d.isActive).sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(() => {
        if (!cancelled) setDepartments([])
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Image src="/logo.png" alt="KSRM" width={36} height={36} className="object-cover" />
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

      {hasPermission(admin, "homepage.view") && (
        <>
          {collapsed ? (
            <div onClick={onNavigate}>
              <NavLink
                href="/admin/homepage"
                label="Homepage"
                icon={Globe}
                active={isOnHomepageSection}
                collapsed={collapsed}
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setHomepageExpanded((v) => !v)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isOnHomepageSection
                    ? "bg-admin-primary text-white"
                    : "text-slate-400 hover:bg-admin-sidebar-hover hover:text-white"
                }`}
              >
                <Globe className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate text-left">Homepage</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${homepageExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {homepageExpanded && (
                <div onClick={onNavigate} className="mt-1 space-y-1 pl-8">
                  {HOMEPAGE_SUB_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname?.startsWith(item.href)
                          ? "font-semibold text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {hasPermission(admin, "departments.view") && (
        <>
          {collapsed ? (
            <div onClick={onNavigate}>
              <NavLink
                href="/admin/departments"
                label="Departments"
                icon={Building2}
                active={isOnDepartmentsSection}
                collapsed={collapsed}
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setDepartmentsExpanded((v) => !v)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isOnDepartmentsSection
                    ? "bg-admin-primary text-white"
                    : "text-slate-400 hover:bg-admin-sidebar-hover hover:text-white"
                }`}
              >
                <Building2 className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate text-left">Departments</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${departmentsExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {departmentsExpanded && (
                <div className="mt-1 space-y-1 pl-8">
                  {departments === null ? (
                    <div className="space-y-1.5 py-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 w-28 animate-pulse rounded bg-white/5" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {departments.map((dept) => {
                        const href = `/admin/departments/workspace?id=${dept.id}&tab=profile`
                        const active =
                          pathname === "/admin/departments/workspace" &&
                          new URLSearchParams(
                            typeof window !== "undefined" ? window.location.search : "",
                          ).get("id") === String(dept.id)
                        return (
                          <Link
                            key={dept.id}
                            href={href}
                            onClick={onNavigate}
                            className={`block truncate rounded-lg px-3 py-2 text-sm transition-colors ${
                              active ? "font-semibold text-white" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {dept.shortName || dept.name}
                          </Link>
                        )
                      })}
                      <div onClick={onNavigate} className="mt-1 border-t border-white/10 pt-1">
                        <Link
                          href="/admin/departments"
                          className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:text-white"
                        >
                          Manage Departments
                        </Link>
                        <Link
                          href="/admin/faculty"
                          className="block rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-white"
                        >
                          All Faculty (unassigned)
                        </Link>
                        <Link
                          href="/admin/gallery"
                          className="block rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-white"
                        >
                          All Gallery (unassigned)
                        </Link>
                        <Link
                          href="/admin/downloads"
                          className="block rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-white"
                        >
                          All Downloads (unassigned)
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

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
