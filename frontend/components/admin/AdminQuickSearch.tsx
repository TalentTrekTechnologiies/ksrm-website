"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CornerDownLeft } from "lucide-react"
import { getStoredAdmin, hasPermission, isDepartmentScopedAdmin } from "@/lib/auth"
import { getDepartmentsAdmin, Department, isAcademicDepartment } from "@/lib/departments-api"

/**
 * The navbar search, made real: a quick-jump. Type what you want to do -
 * "add faculty", "iqac pdf", "hall ticket", "logo" - and the matching admin
 * page opens. Previously this input rendered but did nothing, which the
 * client rightly called out.
 *
 * Two layers of destinations:
 *  - a static index of every module page plus task-phrased entries ("Add a
 *    faculty member", "Upload a PDF"), each carrying the everyday words
 *    people actually type (teacher, vacancy, hall ticket, brochure...);
 *  - per-department deep links ("ECE - Faculty & HOD"), fetched lazily the
 *    first time the palette opens and only when this admin can view
 *    departments, so "ece faculty" lands directly on that workspace tab.
 *
 * Deliberately not permission-filtered beyond that: a destination this admin
 * can't use renders that page's own PermissionGate, which explains itself -
 * silently hiding results would read as "search is broken".
 */
interface QuickTarget {
  label: string
  href: string
  /** Lowercase words people might type for this destination. */
  keywords: string
  /** One-line hint shown under the label; also matched against. */
  desc?: string
}

// Public pages an upload can be routed to from the Media Library - typing any
// of these page names should lead to the uploader, with the hint explaining
// the "Show on page" step.
const MEDIA_ROUTED_PAGES =
  "iqac naac edc iic alumni library sports cultural nss hostels transport anti-ragging examinations syllabus research admissions placements"

const STATIC_TARGETS: QuickTarget[] = [
  { label: "Dashboard", href: "/admin/dashboard", keywords: "dashboard home overview stats" },
  {
    label: "Add a faculty member",
    href: "/admin/departments",
    keywords: "add faculty teacher professor lecturer hod staff member",
    desc: "Open a department → Faculty & HOD tab",
  },
  {
    label: "Upload a PDF / document",
    href: "/admin/media",
    keywords: `upload pdf doc docx pptx xlsx file document ${MEDIA_ROUTED_PAGES}`,
    desc: "Media Library → Upload, pick the page under \"Show on page\"",
  },
  {
    label: "Upload a photo or video",
    href: "/admin/media",
    keywords: "upload photo image picture video mp4 webm jpg png banner",
    desc: "Media Library → Upload",
  },
  {
    label: "Post a job opening",
    href: "/admin/careers",
    keywords: "job opening vacancy post career recruit hiring position",
    desc: "Shows on the public Careers page with an Apply form",
  },
  {
    label: "Publish an announcement",
    href: "/admin/announcements",
    keywords: "announcement ticker notice scrolling news flash",
    desc: "The scrolling ticker across the site",
  },
  { label: "Media Library", href: "/admin/media", keywords: "media library files uploads storage folders" },
  { label: "Departments", href: "/admin/departments", keywords: "departments cse ece eee civil mechanical mba branch" },
  { label: "Gallery", href: "/admin/gallery", keywords: "gallery photos images campus pictures" },
  { label: "Documents", href: "/admin/downloads", keywords: "documents downloads pdf syllabus question paper brochure affidavit form" },
  { label: "News", href: "/admin/news", keywords: "news article press latest featured" },
  { label: "Events", href: "/admin/events", keywords: "events fest workshop seminar conference" },
  {
    label: "Exam Notifications",
    href: "/admin/exam-notifications",
    keywords: "exam notification hall ticket results registration schedule notice",
    desc: "Shows under Latest Notifications on the Examinations page",
  },
  { label: "Job Applications", href: "/admin/careers/applications", keywords: "job applications applicants resume cv candidates hr status" },
  { label: "Placements", href: "/admin/placements", keywords: "placements records placed students package recruiters stats" },
  { label: "Committees", href: "/admin/committees", keywords: "committees anti ragging members roster" },
  {
    label: "Site Settings",
    href: "/admin/settings",
    keywords: "site settings logo branding favicon contact social ticker speed email faculty photos switch global",
    desc: "Branding, contact, ticker, global switches",
  },
  { label: "Admins", href: "/admin/admins", keywords: "admins users accounts create admin password" },
  { label: "Roles & Permissions", href: "/admin/roles", keywords: "roles permissions access rights rbac" },
  { label: "Audit Logs", href: "/admin/audit-logs", keywords: "audit logs history trail who changed what activity" },
  { label: "Homepage — Hero Banner", href: "/admin/homepage/hero", keywords: "homepage hero banner main image slider" },
  { label: "Homepage — Statistics", href: "/admin/homepage/statistics", keywords: "homepage statistics numbers counters figures" },
  { label: "Homepage — Quick Links", href: "/admin/homepage/quick-links", keywords: "homepage quick links shortcuts" },
  { label: "Homepage — Vision & Mission", href: "/admin/homepage/sections/vision", keywords: "homepage vision mission" },
  { label: "Homepage — About", href: "/admin/homepage/sections/about", keywords: "homepage about section college" },
  { label: "Homepage — Admissions", href: "/admin/homepage/sections/admissions", keywords: "homepage admissions programs eapcet" },
  { label: "Homepage — Testimonials", href: "/admin/homepage/testimonials", keywords: "homepage testimonials quotes students" },
  { label: "Homepage — Campus Videos", href: "/admin/homepage/campus-videos", keywords: "homepage campus videos" },
  { label: "Homepage — Accreditation", href: "/admin/homepage/accreditation", keywords: "homepage accreditation naac nba badges" },
  { label: "Homepage — Recruiters", href: "/admin/homepage/recruiters", keywords: "homepage recruiters companies logos" },
]

// Workspace tabs worth deep-linking per department - the high-traffic ones.
const DEPT_TABS: { key: string; label: string; keywords: string }[] = [
  { key: "faculty", label: "Faculty & HOD", keywords: "faculty teacher professor hod staff" },
  { key: "profile", label: "Overview", keywords: "profile overview about vision mission" },
  { key: "programmes", label: "Programmes", keywords: "programmes courses intake btech mtech" },
  { key: "labs", label: "Laboratories", keywords: "labs laboratory equipment" },
  { key: "research", label: "Research", keywords: "research publications papers patents" },
  { key: "gallery", label: "Gallery", keywords: "gallery photos images" },
  { key: "downloads", label: "Documents", keywords: "documents downloads pdf" },
  { key: "display-settings", label: "Display Settings", keywords: "display settings visibility hide show sections" },
]

function score(target: QuickTarget, tokens: string[]): number {
  const label = target.label.toLowerCase()
  const haystack = `${label} ${target.keywords} ${target.desc?.toLowerCase() ?? ""}`
  let total = 0
  for (const t of tokens) {
    if (!haystack.includes(t)) return 0 // every typed word must match somewhere
    total += label.startsWith(t) ? 3 : label.includes(t) ? 2 : 1
  }
  return total
}

export default function AdminQuickSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [departments, setDepartments] = useState<Department[] | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const admin = getStoredAdmin()
  const isDeptScoped = isDepartmentScopedAdmin(admin)

  // Lazy department fetch, once, on first open - and only for admins who can
  // see departments at all.
  useEffect(() => {
    if (!open || departments !== null) return
    if (!hasPermission(admin, "departments.view")) {
      setDepartments([])
      return
    }
    getDepartmentsAdmin()
      .then((all) =>
        setDepartments(
          // Same rule as the sidebar: a scoped admin always reaches their own
          // department, academic or not.
          all.filter((d) =>
            d.isActive &&
            (isDeptScoped ? d.id === admin?.departmentId : isAcademicDepartment(d)),
          ),
        ),
      )
      .catch(() => setDepartments([]))
  }, [open, departments, admin, isDeptScoped])

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  const targets = useMemo<QuickTarget[]>(() => {
    const dyn: QuickTarget[] = (departments ?? []).flatMap((d) =>
      DEPT_TABS.map((tab) => ({
        label: `${d.shortName || d.name} — ${tab.label}`,
        href: `/admin/departments/workspace?id=${d.id}&tab=${tab.key}`,
        keywords: `${(d.shortName ?? "").toLowerCase()} ${d.name.toLowerCase()} ${tab.keywords}`,
      })),
    )
    const staticTargets = isDeptScoped
      ? STATIC_TARGETS.filter((t) => t.href === "/admin/dashboard" || t.href === "/admin/departments")
      : STATIC_TARGETS
    return [...staticTargets, ...dyn]
  }, [departments, isDeptScoped])

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []
    return targets
      .map((t) => ({ t, s: score(t, tokens) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.t)
  }, [targets, query])

  function go(target: QuickTarget) {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    router.push(target.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(results[Math.min(active, results.length - 1)])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search — try “add faculty” or “iqac pdf”…"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-label="Quick search"
        className="w-full rounded-full border border-transparent bg-slate-100/90 py-2 pl-9 pr-3 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-admin-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-admin-primary/15"
      />

      {open && query.trim() !== "" && (
        <div
          style={{ boxShadow: "var(--shadow-admin-dropdown)" }}
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-admin-border bg-white py-1.5"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              Nothing matches “{query}” — try a module name like “gallery” or a task like “upload pdf”.
            </p>
          ) : (
            <ul role="listbox">
              {results.map((r, i) => (
                <li key={`${r.href}-${r.label}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onClick={() => go(r)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left ${
                      i === active ? "bg-admin-primary/[0.06]" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800">{r.label}</span>
                      {r.desc && <span className="block truncate text-xs text-slate-400">{r.desc}</span>}
                    </span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
