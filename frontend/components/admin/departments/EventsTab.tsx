"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  restoreEvent,
  reorderEvents,
  EventItem,
} from "@/lib/events-api"

/**
 * A department's own events - a Student Chapter's talks, workshops and
 * competitions. Ordinary Events rows with this department set, so they also
 * appear (departmentId omitted) in the site-wide public Events listing -
 * nothing about a chapter event is a different kind of record.
 */
interface FormState {
  title: string
  eventDate: string
  location: string
  description: string
  imageUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  title: "",
  eventDate: "",
  location: "",
  description: "",
  imageUrl: "",
  mediaId: null,
  isActive: true,
}

export default function EventsTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<EventItem, FormState>
      title="Events"
      description="This department's own talks, workshops and competitions - shown in its Student Chapter section, and alongside every other event on the public Events page."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={(departmentId, includeDeleted) => getEventsAdmin(includeDeleted, departmentId)}
      create={createEvent}
      update={updateEvent}
      del={deleteEvent}
      restore={restoreEvent}
      reorder={async (items) => {
        // The endpoint validates and returns the site-wide list, not this
        // department's - re-fetch the scoped list for what this manager
        // actually needs to redraw.
        await reorderEvents(items)
        return getEventsAdmin(false, departmentId)
      }}
      mapToForm={(item) => ({
        title: item.title,
        eventDate: item.eventDate.slice(0, 10),
        location: item.location ?? "",
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",
        mediaId: item.mediaId,
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        title: form.title,
        eventDate: form.eventDate,
        location: form.location || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        title: form.title,
        eventDate: form.eventDate,
        location: form.location || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.title && !!form.eventDate}
      getName={(item) => item.title}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.title}</span>
          <span className="text-slate-500"> · {item.eventDate.slice(0, 10)}</span>
          {item.location && <span className="text-slate-500"> · {item.location}</span>}
        </p>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Event date"
              value={form.eventDate}
              onChange={(v) => setForm({ ...form, eventDate: v })}
              required
              placeholder="YYYY-MM-DD"
            />
            <TextField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          </div>
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
          />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            rows={3}
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}
