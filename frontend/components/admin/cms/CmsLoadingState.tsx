"use client"

import { Loader2 } from "lucide-react"

/**
 * The centered spinner shown while a page's initial fetch is in flight -
 * extracted from the identical `<Loader2 className="h-6 w-6 animate-spin
 * text-admin-primary" />` block that was hand-copied (with a drifting py-16
 * vs py-20 padding) across most manager/editor pages. Use this instead of
 * re-inlining the spinner markup so every page's loading state stays pixel-
 * identical and any future change (size, color, copy) happens in one place.
 */
export default function CmsLoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
