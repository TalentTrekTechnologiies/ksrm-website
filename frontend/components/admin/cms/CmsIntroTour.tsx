"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { getStoredAdmin } from "@/lib/auth"
import { normalizePath } from "@/lib/use-route-path"

/**
 * First-login walkthrough that spotlights the REAL interface - it darkens the
 * screen, cuts a hole around the actual button/tab a step talks about
 * ("Departments is here", "you upload here"), and walks the admin through the
 * app page by page, navigating as it goes.
 *
 * Anchoring: steps point at `[data-tour="..."]` attributes placed on the live
 * elements (sidebar links, the Media Library upload button, ...). If a step's
 * element doesn't exist - the admin's permissions hide that module, the page
 * is still loading, or the viewport is mobile where the sidebar is hidden -
 * the step falls back to a centered card so the guidance is never lost, and
 * the tour never breaks.
 *
 * Shows itself once per admin (localStorage flag keyed by admin id, so a
 * shared computer still greets each new account) and can be reopened any time
 * from the ? button in the top bar, which dispatches OPEN_TOUR_EVENT.
 */
export const OPEN_TOUR_EVENT = "ksrm:open-tour"

const seenKey = (adminId: number) => `ksrm_admin_tour_seen:${adminId}`

/**
 * Auto-opens once per admin account - a new admin gets the walkthrough on
 * their first login and never again, which is the point of it. The flag stays
 * as a switch for re-testing the first-run experience without creating a new
 * account; leave it false in normal use. The ? button in the top bar re-opens
 * the tour on demand either way, so nothing is ever lost by dismissing it.
 */
const ALWAYS_SHOW_TOUR = false

interface TourStep {
  /** CSS selector of the element to spotlight; omit for a centered card. */
  target?: string
  /** Admin route to navigate to before locating the target. */
  route?: string
  /** Tooltip side relative to the spotlit element. */
  placement?: "right" | "bottom"
  /**
   * Skip straight past this step when its target never appears - for
   * permission-gated sidebar modules, where showing a card about a module the
   * admin can't open is worse than silence. Core steps keep the centered-card
   * fallback instead.
   */
  skipIfMissing?: boolean
  title: string
  body: string[]
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to the K.S.R.M. CMS 👋",
    body: [
      "This one-minute tour points at the actual buttons you'll use - the highlighted spot is the thing being explained.",
      "Nothing is changed or saved while touring. Use Next/Back or the arrow keys; Esc leaves the tour.",
    ],
  },
  {
    target: '[data-tour="nav-dashboard"]',
    placement: "right",
    title: "Dashboard",
    body: [
      "Your home base - recent activity, pending approvals and storage, at a glance.",
      "The sidebar on the left is how you reach every module in this tour.",
    ],
  },
  {
    target: '[data-tour="nav-departments"]',
    placement: "right",
    title: "Departments live here",
    body: [
      "Everything on a department's public page is managed under this menu - expand it and each department is listed by name.",
      "Let's open the department list.",
    ],
  },
  {
    route: "/admin/departments",
    target: '[data-tour="departments-manage"]',
    placement: "bottom",
    title: "Open a department → add its content",
    body: [
      "Click \"Manage content\" on any department to open its workspace.",
      "Inside you'll find tabs for everything: Profile, Faculty (add faculty members there), Programmes, Labs, Outcomes, Research, Gallery and Display Settings.",
      "Research added in a department also appears on the site-wide Research page automatically.",
    ],
  },
  {
    route: "/admin/media",
    target: '[data-tour="media-show-on-page"]',
    placement: "bottom",
    title: "Media Library - pick the page first…",
    body: [
      "Every image, video and document is uploaded in this one place.",
      "Before uploading, choose a page here - the file is then published straight onto it: images join that page's gallery, videos become players, PDFs join its downloads.",
    ],
  },
  {
    target: '[data-tour="media-upload"]',
    placement: "bottom",
    title: "…then upload here",
    body: [
      "Click Upload (or drag files anywhere onto the grid). JPG/PNG/WebP images, MP4/WebM videos, PDF and Office documents.",
      "Already uploaded something? Click its tile and use \"Show on page\" in the details panel instead.",
    ],
  },
  {
    target: '[data-tour="nav-gallery"]',
    placement: "right",
    skipIfMissing: true,
    title: "Gallery",
    body: [
      "All photos shown on the public Gallery page - add, categorise and reorder them here.",
      "Images published to a specific page from the Media Library also appear in this list.",
    ],
  },
  {
    target: '[data-tour="nav-downloads"]',
    placement: "right",
    skipIfMissing: true,
    title: "Documents",
    body: [
      "Every downloadable file on the site - syllabus, question papers, brochures, forms.",
      "The category routes it: a SYLLABUS document automatically shows on the Syllabus page, QUESTION_PAPER on Examinations, and so on.",
    ],
  },
  {
    target: '[data-tour="nav-announcements"]',
    placement: "right",
    skipIfMissing: true,
    title: "Announcements",
    body: [
      "The scrolling ticker across the top of the site starts here - write, publish and unpublish announcements.",
      "Ticker speed and visibility are controlled in Site Settings.",
    ],
  },
  {
    target: '[data-tour="nav-news"]',
    placement: "right",
    skipIfMissing: true,
    title: "News",
    body: [
      "News articles - they appear in the homepage's Latest News section and on the News page.",
      "Mark one as featured to badge it as new.",
    ],
  },
  {
    target: '[data-tour="nav-events"]',
    placement: "right",
    skipIfMissing: true,
    title: "Events",
    body: ["College events - shown with the news on the homepage and on the Events page."],
  },
  {
    target: '[data-tour="nav-exam_notifications"]',
    placement: "right",
    skipIfMissing: true,
    title: "Exam Notifications",
    body: [
      "Hall tickets, results, registration and schedule notices - they appear under Latest Notifications on the public Examinations page.",
      "Publish/unpublish per notice - nothing shows until you publish it.",
    ],
  },
  {
    target: '[data-tour="nav-careers"]',
    placement: "right",
    skipIfMissing: true,
    title: "Careers - post job openings",
    body: [
      "Create job openings here (title, department, type, location) - they appear on the public Careers page with an Apply form.",
    ],
  },
  {
    target: '[data-tour="nav-career_applications"]',
    placement: "right",
    skipIfMissing: true,
    title: "Job Applications",
    body: [
      "Every application submitted on the site lands here - review resumes, add notes, move candidates through statuses, and export to CSV/Excel.",
    ],
  },
  {
    target: '[data-tour="nav-placements"]',
    placement: "right",
    skipIfMissing: true,
    title: "Placements",
    body: ["Placement records and statistics - they feed the Placements Record page and the homepage placement figures."],
  },
  {
    target: '[data-tour="nav-committees"]',
    placement: "right",
    skipIfMissing: true,
    title: "Committees",
    body: ["Committee rosters (Anti-Ragging and others) - members you add here show on the matching public page."],
  },
  {
    target: '[data-tour="nav-homepage"]',
    placement: "right",
    title: "Homepage",
    body: [
      "Hero banner, statistics, news & events, testimonials, recruiters, campus videos - each homepage section has its own editor under this menu.",
      "Any section can be switched off without deleting its content.",
    ],
  },
  {
    target: '[data-tour="nav-site_settings"]',
    placement: "right",
    title: "Site Settings",
    body: [
      "Global controls: logo and branding, contact details, the announcement ticker - and one switch that turns faculty photos on/off across every department page at once.",
    ],
  },
  {
    target: '[data-tour="nav-admins"]',
    placement: "right",
    skipIfMissing: true,
    title: "Admins & Roles",
    body: [
      "Super admins only: create admin accounts here, and control exactly which modules each one can see and edit under Roles & Permissions.",
      "New admins get this same tour on their first login.",
    ],
  },
  {
    title: "You can't break anything ✅",
    body: [
      "Every change asks you to confirm first, then shows a \"Saved\" popup. Deletes are restorable, and the Audit Log records every action.",
      "Changes appear on the public site by themselves - open pages update within about 30 seconds.",
      "Reopen this tour anytime with the ? button in the top bar. Have a go - upload a photo!",
    ],
  },
]

const TOOLTIP_WIDTH = 340
const SPOT_PAD = 6

export default function CmsIntroTour() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  // Spotlight rect of the located element; null = centered-card fallback.
  const [rect, setRect] = useState<DOMRect | null>(null)
  // Distinguishes "still looking for the element" from "gave up".
  const [locating, setLocating] = useState(false)
  const targetElRef = useRef<Element | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  // Last direction of travel (1 = forward, -1 = back) so a skipIfMissing step
  // auto-skips the way the admin was already going, not always forward.
  const dirRef = useRef(1)

  // Auto-open on every load while ALWAYS_SHOW_TOUR is on (testing mode);
  // otherwise exactly once per admin account.
  useEffect(() => {
    const admin = getStoredAdmin()
    if (!admin) return
    if (ALWAYS_SHOW_TOUR || !window.localStorage.getItem(seenKey(admin.id))) {
      setStep(0)
      setOpen(true)
    }
  }, [])

  // The ? button in the navbar reopens it on demand.
  useEffect(() => {
    const reopen = () => {
      setStep(0)
      setOpen(true)
    }
    window.addEventListener(OPEN_TOUR_EVENT, reopen)
    return () => window.removeEventListener(OPEN_TOUR_EVENT, reopen)
  }, [])

  const dismiss = useCallback(() => {
    const admin = getStoredAdmin()
    // Closing at any point counts as "seen" - a skipped tour must not nag on
    // every page load; it stays one click away in the top bar instead.
    if (admin) window.localStorage.setItem(seenKey(admin.id), new Date().toISOString())
    setOpen(false)
  }, [])

  // Locate (and if needed navigate to) the current step's target.
  useEffect(() => {
    if (!open) return
    const s = STEPS[step]
    targetElRef.current = null
    setRect(null)
    setTooltipPos(null)

    if (!s.target) {
      setLocating(false)
      return
    }
    setLocating(true)

    if (s.route && normalizePath(window.location.pathname) !== s.route) {
      router.push(s.route)
    }

    // Poll rather than await the navigation: the element appearing in the DOM
    // (with a real size) is the one signal that covers route change, data
    // loading and permission-hidden modules alike.
    let cancelled = false
    const startedAt = Date.now()
    const tick = () => {
      if (cancelled) return
      const el = document.querySelector(s.target!)
      const r = el?.getBoundingClientRect()
      if (el && r && r.width > 0 && r.height > 0) {
        targetElRef.current = el
        el.scrollIntoView({ block: "center", inline: "nearest" })
        // Measure after the scroll has settled.
        requestAnimationFrame(() => {
          if (!cancelled) {
            setRect(el.getBoundingClientRect())
            setLocating(false)
          }
        })
        return
      }
      // Sidebar modules render (or are permission-filtered out) fast, so
      // skippable steps give up quickly; core targets get the full budget to
      // cover navigation plus data loading.
      if (Date.now() - startedAt > (s.skipIfMissing ? 1500 : 5000)) {
        if (s.skipIfMissing) {
          const next = step + dirRef.current
          if (next >= 0 && next < STEPS.length) {
            setStep(next)
            return
          }
        }
        // Element never showed up (permissions / mobile) - centered fallback.
        setLocating(false)
        return
      }
      setTimeout(tick, 150)
    }
    tick()
    return () => {
      cancelled = true
    }
  }, [open, step, router])

  // Keep the spotlight glued to the element through scrolls and resizes.
  useEffect(() => {
    if (!open || !rect) return
    const remeasure = () => {
      const el = targetElRef.current
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener("resize", remeasure)
    window.addEventListener("scroll", remeasure, true)
    return () => {
      window.removeEventListener("resize", remeasure)
      window.removeEventListener("scroll", remeasure, true)
    }
  }, [open, rect !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  // Position the tooltip beside the spotlight once its own height is known.
  useLayoutEffect(() => {
    if (!rect || !tooltipRef.current) {
      setTooltipPos(null)
      return
    }
    const h = tooltipRef.current.offsetHeight
    const placement = STEPS[step].placement ?? "bottom"
    let top: number
    let left: number
    if (placement === "right") {
      left = rect.right + SPOT_PAD + 14
      top = rect.top + rect.height / 2 - h / 2
    } else {
      top = rect.bottom + SPOT_PAD + 14
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
    }
    left = Math.min(Math.max(12, left), window.innerWidth - TOOLTIP_WIDTH - 12)
    top = Math.min(Math.max(12, top), window.innerHeight - h - 12)
    setTooltipPos({ top, left })
  }, [rect, step])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
      if (e.key === "ArrowRight") {
        dirRef.current = 1
        setStep((s) => Math.min(s + 1, STEPS.length - 1))
      }
      if (e.key === "ArrowLeft") {
        dirRef.current = -1
        setStep((s) => Math.max(s - 1, 0))
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, dismiss])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const spotlight = rect !== null
  // While hunting for the element, show only the dimmed screen - flashing the
  // centered card for 200ms before the spotlight lands looks broken.
  const showCard = !locating

  const card = (
    <div
      ref={tooltipRef}
      style={
        spotlight && tooltipPos
          ? { position: "fixed", top: tooltipPos.top, left: tooltipPos.left, width: TOOLTIP_WIDTH, visibility: "visible" }
          : spotlight
            ? { position: "fixed", top: 0, left: 0, width: TOOLTIP_WIDTH, visibility: "hidden" }
            : { position: "relative", width: "100%", maxWidth: 420 }
      }
      className="rounded-2xl bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <h2 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-base font-bold text-slate-900">
          {current.title}
        </h2>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close tutorial"
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-admin-bg hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 px-5 pb-4 pt-2">
        {current.body.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-600">
            {p}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-admin-border px-5 py-3">
        <div className="flex items-center gap-1" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                dirRef.current = i >= step ? 1 : -1
                setStep(i)
              }}
              aria-label={`Go to step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-4 bg-admin-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                dirRef.current = -1
                setStep(step - 1)
              }}
              className="flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-admin-bg"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              dirRef.current = 1
              if (isLast) dismiss()
              else setStep(step + 1)
            }}
            className="flex items-center gap-1 rounded-lg bg-admin-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-admin-primary-dark"
          >
            {isLast ? "Get started" : "Next"} {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="CMS guided tour">
      {/* Click-catcher: freezes the page under the tour so a stray click can't
          edit anything mid-walkthrough. The dimming itself comes from the
          spotlight's giant box-shadow so the hole stays crisp. */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {spotlight ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-xl border-2 border-admin-gold transition-all duration-300 ease-out"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.62)",
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-slate-900/60" />
      )}

      {showCard &&
        (spotlight ? (
          card
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">{card}</div>
        ))}
    </div>
  )
}
