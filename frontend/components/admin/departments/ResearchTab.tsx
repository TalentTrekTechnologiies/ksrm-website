"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, NumberField, SelectField, ToggleField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getResearchAdmin,
  createResearch,
  updateResearch,
  deleteResearch,
  ResearchRecord,
} from "@/lib/research-api"

interface FormState {
  title: string
  authors: string
  journal: string
  year: number
  type: string
  doiOrLink: string
  attachmentUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  title: "",
  authors: "",
  journal: "",
  year: new Date().getFullYear(),
  type: "Publication",
  doiOrLink: "",
  attachmentUrl: "",
  mediaId: null,
  isActive: true,
}

const TYPE_OPTIONS = [
  { value: "Publication", label: "Publication" },
  { value: "Project", label: "Project" },
  { value: "Patent", label: "Patent" },
]

export default function ResearchTab({ departmentId }: { departmentId: number }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<ResearchRecord[]>([])
  const [editing, setEditing] = useState<ResearchRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await getResearchAdmin(departmentId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load research records")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getResearchAdmin(departmentId)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load research records")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [departmentId])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: ResearchRecord) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      authors: item.authors,
      journal: item.journal ?? "",
      year: item.year,
      type: item.type,
      doiOrLink: item.doiOrLink ?? "",
      attachmentUrl: item.attachmentUrl ?? "",
      mediaId: item.mediaId,
      isActive: item.isActive,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        authors: form.authors,
        journal: form.journal || undefined,
        year: form.year,
        type: form.type,
        doiOrLink: form.doiOrLink || undefined,
        attachmentUrl: form.attachmentUrl || undefined,
        mediaId: form.mediaId,
        isActive: form.isActive,
      }
      if (editing) {
        await updateResearch(editing.id, dto)
      } else {
        await createResearch({ ...dto, departmentId })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save research record")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: ResearchRecord) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? This cannot be undone.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteResearch(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete research record")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Research (Publications / Projects / Patents)</h2>
          <p className="text-sm text-slate-500">No soft-delete on this list - Delete is permanent. Use Active to hide instead.</p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit" : "New"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Authors" value={form.authors} onChange={(v) => setForm({ ...form, authors: v })} required />
            <TextField label="Journal / Venue" value={form.journal} onChange={(v) => setForm({ ...form, journal: v })} />
            <NumberField label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} required />
            <SelectField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPE_OPTIONS} />
          </div>
          <TextField label="DOI / Link" value={form.doiOrLink} onChange={(v) => setForm({ ...form, doiOrLink: v })} />
          <MediaField
            label="Attachment (paper / patent PDF)"
            url={form.attachmentUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, attachmentUrl: url, mediaId })}
            accept={["DOCUMENT"]}
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.authors}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">
          No research records yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {item.authors} · {item.year} · {item.type}
                  {!item.isActive && <span className="ml-2 font-semibold text-amber-600">Inactive</span>}
                </p>
              </div>
              <button type="button" onClick={() => startEdit(item)} aria-label="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-admin-primary">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => handleDelete(item)} aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
