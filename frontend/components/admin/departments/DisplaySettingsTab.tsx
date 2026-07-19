"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import {
  getDisplaySettingsAdmin,
  bulkSetDisplaySettings,
  DisplaySettingAdminEntry,
} from "@/lib/department-display-settings-api"

/**
 * The scalable configuration system's admin UI - one toggle per catalog key
 * (see backend's DEPARTMENT_DISPLAY_SETTINGS_CATALOG), grouped by section.
 * Absence of a row means "on" by default, so a brand-new department shows
 * every toggle already checked with no seeded data.
 */
export default function DisplaySettingsTab({ departmentId }: { departmentId: number }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [entries, setEntries] = useState<DisplaySettingAdminEntry[]>([])
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getDisplaySettingsAdmin(departmentId)
        if (!cancelled) setEntries(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load display settings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [departmentId])

  const sections = useMemo(() => {
    const bySection = new Map<string, DisplaySettingAdminEntry[]>()
    for (const entry of entries) {
      const current = bySection.get(entry.section) ?? []
      current.push(entry)
      bySection.set(entry.section, current)
    }
    return Array.from(bySection.entries())
  }, [entries])

  function toggle(key: string, current: boolean) {
    setSaved(false)
    setPending((prev) => ({ ...prev, [key]: !current }))
  }

  async function handleSave() {
    const changed = Object.entries(pending)
    if (changed.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const updated = await bulkSetDisplaySettings(
        departmentId,
        changed.map(([key, value]) => ({ key, value })),
      )
      setEntries(updated)
      setPending({})
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save display settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const hasPending = Object.keys(pending).length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Display Settings</h2>
          <p className="text-sm text-slate-500">
            Independently show or hide each section on this department's public page without deleting content.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasPending || saving}
          className="rounded-lg bg-admin-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-admin-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {saved && !hasPending && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map(([section, sectionEntries]) => (
          <div key={section} style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">{section}</p>
            <div className="space-y-2.5">
              {sectionEntries.map((entry) => {
                const value = entry.key in pending ? pending[entry.key] : entry.value
                return (
                  <label key={entry.key} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{entry.label}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggle(entry.key, value)}
                      className="h-4 w-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
