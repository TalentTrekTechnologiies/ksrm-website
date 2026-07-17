"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { PAGE_SECTIONS } from "@/lib/downloads-api"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getGalleryAdmin,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  restoreGalleryImage,
  GalleryImage,
} from "@/lib/gallery-api"

interface FormState {
  title: string
  imageUrl: string
  mediaId: number | null
  category: string
  pageSection: string
  isActive: boolean
}

// "" = not tied to any page (general Gallery only).
const PAGE_SECTION_OPTIONS = [{ value: "", label: "— None (general gallery) —" }, ...PAGE_SECTIONS]

const emptyForm: FormState = { title: "", imageUrl: "", mediaId: null, category: "", pageSection: "", isActive: true }

function GalleryManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<GalleryImage[]>([])
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getGalleryAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load gallery images")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getGalleryAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load gallery images")
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

  function startEdit(item: GalleryImage) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      imageUrl: item.imageUrl,
      mediaId: item.mediaId,
      category: item.category ?? "",
      pageSection: item.pageSection ?? "",
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
        imageUrl: form.imageUrl,
        mediaId: form.mediaId,
        category: form.category || undefined,
        pageSection: form.pageSection || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateGalleryImage(editing.id, { ...dto, version: editing.version })
      } else {
        await createGalleryImage(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save image")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: GalleryImage) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteGalleryImage(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete image")
    }
  }

  async function handleRestore(item: GalleryImage) {
    try {
      await restoreGalleryImage(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore image")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
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
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Gallery
        </h1>
        <p className="text-sm text-slate-500">Campus photo gallery shown on the public site.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit image" : "New image"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={150} />
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/gallery/campus/1.jpg"
          />
          <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Campus, Events, Sports..." />
          <SelectField label="Show on page (optional)" value={form.pageSection} onChange={(v) => setForm({ ...form, pageSection: v })} options={PAGE_SECTION_OPTIONS} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.imageUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search gallery..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add image
          </button>
        }
      />

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No gallery images yet"
        emptyDescription="Add your first photo."
        renderCard={(item) => (
          <div>
            <div className="h-32 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
              {item.category && <p className="text-xs text-slate-500">{item.category}</p>}
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

export default function GalleryManager() {
  return (
    <PermissionGate permission="gallery.view">
      <GalleryManagerInner />
    </PermissionGate>
  )
}
