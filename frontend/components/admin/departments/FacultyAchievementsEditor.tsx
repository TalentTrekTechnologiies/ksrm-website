"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react"
import { TextField, SelectField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  ACHIEVEMENT_TYPES,
  FacultyAchievement,
  FacultyAchievementType,
  createFacultyAchievement,
  deleteFacultyAchievement,
  getFacultyAchievementsAdmin,
  updateFacultyAchievement,
} from "@/lib/faculty-achievements-api"

/**
 * Publications, patents, books, awards and certifications for one faculty
 * member.
 *
 * The point of this screen is that a person is entered once and then
 * accumulates records: four papers and a patent this year, more next year, all
 * against the same faculty entry. So it is a list you append to, grouped by
 * kind, with its own date on every row - never a reason to create a second
 * entry for the same person.
 */

interface FormState {
  type: FacultyAchievementType
  title: string
  detail: string
  referenceNo: string
  date: string
  status: string
  url: string
}

const emptyForm: FormState = {
  type: "PUBLICATION",
  title: "",
  detail: "",
  referenceNo: "",
  date: "",
  status: "",
  url: "",
}

// What "detail" and "reference" mean depends on the kind, so the labels follow
// it - a patent has a granting authority and a patent number, a paper has a
// journal and a DOI.
const FIELD_LABELS: Record<FacultyAchievementType, { detail: string; ref: string; date: string }> = {
  PUBLICATION: { detail: "Journal / Conference", ref: "DOI / ISSN", date: "Date of publication" },
  PATENT: { detail: "Granting authority", ref: "Patent / application number", date: "Date of issue" },
  BOOK: { detail: "Publisher", ref: "ISBN", date: "Date of publication" },
  AWARD: { detail: "Awarded by", ref: "Reference", date: "Date received" },
  CERTIFICATION: { detail: "Issued by", ref: "Certificate number", date: "Date of issue" },
  PROFILE_ID: { detail: "Value", ref: "Reference (optional)", date: "Date added (optional)" },
  DETAIL: { detail: "Value", ref: "Reference (optional)", date: "Date (optional)" },
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export default function FacultyAchievementsEditor({
  facultyId,
  facultyName,
}: {
  facultyId: number
  facultyName: string
}) {
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<FacultyAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<FacultyAchievement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const formRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  async function refresh() {
    try {
      setItems(await getFacultyAchievementsAdmin(facultyId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load this person's records")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getFacultyAchievementsAdmin(facultyId)
        if (!cancelled) setItems(rows)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load this person's records")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [facultyId])

  /**
   * Bring this editor's own form into view.
   *
   * It sits inside the faculty form, which is itself well down a long page, so
   * clicking "Patent" could open a form that was entirely below the fold - it
   * looked as though the button had done nothing.
   */
  function revealForm() {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  function startAdd(type: FacultyAchievementType) {
    setForm({ ...emptyForm, type })
    setEditing(null)
    setAdding(true)
    revealForm()
  }

  function startEdit(row: FacultyAchievement) {
    revealForm()
    setForm({
      type: row.type,
      title: row.title,
      detail: row.detail ?? "",
      referenceNo: row.referenceNo ?? "",
      date: row.date ? row.date.slice(0, 10) : "",
      status: row.status ?? "",
      url: row.url ?? "",
    })
    setEditing(row)
    setAdding(false)
  }

  function cancel() {
    setAdding(false)
    setEditing(null)
  }

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        detail: form.detail.trim() || null,
        referenceNo: form.referenceNo.trim() || null,
        // Empty means "not known" rather than a date of zero.
        date: form.date ? new Date(form.date).toISOString() : null,
        status: form.status.trim() || null,
        url: form.url.trim() || null,
      }
      if (editing) {
        await updateFacultyAchievement(editing.id, { ...payload, version: editing.version })
      } else {
        await createFacultyAchievement({ ...payload, facultyId })
      }
      cancel()
      await refresh()
      notifySaved("Saved.")
      // The form closes on save, so without this the page jumps back to
      // wherever it was and the row just added is off-screen - the reason
      // adding a patent looked like it had not worked.
      requestAnimationFrame(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: FacultyAchievement) {
    if (
      !(await confirm({
        title: "Delete",
        message: `Delete "${row.title}"? You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteFacultyAchievement(row.id)
      await refresh()
      notifySaved("Deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-admin-primary" />
      </div>
    )
  }

  const labels = FIELD_LABELS[form.type]
  const isFormOpen = adding || editing !== null

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Profile Records — Publications, Patents &amp; IDs</p>
        <p className="text-xs text-slate-500">
          Records for {facultyName}. <strong>These are what appear when a visitor clicks &ldquo;View Profile&rdquo;</strong> on
          the public faculty list. Add each new paper or patent here — there is never a need to create a
          second faculty entry for the same person.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {ACHIEVEMENT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => startAdd(t.value)}
            className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-admin-bg"
          >
            <Plus className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {isFormOpen && (
        <div ref={formRef} style={{ boxShadow: "var(--shadow-admin-card)", scrollMarginTop: "16px" }} className="space-y-3 rounded-2xl border border-admin-border bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">
            {editing ? "Edit" : "New"} {ACHIEVEMENT_TYPES.find((t) => t.value === form.type)?.label}
          </p>
          <SelectField
            label="Type"
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v as FacultyAchievementType })}
            options={ACHIEVEMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <TextField
            label={form.type === "PROFILE_ID" || form.type === "DETAIL" ? "Label" : "Title"}
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
            maxLength={500}
            placeholder={
              form.type === "PROFILE_ID"
                ? "Scopus ID · ORCID · Vidwan"
                : form.type === "DETAIL"
                  ? "Date of Joining · Languages Known · Membership"
                  : undefined
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label={labels.detail} value={form.detail} onChange={(v) => setForm({ ...form, detail: v })} />
            <TextField label={labels.ref} value={form.referenceNo} onChange={(v) => setForm({ ...form, referenceNo: v })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">{labels.date}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-admin-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">Leave blank if not known, or if a patent is still pending.</p>
            </div>
            <TextField
              label="Status (optional)"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              placeholder="Granted · Filed · Published"
            />
          </div>
          <TextField label="Link (optional)" value={form.url} onChange={(v) => setForm({ ...form, url: v })} placeholder="https://" />
          <FormActions>
            <SecondaryButton onClick={cancel}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving || !form.title.trim()}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <div ref={listRef} style={{ scrollMarginTop: "16px" }} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">
          Nothing recorded yet. Use the buttons above to add a publication or patent.
        </p>
      ) : (
        ACHIEVEMENT_TYPES.map((t) => {
          const group = items.filter((i) => i.type === t.value)
          if (group.length === 0) return null
          return (
            <div key={t.value}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.plural} ({group.length})
              </p>
              <div className="overflow-hidden rounded-xl border border-admin-border">
                {group.map((row, i) => (
                  <div key={row.id} className={`flex items-start gap-3 bg-white px-3 py-2.5 ${i > 0 ? "border-t border-admin-border" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{row.title}</p>
                      <p className="text-xs text-slate-500">
                        {fmtDate(row.date)}
                        {row.detail && ` · ${row.detail}`}
                        {row.referenceNo && ` · ${row.referenceNo}`}
                        {row.status && ` · ${row.status}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => startEdit(row)} className="shrink-0 text-xs font-semibold text-admin-primary hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(row)} aria-label="Delete" className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
