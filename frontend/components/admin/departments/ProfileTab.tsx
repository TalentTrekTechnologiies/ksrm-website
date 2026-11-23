"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import CmsDynamicList from "@/components/admin/cms/CmsDynamicList"
import { TextField, TextAreaField, NumberField, ToggleField, FormActions, PrimaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { updateDepartment, Department, isAcademicDepartment } from "@/lib/departments-api"

/**
 * Academic departments publish three mission points (M1-M3). Offices such as
 * the Central Library and the Examination Section have none - requiring three
 * there blocked every save of their Overview tab, About text and photo
 * included.
 */
const ACADEMIC_MISSION_POINTS = 3

export default function ProfileTab({
  department,
  onSaved,
}: {
  department: Department
  onSaved: (updated: Department) => void
}) {
  const MIN_MISSION_POINTS = isAcademicDepartment(department) ? ACADEMIC_MISSION_POINTS : 0
  const [form, setForm] = useState({
    name: department.name,
    shortName: department.shortName ?? "",
    tagline: department.tagline ?? "",
    about: department.about,
    aboutVideoUrl: department.aboutVideoUrl ?? "",
    heroImageUrl: department.heroImageUrl ?? "",
    heroMediaId: department.heroMediaId,
    vision: department.vision ?? "",
    mission: [
      ...department.mission,
      ...Array.from(
        { length: Math.max(0, MIN_MISSION_POINTS - department.mission.length) },
        () => "",
      ),
    ],
    establishedYear: department.establishedYear ?? NaN,
    isActive: department.isActive,
    // SEO overrides. These columns and their API have existed since the
    // department module was built, but nothing ever wrote them (no field here)
    // and nothing read them - so they were dead storage. Blank means "use the
    // page's own heading and intro", which is what every department does today.
    metaTitle: department.metaTitle ?? "",
    metaDescription: department.metaDescription ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    const mission = form.mission.map((point) => point.trim()).filter(Boolean)
    if (mission.length < MIN_MISSION_POINTS) {
      setError(`Enter all ${MIN_MISSION_POINTS} mission points before saving.`)
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateDepartment(department.id, {
        name: form.name,
        shortName: form.shortName || null,
        tagline: form.tagline || null,
        about: form.about,
        aboutVideoUrl: form.aboutVideoUrl || null,
        heroImageUrl: form.heroImageUrl || null,
        heroMediaId: form.heroMediaId,
        vision: form.vision || null,
        mission,
        establishedYear: Number.isNaN(form.establishedYear) ? undefined : form.establishedYear,
        isActive: form.isActive,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
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
        <p className="text-sm text-slate-500">General Information for this department&rsquo;s public page.</p>
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

      <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name" value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setSaved(false) }} required />
          <TextField label="Short name" value={form.shortName} onChange={(v) => { setForm({ ...form, shortName: v }); setSaved(false) }} />
          <TextField label="Tagline" value={form.tagline} onChange={(v) => { setForm({ ...form, tagline: v }); setSaved(false) }} />
          <NumberField label="Established year" value={form.establishedYear} onChange={(v) => { setForm({ ...form, establishedYear: v }); setSaved(false) }} />
        </div>
        <TextAreaField label="About" value={form.about} onChange={(v) => { setForm({ ...form, about: v }); setSaved(false) }} required rows={5} />
        {/* Sits beside the About text on the public department page. Had no
            admin field before, so it could only be set in the database. */}
        <MediaField
          label="About video (optional)"
          url={form.aboutVideoUrl}
          mediaId={null}
          onChange={(url) => { setForm({ ...form, aboutVideoUrl: url }); setSaved(false) }}
          accept={["VIDEO"]}
        />
        <MediaField
          label="Hero Image"
          url={form.heroImageUrl}
          mediaId={form.heroMediaId}
          onChange={(url, mediaId) => { setForm({ ...form, heroImageUrl: url, heroMediaId: mediaId }); setSaved(false) }}
          accept={["IMAGE"]}
        />
        <TextAreaField label="Vision" value={form.vision} onChange={(v) => { setForm({ ...form, vision: v }); setSaved(false) }} rows={2} />
        {/* One text box per point, editable in place, with add / remove /
            reorder. This was a chip list, which can only add or remove - a
            point's wording could not be changed, which read as "the mission
            cannot be edited". */}
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-700">Mission points</p>
          <CmsDynamicList<string>
            items={form.mission}
            onChange={(mission) => { setForm((current) => ({ ...current, mission })); setSaved(false) }}
            newItem={() => ""}
            itemLabel="mission point"
            emptyTitle="No mission points yet"
            emptyDescription="Add the department's first mission point."
            minItems={MIN_MISSION_POINTS}
            renderItem={(item, i, update) => (
              <TextAreaField label={`Mission point ${i + 1}`} value={item} onChange={update} rows={2} />
            )}
          />
          {MIN_MISSION_POINTS > 0 && (
            <p className="mt-2 text-xs text-slate-500">Enter at least three mission points. All three are required to save.</p>
          )}
        </div>
        {/* Search-result appearance. Optional: left blank, the page falls back
            to the department name and its About text, which is what it has
            always used. */}
        <div className="rounded-xl border border-admin-border bg-admin-bg/40 p-4">
          <p className="text-sm font-semibold text-slate-800">Search result appearance (optional)</p>
          <p className="mb-3 text-xs text-slate-500">
            How this department appears in Google. Leave blank to use the department name and
            About text.
          </p>
          <TextField
            label="SEO title"
            value={form.metaTitle}
            onChange={(v) => { setForm({ ...form, metaTitle: v }); setSaved(false) }}
            placeholder={`${form.name} | K.S.R.M. College of Engineering`}
          />
          <TextAreaField
            label="SEO description"
            value={form.metaDescription}
            onChange={(v) => { setForm({ ...form, metaDescription: v }); setSaved(false) }}
            rows={2}
          />
          <p className="mt-1 text-xs text-slate-400">
            Around 155 characters shows in full; longer is trimmed by Google.
            {form.metaDescription ? ` Currently ${form.metaDescription.trim().length}.` : ""}
          </p>
        </div>

        <ToggleField label="Active" checked={form.isActive} onChange={(v) => { setForm({ ...form, isActive: v }); setSaved(false) }} />
        <FormActions>
          <PrimaryButton
            onClick={handleSave}
            disabled={saving || !form.name || !form.about || form.mission.filter((point) => point.trim()).length < MIN_MISSION_POINTS}
          >
            {saving ? "Saving..." : "Save"}
          </PrimaryButton>
        </FormActions>
      </div>
    </div>
  )
}
