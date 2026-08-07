"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Users, Calendar, Image as ImageIcon } from "lucide-react"
import { TextAreaField, FormActions, PrimaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { updateDepartment, Department } from "@/lib/departments-api"
import ChapterTab from "./ChapterTab"

/**
 * A department's Student Professional Chapter (e.g. CSE's CSI chapter).
 *
 * Four kinds of content make up a chapter, and each is edited where its own
 * kind already is - nothing here duplicates another screen:
 *
 *   About Us     a single text field, unique to this feature - edited here
 *   Committee    an ordinary committee (type "Student Chapter", this
 *                department) - edited in Admin -> Committees, linked from here
 *   Events       ordinary events scoped to this department - edited in
 *                Admin -> Events, linked from here
 *   Gallery      ordinary gallery images scoped to this department - edited
 *                in Admin -> Gallery, linked from here
 *   Documents    activity reports, certificates - the same manager the
 *                Professional Chapter tab already used, unchanged
 *
 * This mirrors the Board of Studies tab built the same way: the roster lives
 * in Committees with every other committee, the papers live in Documents with
 * every other document, and this screen is the one place that ties a
 * department's pieces together rather than rebuilding any of them.
 */
export default function StudentChapterTab({
  department,
  onSaved,
}: {
  department: Department
  onSaved: (updated: Department) => void
}) {
  const [about, setAbout] = useState(department.studentChapterAbout ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dirty = about !== (department.studentChapterAbout ?? "")

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateDepartment(department.id, {
        name: department.name,
        about: department.about,
        studentChapterAbout: about || null,
        version: department.version,
      })
      onSaved(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save the chapter's About text")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Student Chapter</h2>
        <p className="text-sm text-slate-500">
          This department&rsquo;s student professional chapter (e.g. CSE&rsquo;s CSI chapter), shown in its
          own section on the department&rsquo;s public page.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-admin-border bg-white p-5" style={{ boxShadow: "var(--shadow-admin-card)" }}>
        <p className="text-sm font-semibold text-slate-700">About Us</p>

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
        {saved && !dirty && (
          <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved.
          </p>
        )}

        <TextAreaField
          label="About this chapter"
          value={about}
          onChange={setAbout}
          rows={6}
          helperText="What the chapter is, when it started, who runs it. Shown at the top of the public section - leave blank to hide that part until it's written."
        />

        <FormActions>
          <PrimaryButton onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save"}
          </PrimaryButton>
        </FormActions>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/committees"
          className="flex items-center gap-3 rounded-2xl border border-admin-border bg-white p-4 hover:bg-admin-bg"
          style={{ boxShadow: "var(--shadow-admin-card)" }}
        >
          <Users className="h-5 w-5 shrink-0 text-admin-primary" />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Committee</span>
            <span className="block text-xs text-slate-500">
              Coordinators &amp; members — Admin → Committees, type &ldquo;Student Chapter&rdquo;, this department
            </span>
          </span>
        </Link>
        <Link
          href={`/admin/departments/workspace?id=${department.id}&tab=events`}
          className="flex items-center gap-3 rounded-2xl border border-admin-border bg-white p-4 hover:bg-admin-bg"
          style={{ boxShadow: "var(--shadow-admin-card)" }}
        >
          <Calendar className="h-5 w-5 shrink-0 text-admin-primary" />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Events</span>
            <span className="block text-xs text-slate-500">Talks, workshops, competitions</span>
          </span>
        </Link>
        <Link
          href={`/admin/departments/workspace?id=${department.id}&tab=gallery`}
          className="flex items-center gap-3 rounded-2xl border border-admin-border bg-white p-4 hover:bg-admin-bg"
          style={{ boxShadow: "var(--shadow-admin-card)" }}
        >
          <ImageIcon className="h-5 w-5 shrink-0 text-admin-primary" />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Gallery</span>
            <span className="block text-xs text-slate-500">Photos from chapter events</span>
          </span>
        </Link>
      </div>

      {/* Documents - the existing Professional Chapter manager, unchanged. */}
      <ChapterTab departmentId={department.id} />
    </div>
  )
}
