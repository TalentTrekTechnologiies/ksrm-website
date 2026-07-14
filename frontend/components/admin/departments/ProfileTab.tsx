"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import { TextField, TextAreaField, NumberField, ToggleField, FormActions, PrimaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { updateDepartment, Department } from "@/lib/departments-api"

export default function ProfileTab({
  department,
  onSaved,
}: {
  department: Department
  onSaved: (updated: Department) => void
}) {
  const [form, setForm] = useState({
    name: department.name,
    shortName: department.shortName ?? "",
    tagline: department.tagline ?? "",
    about: department.about,
    heroImageUrl: department.heroImageUrl ?? "",
    heroMediaId: department.heroMediaId,
    vision: department.vision ?? "",
    mission: department.mission,
    establishedYear: department.establishedYear ?? NaN,
    isActive: department.isActive,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateDepartment(department.id, {
        name: form.name,
        shortName: form.shortName || undefined,
        tagline: form.tagline || undefined,
        about: form.about,
        heroImageUrl: form.heroImageUrl || undefined,
        heroMediaId: form.heroMediaId,
        vision: form.vision || undefined,
        mission: form.mission,
        establishedYear: Number.isNaN(form.establishedYear) ? undefined : form.establishedYear,
        isActive: form.isActive,
        version: department.version,
      })
      onSaved(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save department profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">About / Vision / Mission</h2>
        <p className="text-sm text-slate-500">General Information for this department's public page.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved.
        </p>
      )}

      <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name" value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setSaved(false) }} required />
          <TextField label="Short name" value={form.shortName} onChange={(v) => { setForm({ ...form, shortName: v }); setSaved(false) }} />
          <TextField label="Tagline" value={form.tagline} onChange={(v) => { setForm({ ...form, tagline: v }); setSaved(false) }} />
          <NumberField label="Established year" value={form.establishedYear} onChange={(v) => { setForm({ ...form, establishedYear: v }); setSaved(false) }} />
        </div>
        <TextAreaField label="About" value={form.about} onChange={(v) => { setForm({ ...form, about: v }); setSaved(false) }} required rows={5} />
        <MediaField
          label="Hero Image"
          url={form.heroImageUrl}
          mediaId={form.heroMediaId}
          onChange={(url, mediaId) => { setForm({ ...form, heroImageUrl: url, heroMediaId: mediaId }); setSaved(false) }}
          accept={["IMAGE"]}
        />
        <TextAreaField label="Vision" value={form.vision} onChange={(v) => { setForm({ ...form, vision: v }); setSaved(false) }} rows={2} />
        <CmsChipList
          label="Mission points"
          items={form.mission}
          onChange={(mission) => { setForm({ ...form, mission }); setSaved(false) }}
          placeholder="Add a mission point..."
        />
        <ToggleField label="Active" checked={form.isActive} onChange={(v) => { setForm({ ...form, isActive: v }); setSaved(false) }} />
        <FormActions>
          <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.about}>
            {saving ? "Saving..." : "Save"}
          </PrimaryButton>
        </FormActions>
      </div>
    </div>
  )
}
