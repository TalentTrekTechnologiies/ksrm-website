"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import MediaField from "@/components/admin/cms/MediaField"
import FacultyTab from "@/components/admin/departments/FacultyTab"
import { getDepartmentsAdmin } from "@/lib/departments-api"
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
  academicYear: string
  /** Media Library id of the picked file. Local only - ExamNotification stores
   * just the URL (no mediaId column), so this drives the picker's preview and
   * is not persisted. */
  mediaId: number | null
  startDate: string
  endDate: string
  isActive: boolean
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Current academic year label, e.g. "AY 2026-27". The academic year is taken to
 * start in June, so Jan-May still belongs to the year that began the previous
 * June. New notifications default to this, and it rolls over on its own - so
 * next year's uploads land under "AY 2027-28" and this year's collect below it
 * on the public page.
 */
function currentAcademicYear() {
  const now = new Date()
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1
  return `AY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`
}

const emptyForm: FormState = {
  title: "",
  description: "",
  buttonText: "",
  buttonUrl: "",
  academicYear: currentAcademicYear(),
  mediaId: null,
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
  const { confirm, notifySaved } = useCmsConfirm()
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
      academicYear: item.academicYear ?? currentAcademicYear(),
      mediaId: null,
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
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        description: form.description || undefined,
        buttonText: form.buttonText || undefined,
        buttonUrl: form.buttonUrl || undefined,
        academicYear: form.academicYear || undefined,
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
      notifySaved("Your changes have been saved.")
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
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? This cannot be undone.`, confirmLabel: "Delete", destructive: true }))) return
    setError(null)
    try {
      await deleteExamNotification(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
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
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit notification" : "New notification"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={200} placeholder="B.Tech VI Sem Hall Tickets Released" />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} maxLength={500} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Button text" value={form.buttonText} onChange={(v) => setForm({ ...form, buttonText: v })} placeholder="Download Hall Ticket" />
            <TextField
              label="Academic year"
              value={form.academicYear}
              onChange={(v) => setForm({ ...form, academicYear: v })}
              placeholder="AY 2026-27"
              helperText="Groups this notification on the public page. Defaults to the current year; change it to start a new one."
            />
          </div>
          {/* Two equally-valid paths here: upload/pick a file (drag & drop in
              the picker) for hall tickets/timetables, OR paste an external link
              for results hosted on the university portal - hence the explicit
              "or paste a link" wording and the external-URL placeholder. */}
          <MediaField
            label="File or link (hall ticket / timetable / results)"
            url={form.buttonUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, buttonUrl: url, mediaId })}
            accept={["DOCUMENT"]}
            urlPlaceholder="https://results.jntua.ac.in/... or /downloads/hall-ticket.pdf"
          />
          <p className="-mt-2 text-xs text-slate-500">
            Upload a file above (drag &amp; drop works), or open{" "}
            <span className="font-medium">&ldquo;Or paste a URL directly&rdquo;</span> to link an external results page.
          </p>
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
              className="flex flex-col rounded-2xl border border-admin-border bg-white p-4"
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

/**
 * Everything examinations-related in one place: the notifications themselves,
 * and the Examination Section's staff.
 *
 * The staff are Faculty records belonging to an "Examination Section"
 * department (created inactive, so it never shows on the public departments
 * page), which lets this tab reuse the department FacultyTab wholesale - photos,
 * ordering, HOD/Controller flag and all - instead of duplicating that UI here.
 */
function ExamStaffTab() {
  const [dept, setDept] = useState<{ id: number; name: string } | null | undefined>(undefined)

  useEffect(() => {
    getDepartmentsAdmin()
      .then((all) => setDept(all.find((d) => d.slug === "examination-section") ?? null))
      .catch(() => setDept(null))
  }, [])

  if (dept === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }
  if (dept === null) {
    return (
      <p className="rounded-xl border border-dashed border-admin-border p-8 text-center text-sm text-slate-500">
        The &ldquo;Examination Section&rdquo; department record is missing, so its staff cannot be loaded.
        Ask your technical team to re-run the database seed.
      </p>
    )
  }
  return <FacultyTab departmentId={dept.id} departmentName={dept.name} />
}

export default function ExamNotificationsManager() {
  const [tab, setTab] = useState<"notifications" | "staff">("notifications")
  const tabClass = (on: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
      on ? "bg-admin-primary text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-admin-bg"
    }`

  return (
    <PermissionGate permission="exam_notifications.view">
      <div className="space-y-5">
        <div className="flex gap-2">
          <button type="button" className={tabClass(tab === "notifications")} onClick={() => setTab("notifications")}>
            Notifications
          </button>
          <button type="button" className={tabClass(tab === "staff")} onClick={() => setTab("staff")}>
            Examination Section Staff
          </button>
        </div>
        {tab === "notifications" ? <ExamNotificationsManagerInner /> : <ExamStaffTab />}
      </div>
    </PermissionGate>
  )
}
