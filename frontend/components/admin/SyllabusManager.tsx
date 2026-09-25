"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import {
  TextField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getSyllabusProgrammesAdmin,
  createSyllabusProgramme,
  updateSyllabusProgramme,
  deleteSyllabusProgramme,
  restoreSyllabusProgramme,
  createSyllabusRegulation,
  updateSyllabusRegulation,
  deleteSyllabusRegulation,
  SyllabusProgramme,
  SyllabusRegulation,
} from "@/lib/syllabus-api"
import type { ProgrammeLevel } from "@/lib/department-programmes-api"

/**
 * Academics -> Syllabus: the headings on the public Syllabus page and the
 * regulations under each.
 *
 * The page used to carry three headings written into its code, with their
 * regulations in a const array beside them - so renaming "B.Tech (UG)",
 * retiring R15 or adding the BCA approved for AY 2026-27 each needed a
 * developer and a deploy.
 *
 * Deliberately NOT under Page Content: this is the structure of an Academics
 * page, and it belongs with the programmes it describes.
 */

const LEVELS: { value: string; label: string }[] = [
  { value: "", label: "No branches - one syllabus for the whole course" },
  { value: "UG", label: "UG - undergraduate branches" },
  { value: "PG", label: "PG - postgraduate branches" },
  { value: "DIPLOMA", label: "Diploma branches" },
  { value: "PHD", label: "PhD branches" },
]

interface ProgrammeForm {
  name: string
  level: string
  nameContains: string
  description: string
  isActive: boolean
}

const emptyProgramme: ProgrammeForm = {
  name: "",
  level: "",
  nameContains: "",
  description: "",
  isActive: true,
}

interface RegulationForm {
  code: string
  label: string
  isActive: boolean
}

const emptyRegulation: RegulationForm = { code: "", label: "", isActive: true }

function RegulationRows({
  programme,
  onChanged,
  onError,
}: {
  programme: SyllabusProgramme
  onChanged: () => Promise<void>
  onError: (message: string) => void
}) {
  const { confirm, notifySaved } = useCmsConfirm()
  const [editing, setEditing] = useState<SyllabusRegulation | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<RegulationForm>(emptyRegulation)
  const [saving, setSaving] = useState(false)

  const live = programme.regulations.filter((r) => !r.deletedAt)
  const removed = programme.regulations.filter((r) => r.deletedAt)
  const isOpen = creating || editing !== null

  async function save() {
    setSaving(true)
    try {
      const payload = {
        code: form.code.trim(),
        label: form.label.trim() || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateSyllabusRegulation(editing.id, { ...payload, version: editing.version })
      } else {
        await createSyllabusRegulation(programme.id, payload)
      }
      setCreating(false)
      setEditing(null)
      await onChanged()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to save regulation")
    } finally {
      setSaving(false)
    }
  }

  async function remove(reg: SyllabusRegulation) {
    if (
      !(await confirm({
        title: "Delete regulation",
        message: `Delete "${reg.code}"? Its syllabus documents stay in the Media Library - only the heading goes. You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteSyllabusRegulation(reg.id)
      await onChanged()
      notifySaved("The regulation has been deleted.")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to delete regulation")
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-admin-border bg-admin-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Regulations
        </p>
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setCreating(true)
              setEditing(null)
              setForm(emptyRegulation)
            }}
            className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add regulation
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mb-3 space-y-3 rounded-lg border border-admin-border bg-white p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Code"
              value={form.code}
              onChange={(code) => setForm({ ...form, code })}
              required
              placeholder="R23"
            />
            <TextField
              label="Shown as"
              value={form.label}
              onChange={(label) => setForm({ ...form, label })}
              placeholder="R23 (Current)"
            />
          </div>
          <p className="text-xs text-slate-500">
            The code has to match the text in the uploaded filenames exactly -
            a document called &quot;Civil Engineering(R23) Syllabus&quot; is
            found by the code <span className="font-semibold">R23</span>. Leave
            &quot;Shown as&quot; blank to display the code itself.
          </p>
          <ToggleField
            label="Visible on the site"
            checked={form.isActive}
            onChange={(isActive) => setForm({ ...form, isActive })}
          />
          <FormActions>
            <SecondaryButton
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving || !form.code.trim()}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {live.length === 0 ? (
        <p className="text-xs text-slate-500">
          No regulations yet. Add R23, R20 and so on - each one becomes a group
          of documents under every branch.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {live.map((reg) => (
            <li
              key={reg.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                <span className="font-semibold text-slate-800">{reg.code}</span>
                {reg.label && <span className="ml-2 text-slate-500">{reg.label}</span>}
                {!reg.isActive && (
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    Hidden
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${reg.code}`}
                  onClick={() => {
                    setEditing(reg)
                    setCreating(false)
                    setForm({
                      code: reg.code,
                      label: reg.label ?? "",
                      isActive: reg.isActive,
                    })
                  }}
                  className="text-slate-400 hover:text-admin-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${reg.code}`}
                  onClick={() => remove(reg)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {removed.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          {removed.length} deleted regulation{removed.length === 1 ? "" : "s"} -
          restore from the programme&apos;s own Recently deleted list.
        </p>
      )}
    </div>
  )
}

function SyllabusManagerInner() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [programmes, setProgrammes] = useState<SyllabusProgramme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<SyllabusProgramme | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ProgrammeForm>(emptyProgramme)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setProgrammes(await getSyllabusProgrammesAdmin(true))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getSyllabusProgrammesAdmin(true)
        if (!cancelled) setProgrammes(rows)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load syllabus programmes")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        level: (form.level || null) as ProgrammeLevel | null,
        nameContains: form.nameContains.trim() || null,
        description: form.description.trim() || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateSyllabusProgramme(editing.id, { ...payload, version: editing.version })
      } else {
        await createSyllabusProgramme(payload)
      }
      setCreating(false)
      setEditing(null)
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save programme")
    } finally {
      setSaving(false)
    }
  }

  async function remove(programme: SyllabusProgramme) {
    if (
      !(await confirm({
        title: "Delete programme",
        message: `Delete "${programme.name}" and its regulations from the Syllabus page? The documents themselves are untouched. You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteSyllabusProgramme(programme.id)
      await refresh()
      notifySaved("The programme has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete programme")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const live = programmes.filter((p) => !p.deletedAt)
  const removed = programmes.filter((p) => p.deletedAt)
  const isFormOpen = creating || editing !== null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Academics — Syllabus</h2>
          <p className="text-sm text-slate-500">
            The headings on Academics &rarr; Syllabus and the regulations under each.
            Rename them, retire a regulation, or add a course - BCA, Diploma, anything
            new - without a deploy.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => {
              setCreating(true)
              setEditing(null)
              setForm(emptyProgramme)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add programme
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {live.length === 0 && !isFormOpen && (
        <p className="rounded-lg border border-dashed border-admin-border bg-admin-bg px-4 py-6 text-center text-sm text-slate-500">
          Nothing here yet, so the Syllabus page is showing the three headings it has
          always shown: B.Tech (UG), M.Tech (PG) and MBA. Add one here and the page
          switches to this list instead.
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-6">
          <p className="text-sm font-semibold text-slate-700">
            {editing ? `Edit ${editing.name}` : "New programme"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Heading"
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
              required
              placeholder="B.Tech (UG)"
            />
            <SelectField
              label="Branches to list"
              value={form.level}
              onChange={(level) => setForm({ ...form, level })}
              options={LEVELS}
            />
          </div>
          <TextField
            label="Only branches whose name contains"
            value={form.nameContains}
            onChange={(nameContains) => setForm({ ...form, nameContains })}
            placeholder="Leave blank for all of them"
          />
          <p className="text-xs text-slate-500">
            Branches come from the programme list above, so a branch added there appears
            here too. M.Tech and MBA are both PG, so each uses this box to take only its
            own - &quot;tech&quot; and &quot;mba&quot;. A course with no branches, like
            BCA, picks the first option in the dropdown and gets one card for the whole
            course.
          </p>
          <TextField
            label="Note under the heading"
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Optional"
          />
          <ToggleField
            label="Visible on the site"
            checked={form.isActive}
            onChange={(isActive) => setForm({ ...form, isActive })}
          />
          <FormActions>
            <SecondaryButton
              onClick={() => {
                setCreating(false)
                setEditing(null)
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {live.map((programme) => (
        <div
          key={programme.id}
          style={{ boxShadow: "var(--shadow-admin-card)" }}
          className="rounded-2xl border border-admin-border bg-white p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                {programme.name}
                {!programme.isActive && (
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">
                    Hidden
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {programme.level
                  ? `${programme.level} branches${programme.nameContains ? ` containing "${programme.nameContains}"` : ""}`
                  : "No branches - one card for the whole course"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={`Edit ${programme.name}`}
                onClick={() => {
                  setEditing(programme)
                  setCreating(false)
                  setForm({
                    name: programme.name,
                    level: programme.level ?? "",
                    nameContains: programme.nameContains ?? "",
                    description: programme.description ?? "",
                    isActive: programme.isActive,
                  })
                }}
                className="text-slate-400 hover:text-admin-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${programme.name}`}
                onClick={() => remove(programme)}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <RegulationRows
            programme={programme}
            onChanged={refresh}
            onError={setError}
          />
        </div>
      ))}

      {removed.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recently deleted
          </p>
          <ul className="space-y-1.5">
            {removed.map((programme) => (
              <li
                key={programme.id}
                className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm"
              >
                <span className="text-slate-500 line-through">{programme.name}</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await restoreSyllabusProgramme(programme.id)
                      await refresh()
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : "Failed to restore")
                    }
                  }}
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

export default function SyllabusManager() {
  return (
    <PermissionGate permission="syllabus_programmes.view">
      <SyllabusManagerInner />
    </PermissionGate>
  )
}
