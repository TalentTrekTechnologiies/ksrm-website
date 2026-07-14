"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import {
  TextField,
  TextAreaField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getCareersAdmin,
  createCareer,
  updateCareer,
  deleteCareer,
  restoreCareer,
  Career,
} from "@/lib/careers-api"

interface FormState {
  title: string
  department: string
  employmentType: string
  location: string
  description: string
  applyUrl: string
  applyEmail: string
  isActive: boolean
}

const emptyForm: FormState = {
  title: "",
  department: "",
  employmentType: "",
  location: "",
  description: "",
  applyUrl: "",
  applyEmail: "",
  isActive: true,
}

function CareersManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Career[]>([])
  const [editing, setEditing] = useState<Career | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getCareersAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load careers")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getCareersAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load careers")
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

  function startEdit(item: Career) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      department: item.department ?? "",
      employmentType: item.employmentType ?? "",
      location: item.location ?? "",
      description: item.description,
      applyUrl: item.applyUrl ?? "",
      applyEmail: item.applyEmail ?? "",
      isActive: item.isActive,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        department: form.department || undefined,
        employmentType: form.employmentType || undefined,
        location: form.location || undefined,
        description: form.description,
        applyUrl: form.applyUrl || undefined,
        applyEmail: form.applyEmail || undefined,
        isActive: form.isActive,
      }
      if (editing) {
        await updateCareer(editing.id, { ...dto, version: editing.version })
      } else {
        await createCareer(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save career")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Career) {
    if (!confirm(`Delete "${item.title}"? You can restore it afterwards.`)) return
    try {
      await deleteCareer(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete career")
    }
  }

  async function handleRestore(item: Career) {
    try {
      await restoreCareer(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore career")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q) || (i.department ?? "").toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Career>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[220px] truncate font-medium text-slate-800">{row.original.title}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "employmentType", header: "Type" },
    { accessorKey: "location", header: "Location" },
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
    return <CmsTableSkeleton />
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Careers
        </h1>
        <p className="text-sm text-slate-500">Job openings shown on the public Careers page.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit opening" : "New opening"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={200} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
            <TextField label="Employment Type" value={form.employmentType} onChange={(v) => setForm({ ...form, employmentType: v })} placeholder="Full-Time" />
            <TextField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          </div>
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required rows={4} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Apply URL" value={form.applyUrl} onChange={(v) => setForm({ ...form, applyUrl: v })} />
            <TextField label="Apply Email" value={form.applyEmail} onChange={(v) => setForm({ ...form, applyEmail: v })} />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.description}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search careers..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add opening
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No job openings yet" emptyDescription="Add your first opening." pageSize={15} />
    </div>
  )
}

export default function CareersManager() {
  return (
    <PermissionGate permission="careers.view">
      <CareersManagerInner />
    </PermissionGate>
  )
}
