"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Plus, AlertTriangle, CheckCircle2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import { CmsListTimestamp } from "@/components/admin/cms/CmsRecordMeta"
import MediaField from "@/components/admin/cms/MediaField"
import FacultyTab from "@/components/admin/departments/FacultyTab"
import BulkDocumentUpload from "@/components/admin/BulkDocumentUpload"
import PageTextEditor from "@/components/admin/PageTextEditor"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import { getDownloadsAdmin, reorderDownloads, type Download } from "@/lib/downloads-api"
import { getDepartmentsAdmin } from "@/lib/departments-api"
import {
  TextField,
  TextAreaField,
  SelectField,
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
  ExamNotificationType,
  EXAM_TYPES,
  reorderExamNotifications,
} from "@/lib/exam-notifications-api"

interface FormState {
  type: ExamNotificationType
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
  type: "NOTIFICATION",
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
  /** Newly saved but still a draft - the list scrolls to it and prompts. */
  const [unpublishedId, setUnpublishedId] = useState<number | null>(null)
  const draftRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState("")

  // Brings the just-saved draft into view. Runs after `items` updates, so the
  // card exists by the time we scroll.
  //
  // Scrolls only - it deliberately does not clear the highlight here. Calling
  // setState inside an effect triggers a second render pass for every list
  // update; the highlight is cleared where it is actually resolved instead
  // (handleTogglePublish, and on the next save).
  useEffect(() => {
    if (unpublishedId == null) return
    draftRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [items, unpublishedId])

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
      type: item.type ?? "NOTIFICATION",
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
    // The old wording promised these "go live on the public site straight
    // away", which is the opposite of what happens: a notification saves as a
    // draft and needs publishing. Editing a live one does take effect at once.
    if (
      !(await confirm({
        title: "Save changes?",
        message: editing
          ? "Save your changes? If this notification is published, they appear on the site straight away."
          : "Save this notification? It is saved as a draft - you will need to publish it before it appears on the site.",
        confirmLabel: "Save",
      }))
    )
      return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        type: form.type,
        title: form.title,
        description: form.description || null,
        buttonText: form.buttonText || null,
        buttonUrl: form.buttonUrl || null,
        academicYear: form.academicYear || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        isActive: form.isActive,
      }
      // A new notification is created as a DRAFT (isPublished defaults to
      // false), so saving it does not put it on the site. That is easy to
      // miss - the form closes, the card appears, and nothing tells you the
      // public page is unchanged. Remember the new record so the list can
      // scroll to it and say so plainly.
      const saved = editing
        ? await updateExamNotification(editing.id, dto)
        : await createExamNotification(dto)

      cancelForm()
      await refresh()

      if (!saved.isPublished) {
        setUnpublishedId(saved.id)
        notifySaved("Saved as a draft - it is not on the website yet.")
      } else {
        setUnpublishedId(null)
        notifySaved("Your changes have been saved.")
      }
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
        // Publishing resolves the "not on the website yet" prompt, so the
        // highlight comes off here rather than in an effect.
        if (item.id === unpublishedId) setUnpublishedId(null)
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
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit entry" : "New entry"}</p>
          <SelectField
            label="Type"
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v as ExamNotificationType })}
            options={EXAM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            helperText="Decides which list this appears under on the Examinations page."
          />
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

      {items.length > 0 && <ExamNotificationOrder onSaved={refresh} />}

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
              ref={item.id === unpublishedId ? draftRef : undefined}
              style={{ boxShadow: "var(--shadow-admin-card)" }}
              className={`flex flex-col rounded-2xl border bg-white p-4 ${
                item.id === unpublishedId ? "border-amber-400 ring-2 ring-amber-200" : "border-admin-border"
              }`}
            >
              {/* Shown on the record just saved, while it is still a draft.
                  Saving does NOT publish - without this the form simply closes
                  and nothing indicates the public page is unchanged. */}
              {item.id === unpublishedId && !item.isPublished && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Saved, but not on the website yet.</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Publish now
                  </button>
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusBadge item={item} />
                  {/* When it was added or last edited - a list of notices is
                      scanned for recency, and without this every card looked
                      the same age. */}
                  <CmsListTimestamp createdAt={item.createdAt} updatedAt={item.updatedAt} />
                </span>
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
  /**
   * Why the lookup failed, kept apart from the result.
   *
   * Every failure used to collapse into `null` and report the department as
   * MISSING - so an admin without departments.view was told to have the
   * database reseeded, when the record was there all along and the request had
   * simply been refused. Two very different problems, two different messages.
   */
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    getDepartmentsAdmin()
      .then((all) => setDept(all.find((d) => d.slug === "examination-section") ?? null))
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) setDenied(true)
        setDept(null)
      })
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
        {denied
          ? "Your account cannot view staff records, so this list could not be loaded. Ask a super admin to update your role - it needs the Examination role's faculty permissions."
          : "The “Examination Section” department record is missing, so its staff cannot be loaded. Ask your technical team to re-run the database seed."}
      </p>
    )
  }
  return <FacultyTab departmentId={dept.id} departmentName={dept.name} />
}

// The examination sections of the public page, in the order they appear there.
// Results lead because that is the bulk job - a semester's results across every
// branch and year arrive as a folder of PDFs, not one at a time.
const EXAM_PAGE_SECTIONS = [
  { value: "examinations.results", label: "Exam Results" },
  { value: "examinations.timetables", label: "Time Tables" },
  { value: "examinations.notifications", label: "Notifications" },
  { value: "examinations.calendars", label: "Academic Calendars" },
  { value: "examinations.rules", label: "Rules & Regulations" },
  { value: "examinations", label: "Other Exam Documents" },
]

/**
 * Results and other examination documents.
 *
 * These are ordinary Documents routed to the examinations.* page sections -
 * the same records the Documents module manages - surfaced here because this
 * is where the examination staff actually look for them. Uploading is the bulk
 * flow by default: set the semester heading once, drop the PDFs, publish.
 */
function ExamResultsTab() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Examination Documents</p>
        <p className="text-sm text-slate-500">
          Every document on the Examinations page is uploaded here - results, time tables, academic
          calendars, notifications, and <strong>Rules &amp; Regulations</strong> (the student code of
          conduct). Pick the list it belongs to under &ldquo;Which list on the Examinations
          page&rdquo; below. Use the group heading for the semester or academic year (e.g.
          &ldquo;AY 2025-26&rdquo;) - the public page groups documents under it.
        </p>
      </div>

      {notice && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {notice}
        </p>
      )}

      <BulkDocumentUpload
        key={refreshKey}
        defaultCategory="QUESTION_PAPER"
        defaultPageSection="examinations.results"
        pageSectionOptions={EXAM_PAGE_SECTIONS}
        pageSectionLabel="Which list on the Examinations page"
        pageSectionHelper="Choose Rules & Regulations for the code of conduct; it appears at /examinations#rules."
        onCancel={() => setRefreshKey((k) => k + 1)}
        onDone={(count) => {
          setNotice(`Published ${count} document${count === 1 ? "" : "s"} to the Examinations page.`)
          setRefreshKey((k) => k + 1)
        }}
      />

      <ExamDocumentOrder key={`order-${refreshKey}`} />

      <p className="text-xs text-slate-500">
        Renaming and removing documents is done under{" "}
        <a href="/admin/downloads" className="font-semibold text-admin-primary hover:underline">
          Documents
        </a>
        .
      </p>
    </div>
  )
}

/**
 * Drag-and-drop priority ordering for the documents in one examinations
 * section, matching how Faculty is ordered.
 *
 * There was no way to order documents anywhere in the admin: the public page
 * sorts by sortOrder, but nothing ever set it, and the note here used to tell
 * admins that documents "can be reordered" under Documents - which was not
 * true, that screen has no reordering either. reorderDownloads() and its
 * PATCH /downloads/reorder endpoint already existed and were simply unused.
 *
 * Scoped to one section at a time on purpose: sortOrder is only meaningful
 * within the list a visitor actually sees, and these sections hold hundreds of
 * documents each - one flat list of 2,000 rows would be unusable.
 */
/**
 * Drag-to-reorder for exam notifications, one list at a time.
 *
 * Scoped per type because that is how the public page displays them - Latest
 * Notifications, Exam Results, Time Tables and so on are separate lists, so an
 * order that spanned all of them would be meaningless.
 *
 * Kept as its own panel rather than making the card grid above sortable: the
 * grid is a three-column layout, and dragging cards between columns reads as
 * a two-dimensional arrangement when the underlying order is a single list.
 */
function ExamNotificationOrder({ onSaved }: { onSaved: () => void | Promise<void> }) {
  const [type, setType] = useState<ExamNotificationType>("NOTIFICATION")

  return (
    <div className="space-y-3 rounded-xl border border-admin-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Display order</p>
          <p className="text-sm text-slate-500">
            Drag to choose which notice appears first on the Examinations page. Saved automatically.
          </p>
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ExamNotificationType)}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm"
          aria-label="Notification list to reorder"
        >
          {EXAM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.plural}
            </option>
          ))}
        </select>
      </div>
      {/* Keyed by type so switching lists remounts clean - see the note on
          ExamDocumentOrderList for why this is not done with a reset effect. */}
      <ExamNotificationOrderList key={type} type={type} onSaved={onSaved} />
    </div>
  )
}

function ExamNotificationOrderList({
  type,
  onSaved,
}: {
  type: ExamNotificationType
  onSaved: () => void | Promise<void>
}) {
  const [rows, setRows] = useState<ExamNotification[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getExamNotificationsAdmin(type)
      .then((list) => {
        if (!cancelled) setRows(list)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this list.")
      })
    return () => {
      cancelled = true
    }
  }, [type])

  const handleReorder = (next: ExamNotification[]) => {
    const previous = rows
    setRows(next)
    setSaving(true)
    setError(null)
    reorderExamNotifications(next.map((n, i) => ({ id: n.id, sortOrder: i })))
      .then(async () => {
        setSaving(false)
        // Refresh the card grid above so it reflects the new order too.
        await onSaved()
      })
      .catch(() => {
        setRows(previous)
        setSaving(false)
        setError("Could not save the new order. Nothing was changed.")
      })
  }

  return (
    <>
      {saving && <p className="text-xs text-slate-500">Saving order...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows === null ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <CmsDragList
          items={rows.map((r) => ({ ...r, deletedAt: null }))}
          onReorder={(next) => handleReorder(next)}
          emptyLabel="Nothing in this list yet."
          renderRow={(n) => (
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">{n.title}</span>
              <span className="text-xs text-slate-500">
                {n.academicYear ? `${n.academicYear} · ` : ""}
                {new Date(n.startDate).toLocaleDateString()}
                {n.isPublished ? "" : " · draft"}
              </span>
            </span>
          )}
        />
      )}
    </>
  )
}

function ExamDocumentOrder() {
  const [section, setSection] = useState(EXAM_PAGE_SECTIONS[0].value)

  return (
    <div className="space-y-3 rounded-xl border border-admin-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Display order</p>
          <p className="text-sm text-slate-500">
            Drag to set the order these appear in on the Examinations page. Saved automatically.
          </p>
        </div>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="rounded-lg border border-admin-border bg-white px-3 py-2 text-sm"
          aria-label="Section to reorder"
        >
          {EXAM_PAGE_SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {/* Keyed by section so switching remounts with a clean slate. The
          alternative - clearing state at the top of the effect - is a
          synchronous setState inside an effect, which triggers a second render
          pass for every section change. */}
      <ExamDocumentOrderList key={section} section={section} />
    </div>
  )
}

function ExamDocumentOrderList({ section }: { section: string }) {
  const [docs, setDocs] = useState<Download[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getDownloadsAdmin()
      .then((all) => {
        if (cancelled) return
        setDocs(
          all
            .filter((d) => d.pageSection === section && !d.deletedAt)
            .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
        )
      })
      .catch(() => {
        if (!cancelled) setError("Could not load documents for this section.")
      })
    return () => {
      cancelled = true
    }
  }, [section])

  const handleReorder = (next: Download[]) => {
    // Optimistic: the list is already in the new order on screen, so reflect
    // it immediately and reconcile if the save fails.
    const previous = docs
    setDocs(next)
    setSaving(true)
    setError(null)
    reorderDownloads(next.map((d, i) => ({ id: d.id, sortOrder: i })))
      .then(() => setSaving(false))
      .catch(() => {
        setDocs(previous)
        setSaving(false)
        setError("Could not save the new order. Nothing was changed.")
      })
  }

  return (
    <>
      {saving && <p className="text-xs text-slate-500">Saving order...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {docs === null ? (
        <p className="text-sm text-slate-500">Loading documents...</p>
      ) : (
        <CmsDragList
          items={docs}
          onReorder={handleReorder}
          emptyLabel="No documents in this section yet."
          renderRow={(d) => (
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">{d.title}</span>
              {d.groupLabel && <span className="text-xs text-slate-500">{d.groupLabel}</span>}
            </span>
          )}
        />
      )}
    </>
  )
}

export default function ExamNotificationsManager() {
  const [tab, setTab] = useState<"notifications" | "results" | "staff" | "text">("notifications")
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
          <button type="button" className={tabClass(tab === "results")} onClick={() => setTab("results")}>
            Results &amp; Documents
          </button>
          <button type="button" className={tabClass(tab === "staff")} onClick={() => setTab("staff")}>
            Examination Section Staff
          </button>
          <button type="button" className={tabClass(tab === "text")} onClick={() => setTab("text")}>
            Page Text
          </button>
        </div>
        {tab === "notifications" && <ExamNotificationsManagerInner />}
        {tab === "results" && <ExamResultsTab />}
        {tab === "staff" && <ExamStaffTab />}
        {/* The Examinations page's own wording - headings, intro paragraph,
            quick-link labels. It used to live under Page Content, which meant
            an examinations admin needed two screens and could see 50 pages
            that were not theirs. Same editor, moved to where the rest of the
            examinations content already is. */}
        {tab === "text" && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Examinations page wording</p>
              <p className="text-sm text-slate-500">
                Headings and intro text shown on the public Examinations page. Documents and
                notifications are managed in the other tabs.
              </p>
            </div>
            <PageTextEditor section="examinations" />
          </div>
        )}
      </div>
    </PermissionGate>
  )
}
