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
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getFacultyAdmin,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  restoreFaculty,
  Faculty,
} from "@/lib/faculty-api"

interface FormState {
  name: string
  designation: string
  qualification: string
  department: string
  specialization: string
  experience: string
  email: string
  phone: string
  photoUrl: string
  mediaId: number | null
  isHod: boolean
}

const emptyForm: FormState = {
  name: "",
  designation: "",
  qualification: "",
  department: "",
  specialization: "",
  experience: "",
  email: "",
  phone: "",
  photoUrl: "",
  mediaId: null,
  isHod: false,
}

function FacultyManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Faculty[]>([])
  const [editing, setEditing] = useState<Faculty | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getFacultyAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load faculty")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getFacultyAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load faculty")
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

  function startEdit(item: Faculty) {
    setEditing(item)
    setCreating(false)
    setForm({
      name: item.name,
      designation: item.designation,
      qualification: item.qualification,
      department: item.department,
      specialization: item.specialization ?? "",
      experience: item.experience ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      photoUrl: item.photoUrl ?? "",
      mediaId: item.mediaId,
      isHod: item.isHod,
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
        name: form.name,
        designation: form.designation,
        qualification: form.qualification,
        department: form.department,
        specialization: form.specialization || undefined,
        experience: form.experience || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        photoUrl: form.photoUrl || undefined,
        mediaId: form.mediaId,
        isHod: form.isHod,
      }
      if (editing) {
        await updateFaculty(editing.id, { ...dto, version: editing.version })
      } else {
        await createFaculty(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save faculty")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Faculty) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.name}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteFaculty(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete faculty")
    }
  }

  async function handleRestore(item: Faculty) {
    try {
      await restoreFaculty(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore faculty")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.department.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Faculty>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[200px] truncate font-medium text-slate-800">{row.original.name}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "department", header: "Department" },
    {
      id: "hod",
      header: "HOD",
      cell: ({ row }) =>
        row.original.isHod ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-admin-primary bg-admin-primary/10">HOD</span>
        ) : null,
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
          Faculty
        </h1>
        <p className="text-sm text-slate-500">Faculty directory entries.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit faculty" : "New faculty"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} required />
            <TextField label="Qualification" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} required />
            <TextField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} required />
            <TextField label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
            <TextField label="Experience" value={form.experience} onChange={(v) => setForm({ ...form, experience: v })} />
            <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <MediaField
            label="Photo"
            url={form.photoUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, photoUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/faculty/jane-doe.jpg"
          />
          <ToggleField label="Head of Department" checked={form.isHod} onChange={(v) => setForm({ ...form, isHod: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.designation || !form.qualification || !form.department}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add faculty
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No faculty yet" emptyDescription="Add your first faculty member." pageSize={15} />
    </div>
  )
}

export default function FacultyManager() {
  return (
    <PermissionGate permission="faculty.view">
      <FacultyManagerInner />
    </PermissionGate>
  )
}
