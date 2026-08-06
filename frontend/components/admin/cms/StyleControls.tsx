"use client"

import { useEffect, useState } from "react"
import { getContentStyles, saveContentStyles, styleKey, FONT_SIZES } from "@/lib/content-styles-api"

/**
 * The size and colour control, for any module's form.
 *
 * Page Content grew this first, because PageText carries fontSize and color
 * itself. This is the same control against ContentStyle, so News, Events, the
 * Gallery and anything after them get it by dropping this into their form -
 * no columns added to their table, no styling logic written twice.
 *
 * It saves itself rather than joining the parent form's payload, deliberately:
 * a module's own save is version-checked against its record, and appearance is
 * not part of that record. Threading it through would mean touching every
 * module's DTO, service and optimistic-lock path - which is exactly the
 * per-module work this design exists to avoid.
 *
 * `recordId` may be 0 for a record that has not been saved yet; the control
 * then renders disabled with a note, since there is nothing to attach a style
 * to until the record has an id.
 */
export default function StyleControls({
  module,
  recordId,
  field,
  label = "Appearance",
}: {
  module: string
  recordId: number
  field: string
  label?: string
}) {
  const [fontSize, setFontSize] = useState("")
  const [color, setColor] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!recordId) {
      setLoaded(true)
      return
    }
    getContentStyles(module)
      .then((rows) => {
        if (cancelled) return
        const match = rows.find((r) => styleKey(r.recordId, r.field) === styleKey(recordId, field))
        setFontSize(match?.fontSize ?? "")
        setColor(match?.color ?? "")
      })
      .catch(() => {
        // An unreadable style is not worth blocking the form over - the
        // controls simply start empty.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [module, recordId, field])

  async function persist(next: { fontSize: string; color: string }) {
    if (!recordId) return
    setSaving(true)
    setError(null)
    try {
      await saveContentStyles([
        {
          module,
          recordId,
          field,
          // Empty means "not set" and must go as null, or it would be written
          // into the style attribute verbatim.
          fontSize: next.fontSize.trim() || null,
          color: next.color.trim() || null,
        },
      ])
    } catch {
      setError("Could not save the appearance")
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  if (!recordId) {
    return (
      <p className="text-[11px] text-slate-400">
        {label}: save this first, then its size and colour can be set.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>

      <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
        Size
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value)
            persist({ fontSize: e.target.value, color })
          }}
          className="rounded-md border border-admin-border bg-white px-2 py-1 text-[11px] text-slate-700 focus:border-admin-primary focus:outline-none"
        >
          {FONT_SIZES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
        Colour
        <input
          type="color"
          value={color || "#333333"}
          onChange={(e) => {
            setColor(e.target.value)
            persist({ fontSize, color: e.target.value })
          }}
          className="h-6 w-8 cursor-pointer rounded border border-admin-border bg-white p-0.5"
        />
      </label>

      {(fontSize || color) && (
        <button
          type="button"
          onClick={() => {
            setFontSize("")
            setColor("")
            persist({ fontSize: "", color: "" })
          }}
          className="text-[11px] font-semibold text-admin-primary hover:underline"
        >
          Clear formatting
        </button>
      )}

      {saving && <span className="text-[11px] text-slate-400">Saving…</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  )
}
