"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, RotateCcw, Star } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, ToggleField, FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getFacultyAdmin,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  restoreFaculty,
  Faculty,
} from "@/lib/faculty-api"

interface FormState {
  name: string
  designation: string
  qualification: string
  specialization: string
  experience: string
  email: string
  photoUrl: string
  mediaId: number | null
  isHod: boolean
  welcomeMessage: string
}

const emptyForm: FormState = {
  name: "",
  designation: "",
  qualification: "",
  specialization: "",
  experience: "",
  email: "",
  photoUrl: "",
  mediaId: null,
  isHod: false,
  welcomeMessage: "",
}

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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit faculty" : "New faculty"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} required />
            <TextField label="Qualification" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} required />
            <TextField label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
            <TextField label="Experience" value={form.experience} onChange={(v) => setForm({ ...form, experience: v })} />
            <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
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
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.designation}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {liveItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">No faculty yet.</p>
      ) : (
        <ul className="space-y-2">
          {liveItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-admin-border bg-white px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-700">
                  {item.isHod && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                  {item.name}
                </p>
                <p className="truncate text-xs text-slate-500">{item.designation} · {item.qualification}</p>
              </div>
              <button type="button" onClick={() => startEdit(item)} aria-label="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-admin-primary">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => handleDelete(item)} aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

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
