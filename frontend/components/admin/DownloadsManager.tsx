"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getDownloadsAdmin,
  createDownload,
  updateDownload,
  deleteDownload,
  restoreDownload,
  Download,
  DownloadCategory,
  PAGE_SECTIONS,
} from "@/lib/downloads-api"

interface FormState {
  title: string
  description: string
  category: DownloadCategory
  pageSection: string
  groupLabel: string
  fileUrl: string
  mediaId: number | null
  isActive: boolean
}

const CATEGORY_OPTIONS: { value: DownloadCategory; label: string }[] = [
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Paper" },
  { value: "BROCHURE", label: "Brochure" },
  { value: "AFFIDAVIT", label: "Affidavit" },
  { value: "FORM", label: "Form" },
  { value: "OTHER", label: "Other" },
]

// "" = not tied to any page (general Downloads only). Prepended to the shared
// PAGE_SECTIONS list so the admin can clear the routing.
const PAGE_SECTION_OPTIONS = [{ value: "", label: "— None (general only) —" }, ...PAGE_SECTIONS]

const emptyForm: FormState = { title: "", description: "", category: "OTHER", pageSection: "", groupLabel: "", fileUrl: "", mediaId: null, isActive: true }

function DownloadsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Download[]>([])
  const [editing, setEditing] = useState<Download | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getDownloadsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load downloads")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getDownloadsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load downloads")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: Download) {
    setEditing(item)
    setCreating(false)
    setForm({ title: item.title, description: item.description ?? "", category: item.category, pageSection: item.pageSection ?? "", groupLabel: item.groupLabel ?? "", fileUrl: item.fileUrl, mediaId: item.mediaId, isActive: item.isActive })
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
      const dto = { title: form.title, description: form.description || undefined, category: form.category, pageSection: form.pageSection || null, groupLabel: form.groupLabel || null, fileUrl: form.fileUrl, mediaId: form.mediaId, isActive: form.isActive }
      if (editing) {
        await updateDownload(editing.id, { ...dto, version: editing.version })
      } else {
        await createDownload(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save download")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Download) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteDownload(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete download")
    }
  }

  async function handleRestore(item: Download) {
    try {
      await restoreDownload(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore download")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Download>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[240px] truncate font-medium text-slate-800">{row.original.title}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "category", header: "Category" },
    {
      id: "file",
      header: "File",
      cell: ({ row }) => (
        <a href={row.original.fileUrl} target="_blank" rel="noopener noreferrer" className="text-admin-primary hover:underline">
          Open
        </a>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Active</span>
        ) : (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">Inactive</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <button type="button" onClick={() => handleRestore(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
            Restore
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => startEdit(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(row.original)} className="text-xs font-semibold text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Documents
        </h1>
        <p className="text-sm text-slate-500">
          Documents published for download (calendars, timetables, results, syllabi, forms). Use
          &ldquo;Show on page&rdquo; to route one to a section of the public site.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit download" : "New download"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={300} />
          <SelectField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v as DownloadCategory })} options={CATEGORY_OPTIONS} required />
          <SelectField label="Show on page (optional)" value={form.pageSection} onChange={(v) => setForm({ ...form, pageSection: v })} options={PAGE_SECTION_OPTIONS} />
          <TextField label="Group heading (optional)" value={form.groupLabel} onChange={(v) => setForm({ ...form, groupLabel: v })} placeholder="AY 2025-26 · B.Tech · M.Tech · MBA" />
          <MediaField
            label="File"
            url={form.fileUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, fileUrl: url, mediaId })}
            accept={["DOCUMENT"]}
            required
            urlPlaceholder="/downloads/syllabus.pdf"
          />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.fileUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search downloads..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add download
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No downloads yet" emptyDescription="Add your first document." pageSize={15} />
    </div>
  )
}

export default function DownloadsManager() {
  return (
    <PermissionGate permission="downloads.view">
      <DownloadsManagerInner />
    </PermissionGate>
  )
}
