"use client"

/**
 * Content-shaped loading skeleton for table/list/grid manager pages - use in
 * place of `CmsLoadingState` (a bare centered spinner) wherever the page's
 * eventual content is a list of rows/cards, so the loading state previews
 * the layout instead of causing a pop-in/layout-shift once data arrives.
 * Mirrors the pulsing-block pattern `DashboardHome` already uses for its
 * stat cards, generalized into a reusable primitive.
 */
export default function CmsTableSkeleton({
  rows = 6,
  showHeader = true,
}: {
  rows?: number
  /** Set false when the page's own title/toolbar is already rendered above
   * this (e.g. a filter bar that stays visible while just the results
   * reload) - avoids showing a second, fake header underneath a real one. */
  showHeader?: boolean
}) {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading">
      {showHeader && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
        </>
      )}
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="overflow-hidden rounded-2xl border border-admin-border bg-white"
      >
        <div className="border-b border-admin-border bg-admin-bg/60 px-4 py-3">
          <div className="h-3.5 w-full max-w-md animate-pulse rounded bg-slate-200" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-admin-border px-4 py-3.5 last:border-b-0"
          >
            <div className="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/5 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
