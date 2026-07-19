"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getQuickLinksAdmin,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  restoreQuickLink,
  reorderQuickLinks,
  QuickLink,
} from "@/lib/homepage-api"

const SECTION = "homepage_quick_links" as const

interface FormState {
  icon: string
  imageUrl: string
  mediaId: number | null
  title: string
  description: string
  linkUrl: string
  linkText: string
  isActive: boolean
}

const emptyForm: FormState = {
  icon: "",
  imageUrl: "",
  mediaId: null,
  title: "",
  description: "",
  linkUrl: "",
  linkText: "",
  isActive: true,
}

function QuickLinksManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<QuickLink[]>([])
  const [editing, setEditing] = useState<QuickLink | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await getQuickLinksAdmin(SECTION, true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load quick links")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getQuickLinksAdmin(SECTION, true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load quick links")
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

  function startEdit(item: QuickLink) {
    setEditing(item)
    setCreating(false)
    setForm({
      icon: item.icon ?? "",
      imageUrl: item.imageUrl,
      mediaId: item.mediaId,
      title: item.title,
      description: item.description ?? "",
      linkUrl: item.linkUrl,
      linkText: item.linkText ?? "",
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
      const shared = {
        icon: form.icon || undefined,
        imageUrl: form.imageUrl,
        mediaId: form.mediaId,
        title: form.title,
        description: form.description || undefined,
        linkUrl: form.linkUrl,
        linkText: form.linkText || undefined,
        isActive: form.isActive,
      }
      if (editing) {
        await updateQuickLink(editing.id, { ...shared, section: SECTION, version: editing.version })
      } else if (creating) {
        await createQuickLink({ ...shared, section: SECTION, tags: [] })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save quick link")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: QuickLink) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteQuickLink(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete quick link")
    }
  }

  async function handleRestore(item: QuickLink) {
    try {
      await restoreQuickLink(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore quick link")
    }
  }

  async function handleReorder(newOrder: QuickLink[]) {
    setItems(newOrder)
    try {
      await reorderQuickLinks(
        SECTION,
        newOrder.map((item, index) => ({ id: item.id, sortOrder: index })),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder quick links")
      await refresh()
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
  const liveItems = items.filter((i) => i.deletedAt === null)
  const deletedItems = items.filter((i) => i.deletedAt !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Quick Links
          </h1>
          <p className="text-sm text-slate-500">The Digital Campus Services grid. Drag to reorder.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1 text-sm font-medium text-admin-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit quick link" : "New quick link"}</p>
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(imageUrl, mediaId) => setForm({ ...form, imageUrl, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/posters/admissions.svg"
          />
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Link URL" value={form.linkUrl} onChange={(v) => setForm({ ...form, linkUrl: v })} required placeholder="/admissions" />
            <TextField label="Link text" value={form.linkText} onChange={(v) => setForm({ ...form, linkText: v })} placeholder="Explore" />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.imageUrl || !form.linkUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
        <CmsDragList
          items={liveItems}
          onReorder={handleReorder}
          onEdit={startEdit}
          onDelete={handleDelete}
          renderRow={(item) => (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- Media Library or legacy URL preview */}
              <img src={item.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded object-contain" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
              <p className="truncate text-sm text-slate-700">
                <span className="font-semibold">{item.title}</span>{" "}
                <span className="text-slate-500">{item.linkUrl}</span>
              </p>
            </div>
          )}
        />

        {deletedItems.length > 0 && (
          <div className="mt-4 border-t border-admin-border pt-3">
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
    </div>
  )
}

export default function QuickLinksManager() {
  return (
    <PermissionGate permission="homepage.view">
      <QuickLinksManagerInner />
    </PermissionGate>
  )
}
