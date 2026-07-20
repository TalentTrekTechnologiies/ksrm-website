"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, PlayCircle } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import { TextField, SelectField, ToggleField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
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
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"

/**
 * Top-level Videos manager - every campus/department video in one place, the
 * counterpart to Research getting its own tab. A video with no department
 * belongs to the homepage's Campus Videos strip; a video with a department
 * shows on that department page's Videos section. This manager spans both, so
 * the picker offers "Homepage" plus every department; the per-department
 * workspace Videos tab and the homepage Campus Videos manager still exist and
 * edit the same records.
 */

const HOMEPAGE = "__homepage__"

interface FormState {
  scope: string // HOMEPAGE or a department id (as string)
  title: string
  youtubeUrl: string
  badgeLabel: string
  isActive: boolean
}

const emptyForm: FormState = { scope: HOMEPAGE, title: "", youtubeUrl: "", badgeLabel: "", isActive: true }

function VideosManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<CampusVideo[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [editing, setEditing] = useState<CampusVideo | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [scopeFilter, setScopeFilter] = useState<string>("")

  async function refresh() {
    try {
      setItems(await getCampusVideosAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load videos")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const [all, depts] = await Promise.all([getCampusVideosAdmin(true), getDepartmentsAdmin()])
        if (!cancelled) {
          setItems(all)
          setDepartments(depts.filter((d) => d.isActive))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load videos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  const scopeLabel = useMemo(() => {
    const map = new Map(departments.map((d) => [d.id, d.shortName || d.name]))
    return (departmentId: number | null) => (departmentId === null ? "Homepage" : map.get(departmentId) ?? "Department")
  }, [departments])

  const scopeOptions = useMemo(
    () => [
      { value: HOMEPAGE, label: "Homepage (general Campus Videos)" },
      ...departments.map((d) => ({ value: String(d.id), label: `${d.shortName || d.name} department` })),
    ],
    [departments],
  )

  const visible = useMemo(() => {
    if (!scopeFilter) return items
    if (scopeFilter === HOMEPAGE) return items.filter((v) => v.departmentId === null)
    return items.filter((v) => String(v.departmentId) === scopeFilter)
  }, [items, scopeFilter])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: CampusVideo) {
    setEditing(item)
    setCreating(false)
    setForm({
      scope: item.departmentId === null ? HOMEPAGE : String(item.departmentId),
      title: item.title,
      youtubeUrl: item.youtubeUrl,
      badgeLabel: item.badgeLabel ?? "",
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
    const departmentId = form.scope === HOMEPAGE ? undefined : Number(form.scope)
    try {
      if (editing) {
        await updateCampusVideo(editing.id, {
          title: form.title,
          youtubeUrl: form.youtubeUrl,
          badgeLabel: form.badgeLabel || undefined,
          departmentId,
          isActive: form.isActive,
          version: editing.version,
        })
      } else {
        await createCampusVideo({
          title: form.title,
          youtubeUrl: form.youtubeUrl,
          badgeLabel: form.badgeLabel || undefined,
          departmentId,
          isActive: form.isActive,
        })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save video")
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
      setError(err instanceof ApiError ? err.message : "Failed to delete video")
    }
  }

  async function handleRestore(item: CampusVideo) {
    try {
      await restoreCampusVideo(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore video")
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
  const liveItems = visible.filter((i) => i.deletedAt === null)
  const deletedItems = visible.filter((i) => i.deletedAt !== null)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Videos
          </h1>
          <p className="text-sm text-slate-500">
            YouTube videos for the homepage and each department, all in one place.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-admin-primary to-admin-primary-light px-4 py-2 text-sm font-semibold text-white shadow-md shadow-admin-primary/25 transition-all hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" /> Add video
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit video" : "New video"}</p>
          <SelectField label="Show on" value={form.scope} onChange={(v) => setForm({ ...form, scope: v })} options={scopeOptions} required />
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextField label="YouTube embed URL" value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} required placeholder="https://www.youtube.com/embed/..." />
          <TextField label="Badge label" value={form.badgeLabel} onChange={(v) => setForm({ ...form, badgeLabel: v })} placeholder="Department Tour" />
          <ToggleField label="Active (visible on the public site)" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.youtubeUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {departments.length > 0 && (
        <div className="max-w-xs">
          <SelectField
            label="Filter"
            value={scopeFilter}
            onChange={setScopeFilter}
            options={[
              { value: "", label: "All videos" },
              { value: HOMEPAGE, label: "Homepage only" },
              ...departments.map((d) => ({ value: String(d.id), label: `${d.shortName || d.name} department` })),
            ]}
          />
        </div>
      )}

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No videos yet"
        renderCard={(item) => (
          <div className="flex h-36 flex-col items-center justify-center gap-2 bg-admin-bg px-3 text-center">
            <PlayCircle className="h-8 w-8 text-admin-primary" />
            <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
            <span className="rounded bg-admin-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-admin-primary">
              {scopeLabel(item.departmentId)}
            </span>
          </div>
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

export default function VideosManager() {
  // Campus videos live under the homepage permission (same as the homepage
  // Campus Videos manager and the department Videos tab).
  return (
    <PermissionGate permission="homepage.view">
      <VideosManagerInner />
    </PermissionGate>
  )
}
