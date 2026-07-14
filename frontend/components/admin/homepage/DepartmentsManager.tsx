"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import SectionVisibilityToggle from "@/components/admin/cms/SectionVisibilityToggle"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getDepartmentsAdmin,
  createDepartmentCard,
  updateDepartmentCard,
  deleteDepartmentCard,
  restoreDepartmentCard,
  DepartmentCard,
} from "@/lib/homepage-api"

interface FormState {
  title: string
  imageUrl: string
  mediaId: number | null
  linkUrl: string
  tags: string[]
  isActive: boolean
}

const emptyForm: FormState = { title: "", imageUrl: "", mediaId: null, linkUrl: "", tags: [], isActive: true }

function DepartmentsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<DepartmentCard[]>([])
  const [editing, setEditing] = useState<DepartmentCard | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getDepartmentsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load department cards")
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
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load department cards")
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

  function startEdit(item: DepartmentCard) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      imageUrl: item.imageUrl,
      mediaId: item.mediaId,
      linkUrl: item.linkUrl,
      tags: item.tags,
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
        section: "homepage_departments" as const,
        title: form.title,
        imageUrl: form.imageUrl,
        mediaId: form.mediaId,
        linkUrl: form.linkUrl,
        tags: form.tags,
        isActive: form.isActive,
      }
      if (editing) {
        await updateDepartmentCard(editing.id, { ...dto, version: editing.version })
      } else {
        await createDepartmentCard(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save department card")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: DepartmentCard) {
    if (!confirm(`Delete "${item.title}"? You can restore it afterwards.`)) return
    try {
      await deleteDepartmentCard(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete department card")
    }
  }

  async function handleRestore(item: DepartmentCard) {
    try {
      await restoreDepartmentCard(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore department card")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q))
  }, [items, search])

  const liveItems = filtered.filter((i) => i.deletedAt === null)
  const deletedItems = filtered.filter((i) => i.deletedAt !== null)

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
            Departments
          </h1>
          <p className="text-sm text-slate-500">
            Homepage teaser cards only - not the full department profile pages (bio, faculty, labs).
          </p>
        </div>
        <SectionVisibilityToggle sectionKey="departments" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit department card" : "New department card"}</p>
          <TextField label="Department name" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={100} placeholder="Computer Science & Engineering" />
          <MediaField
            label="Department image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(imageUrl, mediaId) => setForm({ ...form, imageUrl, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/posters/departments/cse.svg"
          />
          <TextField label="Link URL" value={form.linkUrl} onChange={(v) => setForm({ ...form, linkUrl: v })} required placeholder="/departments/cse" />
          <CmsChipList label="Programs" items={form.tags} onChange={(tags) => setForm({ ...form, tags })} placeholder="Add a program..." />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.imageUrl || !form.linkUrl}>
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
            <Plus className="h-4 w-4" /> Add department card
          </button>
        }
      />

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No department cards yet"
        emptyDescription="Add your first department teaser card."
        renderCard={(item) => (
          <div>
            <div className="h-32 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-admin-primary/10 px-2 py-0.5 text-[10px] font-medium text-admin-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-admin-primary">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        )}
      />

      {deletedItems.length > 0 && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.title}</span>
                <button
                  type="button"
                  onClick={() => handleRestore(item)}
                  className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function DepartmentsManager() {
  return (
    <PermissionGate permission="homepage.view">
      <DepartmentsManagerInner />
    </PermissionGate>
  )
}
