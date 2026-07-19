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
  NumberField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getPlacementsAdmin,
  createPlacement,
  updatePlacement,
  deletePlacement,
  restorePlacement,
  Placement,
} from "@/lib/placements-api"

interface FormState {
  studentName: string
  company: string
  package: string
  department: string
  year: number
  imageUrl: string
  mediaId: number | null
  companyLogoUrl: string
  companyLogoMediaId: number | null
  isPublished: boolean
}

const emptyForm: FormState = {
  studentName: "",
  company: "",
  package: "",
  department: "",
  year: new Date().getFullYear(),
  imageUrl: "",
  mediaId: null,
  companyLogoUrl: "",
  companyLogoMediaId: null,
  isPublished: true,
}

function PlacementsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Placement[]>([])
  const [editing, setEditing] = useState<Placement | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getPlacementsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load placements")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getPlacementsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load placements")
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

  function startEdit(item: Placement) {
    setEditing(item)
    setCreating(false)
    setForm({
      studentName: item.studentName,
      company: item.company,
      package: item.package,
      department: item.department,
      year: item.year,
      imageUrl: item.imageUrl ?? "",
      mediaId: item.mediaId,
      companyLogoUrl: item.companyLogoUrl ?? "",
      companyLogoMediaId: item.companyLogoMediaId,
      isPublished: item.isPublished,
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
        studentName: form.studentName,
        company: form.company,
        package: form.package,
        department: form.department,
        year: form.year,
        imageUrl: form.imageUrl || undefined,
        mediaId: form.mediaId,
        companyLogoUrl: form.companyLogoUrl || undefined,
        companyLogoMediaId: form.companyLogoMediaId,
        isPublished: form.isPublished,
      }
      if (editing) {
        await updatePlacement(editing.id, { ...dto, version: editing.version })
      } else {
        await createPlacement(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save placement")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Placement) {
    if (!(await confirm({ title: "Delete", message: `Delete placement record for "${item.studentName}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deletePlacement(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete placement")
    }
  }

  async function handleRestore(item: Placement) {
    try {
      await restorePlacement(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore placement")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.studentName.toLowerCase().includes(q) || i.company.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Placement>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[180px] truncate font-medium text-slate-800">{row.original.studentName}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "company", header: "Company" },
    { accessorKey: "package", header: "Package" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "year", header: "Year" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.isPublished ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Published</span>
        ) : (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-100">Draft</span>
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
          Placements
        </h1>
        <p className="text-sm text-slate-500">Individual student placement records.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit placement" : "New placement"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Student name" value={form.studentName} onChange={(v) => setForm({ ...form, studentName: v })} required />
            <TextField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
            <TextField label="Package" value={form.package} onChange={(v) => setForm({ ...form, package: v })} required placeholder="6 LPA" />
            <TextField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} required />
            <NumberField label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} required />
          </div>
          <MediaField
            label="Student Photo"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/placements/student.jpg"
          />
          <MediaField
            label="Company Logo"
            url={form.companyLogoUrl}
            mediaId={form.companyLogoMediaId}
            onChange={(url, mediaId) => setForm({ ...form, companyLogoUrl: url, companyLogoMediaId: mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/placements/company-logo.png"
          />
          <ToggleField label="Published" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.studentName || !form.company || !form.package || !form.department}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search placements..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add placement
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No placement records yet" emptyDescription="Add your first placement record." pageSize={15} />
    </div>
  )
}

export default function PlacementsManager() {
  return (
    <PermissionGate permission="placements.view">
      <PlacementsManagerInner />
    </PermissionGate>
  )
}
