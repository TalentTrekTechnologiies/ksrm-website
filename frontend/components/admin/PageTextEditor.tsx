"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RotateCcw } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { getPageTextAdmin, savePageText, resetPageText } from "@/lib/page-text-api"
import { PAGE_TEXT, slotKey } from "@/lib/page-text-registry"

/**
 * Edits the wording on a public page.
 *
 * A page's text lives in code and is what the site ships; this screen writes
 * overrides on top. That shapes the interaction: every field starts showing
 * what the page currently says, edited fields are marked, and "Reset" removes
 * the override rather than writing the old words back - so a page that has
 * never been edited has no rows at all, and reverting truly reverts.
 *
 * Shown as the Text tab of Page Content for pages listed in the registry.
 */
export default function PageTextEditor({ section }: { section: string }) {
  const page = PAGE_TEXT[section]
  const { confirm, notifySaved } = useCmsConfirm()

  const [saved, setSaved] = useState<Map<string, string>>(new Map())
  const [draft, setDraft] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getPageTextAdmin(section)
        if (cancelled) return
        const map = new Map(rows.map((r) => [r.key, r.value]))
        setSaved(map)
        setDraft(new Map(map))
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load this page's text")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [section])

  /** What a field shows: the draft, else the saved override, else the page's own words. */
  function valueOf(slotId: string, fallback: string): string {
    const key = slotKey(section, slotId)
    return draft.get(key) ?? saved.get(key) ?? fallback
  }

  function isOverridden(slotId: string): boolean {
    return saved.has(slotKey(section, slotId))
  }

  const dirtyKeys = useMemo(() => {
    const keys: string[] = []
    for (const [key, value] of draft) {
      if ((saved.get(key) ?? null) !== value) keys.push(key)
    }
    return keys
  }, [draft, saved])

  function setValue(slotId: string, value: string) {
    const key = slotKey(section, slotId)
    setDraft((prev) => new Map(prev).set(key, value))
  }

  async function handleSave() {
    if (dirtyKeys.length === 0) return
    if (
      !(await confirm({
        title: "Save changes?",
        message: "Save your changes? They go live on the public site straight away.",
        confirmLabel: "Save",
      }))
    )
      return
    setSaving(true)
    setError(null)
    try {
      const items = dirtyKeys.map((key) => ({ key, pageSection: section, value: draft.get(key) ?? "" }))
      await savePageText(items)
      setSaved((prev) => {
        const next = new Map(prev)
        for (const item of items) next.set(item.key, item.value)
        return next
      })
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your changes")
    } finally {
      setSaving(false)
    }
  }

  async function handleReset(slotId: string, label: string) {
    const key = slotKey(section, slotId)
    if (
      !(await confirm({
        title: "Restore original wording?",
        message: `"${label}" will go back to the words the page was built with. Your edit is removed.`,
        confirmLabel: "Restore",
        destructive: true,
      }))
    )
      return
    setError(null)
    try {
      await resetPageText(key)
      setSaved((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
      setDraft((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
      notifySaved("The original wording has been restored.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not restore the original wording")
    }
  }

  if (!page) {
    return (
      <p className="rounded-xl border border-dashed border-admin-border p-8 text-center text-sm text-slate-500">
        This page&rsquo;s text isn&rsquo;t editable yet. Documents, images and videos for it can still be
        managed from the tabs above.
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            Edit the wording on this page. Fields start with what the page says now.
          </p>
        </div>
        <a
          href={page.path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-admin-bg"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View page
        </a>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {page.groups.map((group) => (
        <div
          key={group.label}
          style={{ boxShadow: "var(--shadow-admin-card)" }}
          className="space-y-4 rounded-2xl border border-admin-border bg-white p-5"
        >
          <p className="text-sm font-semibold text-slate-700">{group.label}</p>

          {group.slots.map((slot) => {
            const overridden = isOverridden(slot.id)
            const value = valueOf(slot.id, slot.default)
            return (
              <div key={slot.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor={`${section}-${slot.id}`} className="text-xs font-medium text-slate-600">
                    {slot.label}
                    {overridden && (
                      <span className="ml-2 rounded bg-admin-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-admin-primary">
                        Edited
                      </span>
                    )}
                  </label>
                  {overridden && (
                    <button
                      type="button"
                      onClick={() => handleReset(slot.id, slot.label)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-admin-primary"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore original
                    </button>
                  )}
                </div>

                {slot.kind === "paragraph" ? (
                  <textarea
                    id={`${section}-${slot.id}`}
                    value={value}
                    onChange={(e) => setValue(slot.id, e.target.value)}
                    rows={Math.min(10, Math.max(3, Math.ceil(value.length / 90)))}
                    className="w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 focus:border-admin-primary focus:outline-none"
                  />
                ) : (
                  <input
                    id={`${section}-${slot.id}`}
                    value={value}
                    onChange={(e) => setValue(slot.id, e.target.value)}
                    className="w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-admin-primary focus:outline-none"
                  />
                )}

                {slot.help && <p className="mt-1 text-[11px] text-slate-500">{slot.help}</p>}
              </div>
            )
          })}
        </div>
      ))}

      {/* Sticky so a long page can be saved without scrolling back. */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-xl border border-admin-border bg-white/95 px-4 py-3 backdrop-blur">
        <p className="text-xs text-slate-500">
          {dirtyKeys.length === 0 ? (
            "No unsaved changes."
          ) : (
            <>
              <strong className="text-slate-700">{dirtyKeys.length}</strong> unsaved change
              {dirtyKeys.length === 1 ? "" : "s"}
            </>
          )}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || dirtyKeys.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  )
}
