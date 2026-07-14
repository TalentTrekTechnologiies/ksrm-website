"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import {
  getSectionVisibility,
  updateSectionVisibility,
  SectionVisibilityKey,
} from "@/lib/homepage-api"

/**
 * "Show this section on the homepage" ON/OFF switch for a manager page's
 * header. Self-contained - fetches and saves its own state via the
 * `homepage/admin/section-visibility` endpoints, independent of whatever
 * entity list the surrounding page manages. Turning it off hides the
 * section on the public homepage entirely (the public endpoint returns
 * `{ visible: false, items: [] }`) rather than falling back to old content -
 * it does not delete any of the underlying rows.
 */
export default function SectionVisibilityToggle({ sectionKey }: { sectionKey: SectionVisibilityKey }) {
  const [visible, setVisible] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSectionVisibility()
      .then((all) => {
        if (cancelled) return
        const entry = all.find((s) => s.key === sectionKey)
        setVisible(entry?.visible ?? true)
      })
      .catch(() => {
        if (!cancelled) setVisible(true)
      })
    return () => {
      cancelled = true
    }
  }, [sectionKey])

  async function toggle() {
    if (visible === null || saving) return
    const next = !visible
    setSaving(true)
    setError(null)
    try {
      await updateSectionVisibility(sectionKey, next)
      setVisible(next)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update visibility")
    } finally {
      setSaving(false)
    }
  }

  if (visible === null) {
    return <div className="h-8 w-40 animate-pulse rounded-lg bg-admin-bg" />
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
          visible ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            visible ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        ) : visible ? (
          <Eye className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
        )}
        {visible ? "Visible on homepage" : "Hidden from homepage"}
      </span>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
