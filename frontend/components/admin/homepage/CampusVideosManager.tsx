"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, Play } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import SectionVisibilityToggle from "@/components/admin/cms/SectionVisibilityToggle"
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
  getCampusVideosAdmin,
  createCampusVideo,
  updateCampusVideo,
  deleteCampusVideo,
  restoreCampusVideo,
  CampusVideo,
} from "@/lib/homepage-api"

interface FormState {
  title: string
  youtubeUrl: string
  badgeLabel: string
  isActive: boolean
}

const emptyForm: FormState = { title: "", youtubeUrl: "", badgeLabel: "", isActive: true }

function getVideoId(url: string) {
  const match = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : ""
}

function CampusVideosManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<CampusVideo[]>([])
  const [editing, setEditing] = useState<CampusVideo | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getCampusVideosAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load campus videos")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getCampusVideosAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load campus videos")
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

  function startEdit(item: CampusVideo) {
    setEditing(item)
    setCreating(false)
    setForm({ title: item.title, youtubeUrl: item.youtubeUrl, badgeLabel: item.badgeLabel ?? "", isActive: item.isActive })
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
        youtubeUrl: form.youtubeUrl,
        badgeLabel: form.badgeLabel || undefined,
        isActive: form.isActive,
      }
      if (editing) {
        await updateCampusVideo(editing.id, { ...dto, version: editing.version })
      } else {
        await createCampusVideo(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save campus video")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: CampusVideo) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteCampusVideo(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete campus video")
    }
  }

  async function handleRestore(item: CampusVideo) {
    try {
      await restoreCampusVideo(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore campus video")
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
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Campus Videos
          </h1>
          <p className="text-sm text-slate-500">Official tour/promo videos shown on the homepage.</p>
        </div>
        <SectionVisibilityToggle sectionKey="campusVideos" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit video" : "New video"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={150} />
          <TextField label="YouTube embed URL" value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} required placeholder="https://www.youtube.com/embed/xxxxxxxx" />
          <TextField label="Badge label" value={form.badgeLabel} onChange={(v) => setForm({ ...form, badgeLabel: v })} placeholder="Campus Tour" helperText='Shown on the thumbnail. Defaults to "Campus Video" if left blank.' />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.youtubeUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search videos..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add video
          </button>
        }
      />

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No campus videos yet"
        emptyDescription="Add your first campus video."
        renderCard={(item) => {
          const videoId = getVideoId(item.youtubeUrl)
          const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""
          return (
            <div>
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={item.title} className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                    <Play className="h-4 w-4 fill-admin-primary text-admin-primary" />
                  </div>
                </div>
                <span className="absolute left-2 top-2 rounded-full bg-admin-gold px-2 py-0.5 text-[10px] font-bold uppercase text-slate-900">
                  {item.badgeLabel || "Campus Video"}
                </span>
              </div>
              <p className="p-3 text-sm font-semibold text-slate-900">{item.title}</p>
            </div>
          )
        }}
      />

      {deletedItems.length > 0 && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
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

export default function CampusVideosManager() {
  return (
    <PermissionGate permission="homepage.view">
      <CampusVideosManagerInner />
    </PermissionGate>
  )
}
