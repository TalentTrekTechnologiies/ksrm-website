"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Plus, AlertTriangle, LayoutGrid } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getDepartmentsAdmin,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
  Department,
} from "@/lib/departments-api"

interface FormState {
  slug: string
  name: string
  shortName: string
  tagline: string
  about: string
  heroImageUrl: string
  heroMediaId: number | null
  vision: string
  mission: string[]
  establishedYear: number
  isActive: boolean
}

const emptyForm: FormState = {
  slug: "",
  name: "",
  shortName: "",
  tagline: "",
  about: "",
  heroImageUrl: "",
  heroMediaId: null,
  vision: "",
  mission: [],
  establishedYear: NaN,
  isActive: true,
}

function DepartmentsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Department[]>([])
  const [editing, setEditing] = useState<Department | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getDepartmentsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load departments")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getDepartmentsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load departments")
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

  function startEdit(item: Department) {
    setEditing(item)
    setCreating(false)
    setForm({
      slug: item.slug,
      name: item.name,
      shortName: item.shortName ?? "",
      tagline: item.tagline ?? "",
      about: item.about,
      heroImageUrl: item.heroImageUrl ?? "",
      heroMediaId: item.heroMediaId,
      vision: item.vision ?? "",
      mission: item.mission,
      establishedYear: item.establishedYear ?? NaN,
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
        slug: form.slug,
        name: form.name,
        shortName: form.shortName || undefined,
        tagline: form.tagline || undefined,
        about: form.about,
        heroImageUrl: form.heroImageUrl || undefined,
        heroMediaId: form.heroMediaId,
        vision: form.vision || undefined,
        mission: form.mission,
        establishedYear: Number.isNaN(form.establishedYear) ? undefined : form.establishedYear,
        isActive: form.isActive,
      }
      if (editing) {
        await updateDepartment(editing.id, { ...dto, version: editing.version })
      } else {
        await createDepartment(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save department")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Department) {
    if (!confirm(`Delete "${item.name}"? You can restore it afterwards.`)) return
    try {
      await deleteDepartment(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete department")
    }
  }

  async function handleRestore(item: Department) {
    try {
      await restoreDepartment(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore department")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[220px] truncate font-medium text-slate-800">{row.original.name}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "establishedYear", header: "Established" },
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
            <Link
              href={`/admin/departments/workspace?id=${row.original.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Manage content
            </Link>
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
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Departments
        </h1>
        <p className="text-sm text-slate-500">
          Full department profiles (bio, vision, mission). Separate from the homepage teaser cards.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit department" : "New department"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required placeholder="cse" />
            <TextField label="Short name" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} />
            <NumberField label="Established year" value={form.establishedYear} onChange={(v) => setForm({ ...form, establishedYear: v })} />
          </div>
          <TextField label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <TextAreaField label="About" value={form.about} onChange={(v) => setForm({ ...form, about: v })} required rows={4} />
          <MediaField
            label="Hero Image"
            url={form.heroImageUrl}
            mediaId={form.heroMediaId}
            onChange={(url, mediaId) => setForm({ ...form, heroImageUrl: url, heroMediaId: mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/departments/cse-hero.jpg"
          />
          <TextAreaField label="Vision" value={form.vision} onChange={(v) => setForm({ ...form, vision: v })} rows={2} />
          <CmsChipList label="Mission points" items={form.mission} onChange={(mission) => setForm({ ...form, mission })} placeholder="Add a mission point..." />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.about}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add department
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No departments yet" emptyDescription="Add your first department profile." pageSize={15} />
    </div>
  )
}

export default function DepartmentsManager() {
  return (
    <PermissionGate permission="departments.view">
      <DepartmentsManagerInner />
    </PermissionGate>
  )
}
