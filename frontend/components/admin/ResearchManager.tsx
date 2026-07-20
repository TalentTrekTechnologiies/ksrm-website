"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  NumberField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getResearchAdmin,
  createResearch,
  updateResearch,
  deleteResearch,
  ResearchRecord,
} from "@/lib/research-api"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"

/**
 * Top-level Research manager - the same records as each department's Research
 * tab, but across every department in one place, so research doesn't have to
 * be edited department-by-department. Mirrors how Gallery and Documents each
 * have both a per-department tab and a global page. A record still belongs to
 * a department (the API requires departmentId on create), so this adds a
 * department picker the workspace tab doesn't need.
 */

interface FormState {
  departmentId: number | null
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
  departmentId: null,
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

function ResearchManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<ResearchRecord[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [editing, setEditing] = useState<ResearchRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deptFilter, setDeptFilter] = useState<string>("")

  async function refresh() {
    try {
      setItems(await getResearchAdmin())
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
        const [all, depts] = await Promise.all([getResearchAdmin(), getDepartmentsAdmin()])
        if (!cancelled) {
          setItems(all)
          setDepartments(depts.filter((d) => d.isActive))
        }
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
  }, [])

  const deptOptions = useMemo(
    () => [
      { value: "", label: "Select a department…" },
      ...departments.map((d) => ({ value: String(d.id), label: d.shortName || d.name })),
    ],
    [departments],
  )

  const deptName = useMemo(() => {
    const map = new Map(departments.map((d) => [d.id, d.shortName || d.name]))
    return (id: number | null) => (id !== null ? map.get(id) ?? "—" : "—")
  }, [departments])

  const visible = useMemo(
    () => (deptFilter ? items.filter((r) => String(r.departmentId) === deptFilter) : items),
    [items, deptFilter],
  )

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: ResearchRecord) {
    setEditing(item)
    setCreating(false)
    setForm({
      departmentId: item.departmentId,
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
    if (form.departmentId === null) {
      setError("Please choose which department this research belongs to.")
      return
    }
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
        departmentId: form.departmentId,
      }
      if (editing) {
        await updateResearch(editing.id, dto)
      } else {
        await createResearch(dto)
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Research
          </h1>
          <p className="text-sm text-slate-500">
            Publications, projects and patents across every department. Shows on each department page and the site-wide Research page.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-admin-primary to-admin-primary-light px-4 py-2 text-sm font-semibold text-white shadow-md shadow-admin-primary/25 transition-all hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" /> Add research
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
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit research" : "New research"}</p>
          <SelectField
            label="Department"
            value={form.departmentId !== null ? String(form.departmentId) : ""}
            onChange={(v) => setForm({ ...form, departmentId: v ? Number(v) : null })}
            options={deptOptions}
            required
          />
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
          <ToggleField label="Active (visible on the public site)" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.authors || form.departmentId === null}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {departments.length > 1 && (
        <div className="max-w-xs">
          <SelectField
            label="Filter by department"
            value={deptFilter}
            onChange={setDeptFilter}
            options={[{ value: "", label: "All departments" }, ...departments.map((d) => ({ value: String(d.id), label: d.shortName || d.name }))]}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border p-8 text-center text-sm text-slate-400">
          {items.length === 0 ? "No research records yet. Click “Add research” to create the first one." : "No research in this department yet."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-admin-border bg-white px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
                <p className="truncate text-xs text-slate-500">
                  <span className="font-semibold text-admin-primary">{deptName(item.departmentId)}</span>
                  {" · "}
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

export default function ResearchManager() {
  return (
    <PermissionGate permission="research.view">
      <ResearchManagerInner />
    </PermissionGate>
  )
}
