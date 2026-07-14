"use client"

import { useEffect, useState } from "react"
import { Monitor, Tablet, Smartphone } from "lucide-react"
import { encodeDraft } from "@/lib/preview-draft.util"

/** Every editor rebuilds its `draftData` object fresh on every render (every
 * keystroke), so it never has a stable reference - a `useMemo` keyed on it
 * recomputes every time regardless. Debouncing the actual `src` update
 * (rather than trying to memoize an object that's never equal to its
 * previous self) is what actually stops the iframe from reloading - and
 * therefore re-fetching/re-hydrating a full page - on every single
 * keystroke, which was the real cause of "typing feels laggy" in every
 * editor that renders this panel (Hero/Vision/Mission/About/Admissions). */
const PREVIEW_DEBOUNCE_MS = 600

const BREAKPOINTS = {
  desktop: { width: "100%", height: 640, icon: Monitor, label: "Desktop" },
  tablet: { width: 768, height: 640, icon: Tablet, label: "Tablet" },
  mobile: { width: 390, height: 640, icon: Smartphone, label: "Mobile" },
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Desktop/Tablet/Mobile preview tabs, backed by an <iframe> pointed at the
 * dedicated /admin/homepage/preview/[key] route (see PreviewRenderer) fed
 * this draft via a query param - a real separate browsing context, not a
 * CSS-scaled div, so each public component's actual @media breakpoints
 * fire correctly.
 */
export default function CmsPreviewPanel({
  previewKey,
  draftData,
}: {
  previewKey: string
  draftData: unknown
}) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")
  const [src, setSrc] = useState(
    () => `/admin/homepage/preview/${previewKey}?draft=${encodeDraft(draftData)}`,
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      const encoded = encodeDraft(draftData)
      setSrc(`/admin/homepage/preview/${previewKey}?draft=${encoded}`)
    }, PREVIEW_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, JSON.stringify(draftData)])

  const active = BREAKPOINTS[breakpoint]

  return (
    <div className="rounded-xl border border-admin-border bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5">
        {(Object.keys(BREAKPOINTS) as Breakpoint[]).map((key) => {
          const { icon: Icon, label } = BREAKPOINTS[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => setBreakpoint(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                breakpoint === key
                  ? "bg-admin-primary text-white"
                  : "text-slate-500 hover:bg-admin-bg"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>
      <div className="flex justify-center overflow-auto rounded-lg bg-admin-bg p-4">
        <iframe
          key={breakpoint}
          src={src}
          title="Live preview"
          style={{ width: active.width, height: active.height }}
          className="max-w-full shrink-0 rounded-lg border border-admin-border bg-white shadow-sm"
        />
      </div>
    </div>
  )
}
