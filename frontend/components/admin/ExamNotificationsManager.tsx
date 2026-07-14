"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import {
  TextField,
  TextAreaField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getExamNotificationsAdmin,
  createExamNotification,
  updateExamNotification,
  publishExamNotification,
  unpublishExamNotification,
  deleteExamNotification,
  ExamNotification,
} from "@/lib/exam-notifications-api"

interface FormState {
  title: string
  description: string
  buttonText: string
  buttonUrl: string
  startDate: string
  endDate: string
  isActive: boolean
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm: FormState = {
  title: "",
  description: "",
  buttonText: "",
  buttonUrl: "",
  startDate: todayIso(),
  endDate: "",
  isActive: true,
}

function isCurrentlyLive(item: ExamNotification): boolean {
  if (!item.isPublished || !item.isActive) return false
  const now = Date.now()
  if (new Date(item.startDate).getTime() > now) return false
  if (item.endDate && new Date(item.endDate).getTime() < now) return false
  return true
}

function StatusBadge({ item }: { item: ExamNotification }) {
  if (!item.isPublished) {
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-100">Draft</span>
  }
  if (!item.isActive) {
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">Inactive</span>
  }
  if (isCurrentlyLive(item)) {
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Live</span>
  }
  return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50">Scheduled</span>
}

function ExamNotificationsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ExamNotification[]>([])
  const [editing, setEditing] = useState<ExamNotification | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getExamNotificationsAdmin())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load exam notifications")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getExamNotificationsAdmin()
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load exam notifications")
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

  function startEdit(item: ExamNotification) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      description: item.description ?? "",
      buttonText: item.buttonText ?? "",
      buttonUrl: item.buttonUrl ?? "",
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
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
        title: form.title,
        description: form.description || undefined,
        buttonText: form.buttonText || undefined,
        buttonUrl: form.buttonUrl || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        isActive: form.isActive,
      }
      if (editing) {
        await updateExamNotification(editing.id, dto)
      } else {
        await createExamNotification(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save exam notification")
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(item: ExamNotification) {
    setError(null)
    try {
      if (item.isPublished) {
        await unpublishExamNotification(item.id)
      } else {
        await publishExamNotification(item.id)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update publish state")
    }
  }

  async function handleDelete(item: ExamNotification) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setError(null)
    try {
      await deleteExamNotification(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete exam notification")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q))
  }, [items, search])

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
          Exam Notifications
        </h1>
        <p className="text-sm text-slate-500">
          Publish important links - Hall Ticket, Results, Registration, Exam Schedule, Important Notice.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit notification" : "New notification"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={200} placeholder="B.Tech VI Sem Hall Tickets Released" />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} maxLength={500} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Button text" value={form.buttonText} onChange={(v) => setForm({ ...form, buttonText: v })} placeholder="Download Hall Ticket" />
            <TextField label="Button URL" value={form.buttonUrl} onChange={(v) => setForm({ ...form, buttonUrl: v })} placeholder="/downloads/hall-ticket.pdf" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Start date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} required placeholder="YYYY-MM-DD" />
            <TextField label="End date (optional)" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} placeholder="YYYY-MM-DD" />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.startDate}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notifications..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add notification
          </button>
        }
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-admin-border bg-admin-bg py-12 text-center">
          <p className="text-sm font-semibold text-slate-600">No exam notifications yet</p>
          <p className="text-xs text-slate-400">Add your first notice - Hall Ticket, Results, Registration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{ boxShadow: "var(--shadow-admin-card)" }}
              className="flex flex-col rounded-xl border border-admin-border bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <StatusBadge item={item} />
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item)}
                  className="text-xs font-semibold text-admin-primary hover:underline"
                >
                  {item.isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>}
              <p className="mt-2 text-[11px] text-slate-400">
                {new Date(item.startDate).toLocaleDateString()}
                {item.endDate ? ` – ${new Date(item.endDate).toLocaleDateString()}` : " (no end date)"}
              </p>
              <div className="mt-3 flex items-center gap-3 border-t border-admin-border pt-3">
                <button type="button" onClick={() => startEdit(item)} className="text-xs font-semibold text-admin-primary hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(item)} className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExamNotificationsManager() {
  return (
    <PermissionGate permission="exam_notifications.view">
      <ExamNotificationsManagerInner />
    </PermissionGate>
  )
}
