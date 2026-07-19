"use client"

import { useCallback, useEffect, useState } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Rocket,
  LayoutDashboard,
  Image as ImageIcon,
  Building2,
  Home,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { getStoredAdmin } from "@/lib/auth"

/**
 * First-login walkthrough for the admin CMS - the "how to use this app" intro
 * many apps show a new user. Deliberately a card carousel rather than a
 * DOM-spotlight tour: sidebar entries come and go with each admin's
 * permissions, so anchoring steps to page elements would break for exactly the
 * new, low-permission admins this is for.
 *
 * Shows itself once per admin (localStorage flag keyed by admin id, so a
 * shared computer still greets each new account) and can be reopened any time
 * from the ? button in the top bar, which dispatches OPEN_TOUR_EVENT.
 */
export const OPEN_TOUR_EVENT = "ksrm:open-tour"

const seenKey = (adminId: number) => `ksrm_admin_tour_seen:${adminId}`

interface TourStep {
  icon: React.ComponentType<{ className?: string }>
  title: string
  intro: string
  points: string[]
}

const STEPS: TourStep[] = [
  {
    icon: Rocket,
    title: "Welcome to the KSRM CMS",
    intro: "This panel manages the entire college website - no coding needed.",
    points: [
      "Everything you publish here appears on the public site automatically.",
      "Open pages update on their own within about 30 seconds - visitors never need to refresh.",
      "This tour takes about a minute. You can reopen it anytime from the ? button in the top bar.",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    intro: "Your starting point every time you log in.",
    points: [
      "See recent activity - who changed what, and when.",
      "Pending approvals and storage usage at a glance.",
      "Use the sidebar on the left to reach every module you have access to.",
    ],
  },
  {
    icon: ImageIcon,
    title: "Media Library",
    intro: "One place for every image, video and document. No module has its own upload.",
    points: [
      "Upload images (JPG/PNG/WebP), videos (MP4/WebM) and documents (PDF/DOC/XLSX/PPTX).",
      "\"Show on page\" publishes a file straight to a public page: images join that page's gallery, videos become players, documents join its downloads list.",
      "To publish something already uploaded, click its tile and use \"Show on page\" in the details panel.",
    ],
  },
  {
    icon: Building2,
    title: "Departments",
    intro: "Each department has its own workspace with everything on its public page.",
    points: [
      "Profile, faculty, programmes, labs, outcomes (PEO/PO/PSO), research, gallery and videos - each in its own tab.",
      "Research added here also appears on the site-wide Research page, automatically.",
      "Display Settings let you hide any section of a department page without deleting its content.",
    ],
  },
  {
    icon: Home,
    title: "Homepage & Content",
    intro: "The homepage is fully editable - section by section.",
    points: [
      "Hero banner, statistics, news & events, testimonials, recruiters, campus videos and more.",
      "Every homepage section can be switched off without losing its content.",
      "News, Events, Careers and Announcements each have their own manager in the sidebar.",
    ],
  },
  {
    icon: Settings,
    title: "Site Settings",
    intro: "Global controls that apply across the whole site at once.",
    points: [
      "Branding (logo, college name, favicon), contact details and social links.",
      "Announcement ticker speed and visibility.",
      "One switch turns faculty photos on or off across every department page at the same time.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "You can't break anything",
    intro: "The CMS is built so mistakes are hard to make and easy to undo.",
    points: [
      "Every change asks you to confirm first, then shows a \"Saved\" popup.",
      "Deleted items can be restored - deletes are not permanent.",
      "Every action is recorded in the Audit Log, so there is always a trail.",
    ],
  },
  {
    icon: Sparkles,
    title: "You're ready!",
    intro: "That's the whole idea - pick a module from the sidebar and start editing.",
    points: [
      "A good first step: open Media Library and upload a photo.",
      "Changes go live on their own - publish and watch the public page.",
      "Reopen this tour anytime from the ? button in the top bar.",
    ],
  },
]

export default function CmsIntroTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Auto-open exactly once per admin account.
  useEffect(() => {
    const admin = getStoredAdmin()
    if (!admin) return
    if (!window.localStorage.getItem(seenKey(admin.id))) {
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

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1))
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0))
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, dismiss])

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="CMS introduction tutorial"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        style={{ boxShadow: "var(--shadow-admin-modal)" }}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white animate-[cms-tour-pop_0.18s_ease-out]"
      >
        <style>{`@keyframes cms-tour-pop { from { transform: scale(0.96) translateY(6px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>

        {/* Header band */}
        <div className="relative bg-gradient-to-br from-admin-primary to-indigo-900 px-7 pb-8 pt-7 text-white">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close tutorial"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Icon className="h-6 w-6" />
          </div>
          <h2 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-xl font-bold">
            {current.title}
          </h2>
          <p className="mt-1 text-sm text-white/80">{current.intro}</p>
        </div>

        {/* Body */}
        <ul className="space-y-3 px-7 py-6">
          {current.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-admin-primary" />
              {p}
            </li>
          ))}
        </ul>

        {/* Footer: dots + controls */}
        <div className="flex items-center justify-between border-t border-admin-border px-7 py-4">
          <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-admin-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 rounded-lg border border-admin-border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-admin-bg"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : setStep(step + 1))}
              className="flex items-center gap-1 rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
            >
              {isLast ? "Get started" : "Next"} {!isLast && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
