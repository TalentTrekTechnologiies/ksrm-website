"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, RotateCcw, Star, BookOpen } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import FacultyAchievementsEditor from "@/components/admin/departments/FacultyAchievementsEditor"
import { TextField, TextAreaField, NumberField, SelectField, ToggleField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getFacultyAdmin,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  restoreFaculty,
  reorderFaculty,
  Faculty,
} from "@/lib/faculty-api"
import {
  getResearchAdmin,
  createResearch,
  updateResearch,
  deleteResearch,
  ResearchRecord,
} from "@/lib/research-api"

interface FormState {
  name: string
  designation: string
  qualification: string
  specialization: string
  experience: string
  email: string
  phone: string
  photoUrl: string
  mediaId: number | null
  isHod: boolean
  welcomeMessage: string
}

interface ResearchFormState {
  title: string
  authors: string
  journal: string
  year: number
  type: string
  doiOrLink: string
  attachmentUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  designation: "",
  qualification: "",
  specialization: "",
  experience: "",
  email: "",
  phone: "",
  photoUrl: "",
  mediaId: null,
  isHod: false,
  welcomeMessage: "",
}

const emptyResearchForm = (facultyName: string): ResearchFormState => ({
  title: "",
  authors: facultyName,
  journal: "",
  year: new Date().getFullYear(),
  type: "Publication",
  doiOrLink: "",
  attachmentUrl: "",
  mediaId: null,
  isActive: true,
})

const RESEARCH_TYPE_OPTIONS = [
  { value: "Publication", label: "Publication" },
  { value: "Project", label: "Project" },
  { value: "Patent", label: "Patent" },
]

/**
 * Faculty & HOD tab for one department. Faculty is a shared, institution-
 * wide directory (backend/src/faculty), scoped here by the real
 * `departmentId` FK. `department` (free-text label) is still sent alongside
 * it on every save so the public site's existing string-keyed lookups
 * (`GET /faculty?department=`, `GET /faculty/hod/:department`) keep
 * working unchanged. isHod marks the department's HOD, shown first with a
 * star badge.
 */
export default function FacultyTab({ departmentId, departmentName }: { departmentId: number; departmentName: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Faculty[]>([])
  const [editing, setEditing] = useState<Faculty | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await getFacultyAdmin(true, departmentId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load faculty")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getFacultyAdmin(true, departmentId)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load faculty")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [departmentId])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: Faculty) {
    setEditing(item)
    setCreating(false)
    setForm({
      name: item.name,
      designation: item.designation,
      qualification: item.qualification,
      specialization: item.specialization ?? "",
      experience: item.experience ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      photoUrl: item.photoUrl ?? "",
      mediaId: item.mediaId,
      isHod: item.isHod,
      welcomeMessage: item.welcomeMessage ?? "",
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
        name: form.name,
        designation: form.designation,
        qualification: form.qualification,
        department: departmentName,
        departmentId,
        specialization: form.specialization || undefined,
        experience: form.experience || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        photoUrl: form.photoUrl || undefined,
        mediaId: form.mediaId,
        isHod: form.isHod,
        welcomeMessage: form.welcomeMessage || undefined,
      }
      if (editing) {
        await updateFaculty(editing.id, { ...dto, version: editing.version })
      } else {
        await createFaculty(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save faculty")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Faculty) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.name}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteFaculty(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete faculty")
    }
  }

  async function handleRestore(item: Faculty) {
    try {
      await restoreFaculty(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore faculty")
    }
  }


  /**
   * Move one person up or down and persist the whole list's new order.
   * Buttons rather than drag-and-drop: this list is edited by staff on any
   * device, and arrows work on touch screens where dragging is fiddly.
   */
  /**
   * Saves the order produced by a drag. Applied locally first so the row stays
   * where it was dropped instead of snapping back while the request is in
   * flight; a failure re-reads the server's order rather than leaving the list
   * showing something that was never saved.
   */
  async function persistOrder(next: Faculty[]) {
    setItems((prev) => {
      const deleted = prev.filter((i) => i.deletedAt !== null)
      return [...next, ...deleted]
    })
    try {
      await reorderFaculty(next.map((item, i) => ({ id: item.id, sortOrder: i })))
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the new order")
      await refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating
  const liveItems = items.filter((i) => i.deletedAt === null).sort((a, b) => Number(b.isHod) - Number(a.isHod))
  const deletedItems = items.filter((i) => i.deletedAt !== null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Faculty & HOD</h2>
          <p className="text-sm text-slate-500">Mark one faculty member as HOD to show them on the HOD&apos;s Desk section.</p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add faculty
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
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit faculty" : "New faculty"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} required />
            <TextField label="Qualification" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} required />
            <TextField label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
            <TextField label="Experience" value={form.experience} onChange={(v) => setForm({ ...form, experience: v })} />
            <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <TextField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <MediaField
            label="Photo"
            url={form.photoUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, photoUrl: url, mediaId })}
            accept={["IMAGE"]}
          />
          <ToggleField label="This person is the Head of Department" checked={form.isHod} onChange={(v) => setForm({ ...form, isHod: v })} />
          {form.isHod && (
            <TextAreaField
              label="HOD's Message"
              value={form.welcomeMessage}
              onChange={(v) => setForm({ ...form, welcomeMessage: v })}
              rows={3}
              helperText="Shown on the department's HOD's Desk section."
            />
          )}
          {editing && (
            <FacultyResearchPanel
              faculty={editing}
              departmentId={departmentId}
              departmentName={departmentName}
            />
          )}
          {/* Only when editing: an achievement needs a saved faculty id to
              attach to, and these are appended over years rather than filled
              in at the moment someone is first added. */}
          {editing && (
            <div className="rounded-2xl border border-admin-border bg-admin-bg/40 p-4">
              <FacultyAchievementsEditor facultyId={editing.id} facultyName={editing.name} />
            </div>
          )}
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.designation}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {/* Drag to reorder by grabbing the handle. The arrow buttons that used
          to be the only way to move a row are gone - CmsDragList keeps
          keyboard reordering, so this is not a loss for anyone using one. */}
      <CmsDragList
        items={liveItems}
        onReorder={persistOrder}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyLabel="No faculty yet."
        renderRow={(item) => (
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-700">
              {item.isHod && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
              {item.name}
            </p>
            <p className="truncate text-xs text-slate-500">{item.designation} · {item.qualification}</p>
          </div>
        )}
      />

      {deletedItems.length > 0 && (
        <div className="border-t border-admin-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.name}</span>
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

function FacultyResearchPanel({
  faculty,
  departmentId,
  departmentName,
}: {
  faculty: Faculty
  departmentId: number
  departmentName: string
}) {
  const [items, setItems] = useState<ResearchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ResearchRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ResearchFormState>(emptyResearchForm(faculty.name))
  const { confirm, notifySaved } = useCmsConfirm()

  function belongsToFaculty(item: ResearchRecord) {
    return item.facultyId === faculty.id || item.authors.toLowerCase().includes(faculty.name.toLowerCase())
  }

  async function refresh() {
    const records = await getResearchAdmin(departmentId)
    setItems(records.filter(belongsToFaculty))
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const records = await getResearchAdmin(departmentId)
        if (!cancelled) setItems(records.filter(belongsToFaculty))
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load publications and patents")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [departmentId, faculty.id, faculty.name])

  function startCreateResearch() {
    setCreating(true)
    setEditing(null)
    setForm(emptyResearchForm(faculty.name))
  }

  function startEditResearch(item: ResearchRecord) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      authors: item.authors,
      journal: item.journal ?? "",
      year: item.year,
      type: item.type,
      doiOrLink: item.doiOrLink ?? "",
      attachmentUrl: item.attachmentUrl ?? "",
      mediaId: item.mediaId,
      isActive: item.isActive,
    })
  }

  function closeResearchForm() {
    setCreating(false)
    setEditing(null)
  }

  async function saveResearch() {
    if (!(await confirm({ title: "Save research record?", message: "Save this publication/patent under this faculty member?", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        authors: form.authors,
        journal: form.journal || undefined,
        year: form.year,
        type: form.type,
        doiOrLink: form.doiOrLink || undefined,
        attachmentUrl: form.attachmentUrl || undefined,
        mediaId: form.mediaId,
        isActive: form.isActive,
        department: departmentName,
        departmentId,
        facultyId: faculty.id,
      }
      if (editing) await updateResearch(editing.id, dto)
      else await createResearch(dto)
      closeResearchForm()
      await refresh()
      notifySaved("Research record saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save research record")
    } finally {
      setSaving(false)
    }
  }

  async function removeResearch(item: ResearchRecord) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? This cannot be undone.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteResearch(item.id)
      await refresh()
      notifySaved("Research record deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete research record")
    }
  }

  const isFormOpen = creating || editing !== null

  return (
    <section className="space-y-3 rounded-xl border border-admin-border bg-admin-bg/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <BookOpen className="h-4 w-4 text-admin-primary" /> Publications / Patents
          </p>
          <p className="text-xs text-slate-500">Add this faculty member's new publications, projects and patents here.</p>
        </div>
        {!isFormOpen && (
          <button type="button" onClick={startCreateResearch} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-admin-primary ring-1 ring-admin-border hover:bg-admin-bg">
            <Plus className="h-4 w-4" /> Add record
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {isFormOpen && (
        <div className="space-y-4 rounded-xl border border-admin-border bg-white p-4">
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Authors" value={form.authors} onChange={(v) => setForm({ ...form, authors: v })} required />
            <TextField label="Journal / Venue" value={form.journal} onChange={(v) => setForm({ ...form, journal: v })} />
            <NumberField label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} required />
            <SelectField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={RESEARCH_TYPE_OPTIONS} />
          </div>
          <TextField label="DOI / Link" value={form.doiOrLink} onChange={(v) => setForm({ ...form, doiOrLink: v })} />
          <MediaField label="Attachment (paper / patent PDF)" url={form.attachmentUrl} mediaId={form.mediaId} onChange={(url, mediaId) => setForm({ ...form, attachmentUrl: url, mediaId })} accept={["DOCUMENT"]} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={closeResearchForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={saveResearch} disabled={saving || !form.title || !form.authors}>
              {saving ? "Saving..." : "Save record"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-admin-primary" /></div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-admin-border bg-white p-4 text-center text-sm text-slate-400">No records linked to this faculty yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
                <p className="truncate text-xs text-slate-500">{item.type} - {item.year}{!item.isActive && <span className="ml-2 font-semibold text-amber-600">Inactive</span>}</p>
              </div>
              <button type="button" onClick={() => startEditResearch(item)} aria-label="Edit research record" className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-admin-primary">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeResearch(item)} aria-label="Delete research record" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
