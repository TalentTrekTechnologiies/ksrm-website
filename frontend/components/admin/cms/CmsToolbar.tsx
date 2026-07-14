"use client"

import { ReactNode } from "react"
import { Search, Download, X } from "lucide-react"

/**
 * Search + filter slot + bulk-action bar + export - the reusable toolbar
 * every list-shaped CMS page needs. Built now (per your "even if this
 * sprint doesn't need it, build it now" instruction) but not wired into
 * any Sprint 1B page - nothing here is a large enough list yet. First real
 * use is the deferred Statistics/Quick Links retrofit, then News/Gallery/
 * Downloads.
 */
export default function CmsToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  selectedCount = 0,
  bulkActions,
  onClearSelection,
  onExport,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  selectedCount?: number
  bulkActions?: { label: string; onClick: () => void; danger?: boolean }[]
  onClearSelection?: () => void
  onExport?: () => void
}) {
  const hasSelection = selectedCount > 0

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-admin-border bg-white p-3">
      {hasSelection ? (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary/10 px-2.5 py-1.5 text-sm font-semibold text-admin-primary"
          >
            {selectedCount} selected
            <X className="h-3.5 w-3.5" />
          </button>
          {bulkActions?.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                action.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-admin-bg"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-admin-border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
            />
          </div>
          {filters}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          )}
        </>
      )}
    </div>
  )
}
