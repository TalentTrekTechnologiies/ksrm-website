"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import StyleControls from "@/components/admin/cms/StyleControls"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
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
  getEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  restoreEvent,
  EventItem,
} from "@/lib/events-api"

interface FormState {
  title: string
  description: string
  eventDate: string
  location: string
  imageUrl: string
  mediaId: number | null
  category: string
  isActive: boolean
  videoUrl: string
  videoMediaId: number | null
  documentUrl: string
  documentMediaId: number | null

}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm: FormState = {
  title: "",
  description: "",
  eventDate: todayIso(),
  location: "",
  imageUrl: "",
  mediaId: null,
  category: "",
  isActive: true,
  videoUrl: "",
  videoMediaId: null,
  documentUrl: "",
  documentMediaId: null,

}

function EventsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<EventItem[]>([])
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getEventsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load events")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getEventsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load events")
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

  function startEdit(item: EventItem) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      description: item.description ?? "",
      eventDate: item.eventDate.slice(0, 10),
      location: item.location ?? "",
      imageUrl: item.imageUrl ?? "",
      videoUrl: item.videoUrl ?? "",
      videoMediaId: item.videoMediaId,
      documentUrl: item.documentUrl ?? "",
      documentMediaId: item.documentMediaId,
      mediaId: item.mediaId,
      category: item.category ?? "",
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
        description: form.description || null,
        eventDate: form.eventDate,
        location: form.location || null,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        videoMediaId: form.videoMediaId,
        documentUrl: form.documentUrl || null,
        documentMediaId: form.documentMediaId,
        mediaId: form.mediaId,
        category: form.category || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateEvent(editing.id, { ...dto, version: editing.version })
      } else {
        await createEvent(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save event")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: EventItem) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteEvent(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete event")
    }
  }

  async function handleRestore(item: EventItem) {
    try {
      await restoreEvent(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore event")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<EventItem>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[220px] truncate font-medium text-slate-800">{row.original.title}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    {
      id: "date",
      header: "Event Date",
      cell: ({ row }) => new Date(row.original.eventDate).toLocaleDateString(),
    },
    { accessorKey: "location", header: "Location" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Active</span>
        ) : (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">Inactive</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <button type="button" onClick={() => handleRestore(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
            Restore
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => startEdit(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(row.original)} className="text-xs font-semibold text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ),
    },
  ]

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
          Events
        </h1>
        <p className="text-sm text-slate-500">Campus events calendar.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit event" : "New event"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={200} />
          {/* Size and colour for this event's title, on the public page. Saves
              itself rather than joining this form's payload - appearance is
              not part of the event record, so it stays out of its version
              check. See StyleControls. */}
          <StyleControls module="events" recordId={editing?.id ?? 0} field="title" label="Title appearance" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Event date" value={form.eventDate} onChange={(v) => setForm({ ...form, eventDate: v })} required placeholder="YYYY-MM-DD" />
            <TextField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/events/annual-day.jpg"
          />
          {/* Optional extras. News and events also cover newspaper clippings,
              interviews and recorded coverage, so each item can carry a video
              and a downloadable document as well as its image. */}
          <MediaField
            label="Video (optional)"
            url={form.videoUrl}
            mediaId={form.videoMediaId}
            onChange={(url, mediaId) => setForm({ ...form, videoUrl: url, videoMediaId: mediaId })}
            accept={["VIDEO"]}
          />
          <MediaField
            label="Document (optional)"
            url={form.documentUrl}
            mediaId={form.documentMediaId}
            onChange={(url, mediaId) => setForm({ ...form, documentUrl: url, documentMediaId: mediaId })}
            accept={["DOCUMENT"]}
          />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
          <StyleControls module="events" recordId={editing?.id ?? 0} field="description" label="Description appearance" />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.eventDate}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search events..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add event
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No events yet" emptyDescription="Add your first event." pageSize={15} />
    </div>
  )
}

export default function EventsManager() {
  return (
    <PermissionGate permission="events.view">
      <EventsManagerInner />
    </PermissionGate>
  )
}
