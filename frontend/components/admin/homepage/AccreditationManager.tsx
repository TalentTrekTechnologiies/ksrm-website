"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
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
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getAccreditationBadgesAdmin,
  createAccreditationBadge,
  updateAccreditationBadge,
  deleteAccreditationBadge,
  restoreAccreditationBadge,
  AccreditationBadge,
} from "@/lib/homepage-api"

interface FormState {
  shortName: string
  grade: string
  name: string
  subtext: string
  linkUrl: string
  linkText: string
  imageUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  shortName: "",
  grade: "",
  name: "",
  subtext: "",
  linkUrl: "",
  linkText: "",
  imageUrl: "",
  mediaId: null,
  isActive: true,
}

function AccreditationManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<AccreditationBadge[]>([])
  const [editing, setEditing] = useState<AccreditationBadge | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getAccreditationBadgesAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load accreditation badges")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getAccreditationBadgesAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load accreditation badges")
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

  function startEdit(item: AccreditationBadge) {
    setEditing(item)
    setCreating(false)
    setForm({
      shortName: item.shortName,
      grade: item.grade ?? "",
      name: item.name,
      subtext: item.subtext ?? "",
      linkUrl: item.linkUrl ?? "",
      linkText: item.linkText ?? "",
      imageUrl: item.imageUrl,
      mediaId: item.mediaId,
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
        shortName: form.shortName,
        grade: form.grade || undefined,
        name: form.name,
        subtext: form.subtext || undefined,
        linkUrl: form.linkUrl || undefined,
        linkText: form.linkText || undefined,
        imageUrl: form.imageUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      }
      if (editing) {
        await updateAccreditationBadge(editing.id, { ...dto, version: editing.version })
      } else {
        await createAccreditationBadge(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save accreditation badge")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: AccreditationBadge) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.name}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteAccreditationBadge(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete accreditation badge")
    }
  }

  async function handleRestore(item: AccreditationBadge) {
    try {
      await restoreAccreditationBadge(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore accreditation badge")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.shortName.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
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
            Accreditation
          </h1>
          <p className="text-sm text-slate-500">Accreditation and ranking badges shown on the homepage.</p>
        </div>
        <SectionVisibilityToggle sectionKey="accreditation" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit badge" : "New badge"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Short name" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v })} required maxLength={20} placeholder="NAAC" />
            <TextField label="Grade" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} maxLength={30} placeholder="A+" />
            <TextField label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required maxLength={100} placeholder="NAAC Accredited" />
            <TextField label="Subtext" value={form.subtext} onChange={(v) => setForm({ ...form, subtext: v })} maxLength={150} placeholder="3.60 CGPA" />
            <TextField label="Link URL" value={form.linkUrl} onChange={(v) => setForm({ ...form, linkUrl: v })} placeholder="/accreditation" />
            <TextField label="Link text" value={form.linkText} onChange={(v) => setForm({ ...form, linkText: v })} maxLength={60} placeholder="View Certificate" />
          </div>
          <MediaField
            label="Badge image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/naac.png"
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.shortName || !form.name || !form.imageUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search badges..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add badge
          </button>
        }
      />

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No accreditation badges yet"
        emptyDescription="Add your first badge."
        renderCard={(item) => (
          <div className="flex flex-col items-center p-5 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-admin-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.shortName} className="h-[85%] w-[85%] object-contain" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
            </div>
            <p className="text-xl font-bold text-slate-900">{item.grade || item.shortName}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{item.name}</p>
            {item.subtext && <p className="text-xs text-slate-400">{item.subtext}</p>}
            {item.linkText && (
              <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-admin-primary">
                {item.linkText} <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
      />

      {deletedItems.length > 0 && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.name}</span>
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

export default function AccreditationManager() {
  return (
    <PermissionGate permission="homepage.view">
      <AccreditationManagerInner />
    </PermissionGate>
  )
}
