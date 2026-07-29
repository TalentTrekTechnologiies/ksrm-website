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
  GraduationCap,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import { getDashboardOverview } from "@/lib/dashboard-api"
import { getStoredAdmin, hasPermission } from "@/lib/auth"
import { PAGE_SECTIONS } from "@/lib/downloads-api"
import { widgetIcon } from "@/lib/dashboard-icons"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"
import { Building2 } from "lucide-react"

/**
 * Where the online exam module lives.
 *
 * Read at RUNTIME from /site-config.json, deliberately NOT from
 * NEXT_PUBLIC_EXAM_ADMIN_URL. This is a static export: any NEXT_PUBLIC_ value
 * is inlined into the compiled bundle at build time and frozen there, so
 * changing it would mean rebuilding and re-uploading the entire site just to
 * edit one link. site-config.json instead lands as a plain file at the root of
 * public_html, editable directly in hPanel's file manager - no rebuild, ever,
 * just to point this at a different address.
 *
 * Unset (or the fetch failing) means the link stays hidden: an admin seeing no
 * entry is far better than one clicking through to a dead address on exam
 * morning.
 */
function useExamAdminUrl(): string {
  const [url, setUrl] = useState("")
  useEffect(() => {
    fetch("/site-config.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        const value = cfg?.examAdminUrl?.replace(/\/$/, "") ?? ""
        if (value) setUrl(value)
      })
      .catch(() => {
        // No config file, or it's unreachable — link stays hidden, same as unset.
      })
  }, [])
  return url
}

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
  // Labelled "Documents" for admins - the model/route stay `downloads`, this is
  // wording only (a visitor still clicks a "Download" button on the public site).
  { widgetKey: "downloads", label: "Documents", href: "/admin/downloads" },
  { widgetKey: "news", label: "News", href: "/admin/news" },
  { widgetKey: "research", label: "Research", href: "/admin/research" },
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
  tourId,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
  /** Anchor for the guided tour's spotlight (CmsIntroTour). */
  tourId?: string
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={tourId}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-gradient-to-r from-admin-primary to-admin-primary-light text-white shadow-[0_4px_16px_rgba(30,58,138,0.45)]"
          : "text-slate-400 hover:translate-x-0.5 hover:bg-admin-sidebar-hover hover:text-white"
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

/**
 * A sidebar entry pointing at a different application rather than a CMS route.
 *
 * Kept separate from NavLink for two reasons: it needs a plain anchor, since
 * next/link is for in-app navigation and this URL belongs to another origin; and
 * it opens in a new tab so an admin never loses the CMS - or, more importantly,
 * never navigates away from an exam they are invigilating. It is never "active",
 * because no CMS pathname can match it.
 */
function ExternalNavLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string
  label: string
  icon: LucideIcon
  collapsed: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={collapsed ? label : undefined}
      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:translate-x-0.5 hover:bg-admin-sidebar-hover hover:text-white"
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {/* Signals up front that this leaves the CMS. */}
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" />
        </>
      )}
    </a>
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
  const isOnPageContentSection = pathname?.startsWith("/admin/page-content") ?? false
  const [pageContentExpanded, setPageContentExpanded] = useState(isOnPageContentSection)
  const examAdminUrl = useExamAdminUrl()

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
      style={{ background: "var(--gradient-admin-sidebar)", boxShadow: "var(--shadow-admin-sidebar)" }}
      className={`flex min-h-full flex-col gap-1 py-4 transition-all duration-200 ${
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
          tourId="nav-dashboard"
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
                tourId="nav-homepage"
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                data-tour="nav-homepage"
                onClick={() => setHomepageExpanded((v) => !v)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isOnHomepageSection
                    ? "bg-gradient-to-r from-admin-primary to-admin-primary-light text-white shadow-[0_4px_16px_rgba(30,58,138,0.45)]"
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
                tourId="nav-departments"
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                data-tour="nav-departments"
                onClick={() => setDepartmentsExpanded((v) => !v)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isOnDepartmentsSection
                    ? "bg-gradient-to-r from-admin-primary to-admin-primary-light text-white shadow-[0_4px_16px_rgba(30,58,138,0.45)]"
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
                          All Documents (unassigned)
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

      {/* Page Content - an expandable list of every public page (IQAC, IIC,
          NAAC, ...), mirroring the Departments dropdown above. Picking one
          opens that page's existing uploads plus its add document/image/video
          options. */}
      {hasPermission(admin, "downloads.view") && (
        collapsed ? (
          <div onClick={onNavigate}>
            <NavLink
              href="/admin/page-content"
              label="Page Content"
              icon={Globe}
              active={isOnPageContentSection}
              collapsed={collapsed}
            />
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setPageContentExpanded((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isOnPageContentSection
                  ? "bg-gradient-to-r from-admin-primary to-admin-primary-light text-white shadow-[0_4px_16px_rgba(30,58,138,0.45)]"
                  : "text-slate-400 hover:bg-admin-sidebar-hover hover:text-white"
              }`}
            >
              <Globe className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 truncate text-left">Page Content</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${pageContentExpanded ? "rotate-180" : ""}`} />
            </button>
            {pageContentExpanded && (
              <div className="mt-1 max-h-72 space-y-1 overflow-y-auto pl-8">
                {PAGE_SECTIONS.map((s) => (
                  <Link
                    key={s.value}
                    href={`/admin/page-content?section=${encodeURIComponent(s.value)}`}
                    onClick={onNavigate}
                    className="block truncate rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-admin-sidebar-hover hover:text-white"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
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
              tourId={`nav-${item.widgetKey}`}
            />
          ))}
        </div>
      )}

      {/*
          The online exam module. Deliberately outside the NAV_ITEMS list above:
          that list is filtered by the dashboard's widget keys, which only exist
          for modules living inside this CMS. This one is another application, so
          it is always shown when configured rather than gated on a widget that
          will never be reported.
      */}
      {examAdminUrl && (
        <>
          <div className={`my-2 border-t border-white/10 ${collapsed ? "mx-1" : ""}`} />
          <ExternalNavLink
            href={`${examAdminUrl}/admin/login`}
            label="Online Examinations"
            icon={GraduationCap}
            collapsed={collapsed}
          />
        </>
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
