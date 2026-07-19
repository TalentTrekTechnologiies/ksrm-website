"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, Star } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import SectionVisibilityToggle from "@/components/admin/cms/SectionVisibilityToggle"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  restoreTestimonial,
  Testimonial,
} from "@/lib/homepage-api"

interface FormState {
  name: string
  role: string
  company: string
  quote: string
  rating: number
  photoUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = { name: "", role: "", company: "", quote: "", rating: 5, photoUrl: "", mediaId: null, isActive: true }

function TestimonialsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Testimonial[]>([])
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getTestimonialsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load testimonials")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getTestimonialsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load testimonials")
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

  function startEdit(item: Testimonial) {
    setEditing(item)
    setCreating(false)
    setForm({
      name: item.name,
      role: item.role,
      company: item.company ?? "",
      quote: item.quote,
      rating: item.rating,
      photoUrl: item.photoUrl ?? "",
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
        name: form.name,
        role: form.role,
        company: form.company || undefined,
        quote: form.quote,
        rating: form.rating,
        photoUrl: form.photoUrl || undefined,
        mediaId: form.mediaId,
        isActive: form.isActive,
      }
      if (editing) {
        await updateTestimonial(editing.id, { ...dto, version: editing.version })
      } else {
        await createTestimonial(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save testimonial")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Testimonial) {
    if (!(await confirm({ title: "Delete", message: `Delete the testimonial from "${item.name}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteTestimonial(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete testimonial")
    }
  }

  async function handleRestore(item: Testimonial) {
    try {
      await restoreTestimonial(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore testimonial")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.role.toLowerCase().includes(q) ||
        (i.company ?? "").toLowerCase().includes(q) ||
        i.quote.toLowerCase().includes(q),
    )
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
            Testimonials
          </h1>
          <p className="text-sm text-slate-500">Student success stories shown on the homepage.</p>
        </div>
        <SectionVisibilityToggle sectionKey="testimonials" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit testimonial" : "New testimonial"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required maxLength={100} />
            <TextField label="Designation / Degree" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required maxLength={100} placeholder="B.Tech CSE 2023" />
            <TextField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} maxLength={100} />
            <NumberField label="Rating (1-5)" value={form.rating} onChange={(v) => setForm({ ...form, rating: Math.max(1, Math.min(5, v || 1)) })} required />
          </div>
          <TextAreaField label="Quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} required rows={3} maxLength={600} />
          <MediaField
            label="Photo"
            url={form.photoUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, photoUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/testimonials/rahul.jpg"
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.role || !form.quote}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search testimonials..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add testimonial
          </button>
        }
      />

      <CmsCardGrid
        items={liveItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyTitle="No testimonials yet"
        emptyDescription="Add your first student testimonial."
        renderCard={(item) => (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt={item.name} className="h-11 w-11 rounded-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-admin-primary text-sm font-bold text-white">
                  {item.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
              )}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
            </div>
            <p className="mb-3 line-clamp-3 text-sm italic text-slate-600">&ldquo;{item.quote}&rdquo;</p>
            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
            <p className="text-xs text-slate-500">{item.role}{item.company ? ` · ${item.company}` : ""}</p>
          </div>
        )}
      />

      {deletedItems.length > 0 && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{item.name} — {item.role}</span>
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

export default function TestimonialsManager() {
  return (
    <PermissionGate permission="homepage.view">
      <TestimonialsManagerInner />
    </PermissionGate>
  )
}
