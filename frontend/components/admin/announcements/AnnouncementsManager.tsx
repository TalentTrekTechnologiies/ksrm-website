"use client"

import { useEffect, useState } from "react"
import { Plus, AlertTriangle, Pencil, Trash2, RotateCcw, Eye, EyeOff } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import {
  TextField,
  TextAreaField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { CmsPriorityBadge } from "@/components/admin/cms/CmsStatusBadge"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import { ApiError } from "@/lib/api-client"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  deleteAnnouncement,
  restoreAnnouncement,
  Announcement,
  AnnouncementPriority,
  AnnouncementLocation,
  ANNOUNCEMENT_LOCATIONS,
  ANNOUNCEMENT_PRIORITIES,
} from "@/lib/announcements-api"

interface FormState {
  title: string
  shortText: string
  description: string
  badge: string
  priority: AnnouncementPriority
  linkUrl: string
  openInNewTab: boolean
  startDate: string
  endDate: string
  isPublished: boolean
  sortOrder: number
  isActive: boolean
  locations: Set<AnnouncementLocation>
  departmentPageDepartmentId: number | "" // "" = all departments
}

const emptyForm: FormState = {
  title: "",
  shortText: "",
  description: "",
  badge: "",
  priority: "NORMAL",
  linkUrl: "",
  openInNewTab: false,
  startDate: "",
  endDate: "",
  isPublished: false,
  sortOrder: 0,
  isActive: true,
  locations: new Set(),
  departmentPageDepartmentId: "",
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 16)
}

function AnnouncementsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Announcement[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      const res = await getAnnouncementsAdmin({ includeDeleted: true, pageSize: 100 })
      setItems(res.items)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load announcements")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const [res, depts] = await Promise.all([
          getAnnouncementsAdmin({ includeDeleted: true, pageSize: 100 }),
          getDepartmentsAdmin(),
        ])
        if (!cancelled) {
          setItems(res.items)
          setDepartments(depts)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load announcements")
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

  function startEdit(item: Announcement) {
    setEditing(item)
    setCreating(false)
    const locations = new Set(item.placements.map((p) => p.location))
    const deptPlacement = item.placements.find((p) => p.location === "DEPARTMENT_PAGE")
    setForm({
      title: item.title,
      shortText: item.shortText ?? "",
      description: item.description ?? "",
      badge: item.badge ?? "",
      priority: item.priority,
      linkUrl: item.linkUrl ?? "",
      openInNewTab: item.openInNewTab,
      startDate: toDatetimeLocal(item.startDate),
      endDate: toDatetimeLocal(item.endDate),
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      locations,
      departmentPageDepartmentId: deptPlacement?.departmentId ?? "",
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  function toggleLocation(loc: AnnouncementLocation) {
    setForm((prev) => {
      const next = new Set(prev.locations)
      if (next.has(loc)) next.delete(loc)
      else next.add(loc)
      return { ...prev, locations: next }
    })
  }

  function buildPlacements() {
    return Array.from(form.locations).map((location) => ({
      location,
      ...(location === "DEPARTMENT_PAGE" && form.departmentPageDepartmentId !== ""
        ? { departmentId: Number(form.departmentPageDepartmentId) }
        : {}),
    }))
  }

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    if (form.locations.size === 0) {
      setError("Select at least one display location.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        shortText: form.shortText || undefined,
        description: form.description || undefined,
        badge: form.badge || undefined,
        priority: form.priority,
        linkUrl: form.linkUrl || undefined,
        openInNewTab: form.openInNewTab,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        isPublished: form.isPublished,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        placements: buildPlacements(),
      }
      if (editing) {
        await updateAnnouncement(editing.id, { ...dto, version: editing.version })
      } else {
        await createAnnouncement(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save announcement")
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(item: Announcement) {
    try {
      if (item.isPublished) await unpublishAnnouncement(item.id)
      else await publishAnnouncement(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update publish state")
    }
  }

  async function handleDelete(item: Announcement) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteAnnouncement(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete announcement")
    }
  }

  async function handleRestore(item: Announcement) {
    try {
      await restoreAnnouncement(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore announcement")
    }
  }

  if (loading) {
    return <CmsTableSkeleton />
  }

  const isFormOpen = editing !== null || creating
  const liveItems = items.filter((i) => i.deletedAt === null)
  const deletedItems = items.filter((i) => i.deletedAt !== null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
            Announcements
          </h1>
          <p className="text-sm text-slate-500">
            One centralized engine for every ticker/banner across the site - reusable across locations.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> New Announcement
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
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit announcement" : "New announcement"}</p>

          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={300} />
          <TextField
            label="Short text (for the ticker strip)"
            value={form.shortText}
            onChange={(v) => setForm({ ...form, shortText: v })}
            helperText="Falls back to the title if left blank."
            maxLength={160}
          />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField
              label="Priority"
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v as AnnouncementPriority })}
              options={ANNOUNCEMENT_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
            />
            <TextField label="Badge (optional)" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="NEW" maxLength={40} />
            <TextField
              label="Sort order"
              value={String(form.sortOrder)}
              onChange={(v) => setForm({ ...form, sortOrder: Number(v) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Link URL" value={form.linkUrl} onChange={(v) => setForm({ ...form, linkUrl: v })} placeholder="https://..." />
            <div className="flex items-end pb-2.5">
              <ToggleField label="Open link in new tab" checked={form.openInNewTab} onChange={(v) => setForm({ ...form, openInNewTab: v })} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start date (optional)</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-lg border border-admin-border bg-white px-3.5 py-2.5 text-sm focus:border-admin-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">End date (auto-expire, optional)</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-admin-border bg-white px-3.5 py-2.5 text-sm focus:border-admin-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Display locations *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ANNOUNCEMENT_LOCATIONS.map((loc) => (
                <label key={loc.value} className="flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.locations.has(loc.value)}
                    onChange={() => toggleLocation(loc.value)}
                    className="h-4 w-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                  />
                  {loc.label}
                </label>
              ))}
            </div>
            {form.locations.has("DEPARTMENT_PAGE") && (
              <div className="mt-3">
                <SelectField
                  label="Department (leave as 'All departments' to show everywhere)"
                  value={form.departmentPageDepartmentId === "" ? "" : String(form.departmentPageDepartmentId)}
                  onChange={(v) => setForm({ ...form, departmentPageDepartmentId: v === "" ? "" : Number(v) })}
                  options={[
                    { value: "", label: "All departments" },
                    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
                  ]}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <ToggleField label="Published" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
            <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>

          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {liveItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">
          No announcements yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Title</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Priority</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Locations</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Status</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {liveItems.map((item) => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-bg/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-2.5">
                      <CmsPriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {item.placements.map((p) => ANNOUNCEMENT_LOCATIONS.find((l) => l.value === p.location)?.label).join(", ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                          item.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {item.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(item)} aria-label="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-admin-primary">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deletedItems.length > 0 && (
        <div className="border-t border-admin-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.title}</span>
                <button onClick={() => handleRestore(item)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
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

export default function AnnouncementsManager() {
  return (
    <PermissionGate permission="announcements.view">
      <AnnouncementsManagerInner />
    </PermissionGate>
  )
}
