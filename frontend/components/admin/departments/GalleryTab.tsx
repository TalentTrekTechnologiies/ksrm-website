"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, ToggleField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
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
  isActive: boolean
}

const emptyForm: FormState = { title: "", imageUrl: "", mediaId: null, isActive: true }

export default function GalleryTab({ departmentId }: { departmentId: number }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<GalleryImage[]>([])
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await getGalleryAdmin(true, departmentId))
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
        const all = await getGalleryAdmin(true, departmentId)
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
  }, [departmentId])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: GalleryImage) {
    setEditing(item)
    setCreating(false)
    setForm({ title: item.title, imageUrl: item.imageUrl, mediaId: item.mediaId, isActive: item.isActive })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateGalleryImage(editing.id, {
          title: form.title,
          imageUrl: form.imageUrl,
          mediaId: form.mediaId,
          isActive: form.isActive,
          version: editing.version,
        })
      } else {
        await createGalleryImage({
          title: form.title,
          imageUrl: form.imageUrl,
          mediaId: form.mediaId,
          isActive: form.isActive,
          departmentId,
        })
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save gallery image")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: GalleryImage) {
    if (!confirm(`Delete "${item.title}"? You can restore it afterwards.`)) return
    try {
      await deleteGalleryImage(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete gallery image")
    }
  }

  async function handleRestore(item: GalleryImage) {
    try {
      await restoreGalleryImage(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore gallery image")
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
  const liveItems = items.filter((i) => i.deletedAt === null)
  const deletedItems = items.filter((i) => i.deletedAt !== null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gallery</h2>
          <p className="text-sm text-slate-500">Photos for this department's Gallery section.</p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add photo
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit photo" : "New photo"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.imageUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No gallery photos yet"
        renderCard={(item) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover" />
        )}
      />

      {deletedItems.length > 0 && (
        <div className="border-t border-admin-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.title}</span>
                <button type="button" onClick={() => handleRestore(item)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
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
