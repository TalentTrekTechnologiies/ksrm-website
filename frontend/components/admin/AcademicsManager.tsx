"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import {
  TextField,
  NumberField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"
import {
  getDepartmentProgrammesAdmin,
  createDepartmentProgramme,
  updateDepartmentProgramme,
  deleteDepartmentProgramme,
  restoreDepartmentProgramme,
  DepartmentProgramme,
  ProgrammeLevel,
} from "@/lib/department-programmes-api"

/**
 * Academics - every programme the college offers, in one screen.
 *
 * The same records are editable inside each department's own Programmes tab;
 * this is the college-wide view, because these rows drive pages that are not
 * department-scoped at all: Academics -> Courses & Intake, and the UG / PG /
 * Diploma admissions tables. Editing a seat count in one place changes all of
 * them, so there is never a second list to keep in step.
 */

const LEVELS: { value: ProgrammeLevel; label: string }[] = [
  { value: "UG", label: "Undergraduate (B.Tech)" },
  { value: "PG", label: "Postgraduate (M.Tech / MBA)" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "PHD", label: "Ph.D." },
]

interface FormState {
  departmentId: number
  name: string
  level: ProgrammeLevel
  intake: number
  code: string
  accreditation: string
  isActive: boolean
}

const emptyForm = (departmentId: number): FormState => ({
  departmentId,
  name: "",
  level: "UG",
  intake: NaN,
  code: "",
  accreditation: "",
  isActive: true,
})

function AcademicsManagerInner() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [departments, setDepartments] = useState<Department[]>([])
  const [items, setItems] = useState<DepartmentProgramme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<ProgrammeLevel | "ALL">("ALL")
  const [editing, setEditing] = useState<DepartmentProgramme | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm(0))
  const [saving, setSaving] = useState(false)

  async function refresh(depts: Department[] = departments) {
    // No college-wide endpoint exists, so gather each department's list. A
    // single department failing must not blank the whole screen.
    const results = await Promise.allSettled(
      depts.map((d) => getDepartmentProgrammesAdmin(d.id, true)),
    )
    const rows: DepartmentProgramme[] = []
    for (const r of results) if (r.status === "fulfilled") rows.push(...r.value)
    setItems(rows)
    const failed = results.filter((r) => r.status === "rejected").length
    setError(failed ? `${failed} department(s) could not be loaded. Showing the rest.` : null)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const depts = await getDepartmentsAdmin(false)
        if (cancelled) return
        setDepartments(depts)
        await refresh(depts)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load programmes")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deptName = (id: number) => {
    const d = departments.find((x) => x.id === id)
    return d?.shortName || d?.name || `#${id}`
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm(departments[0]?.id ?? 0))
  }

  function startEdit(item: DepartmentProgramme) {
    setEditing(item)
    setCreating(false)
    setForm({
      departmentId: item.departmentId,
      name: item.name,
      level: item.level,
      intake: item.intake,
      code: item.code ?? "",
      accreditation: item.accreditation ?? "",
      isActive: item.isActive,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    if (!form.name.trim() || Number.isNaN(form.intake) || !form.departmentId) return
    if (
      !(await confirm({
        title: "Save changes?",
        message: "Save your changes? They go live on the public site straight away.",
        confirmLabel: "Save",
      }))
    )
      return
    setSaving(true)
    setError(null)
    try {
      // null rather than undefined, so clearing a code or accreditation
      // actually removes it instead of leaving the old value in place.
      const dto = {
        departmentId: form.departmentId,
        name: form.name.trim(),
        level: form.level,
        intake: form.intake,
        code: form.code.trim() || null,
        accreditation: form.accreditation.trim() || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateDepartmentProgramme(editing.id, { ...dto, version: editing.version })
      } else {
        await createDepartmentProgramme(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save programme")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: DepartmentProgramme) {
    if (
      !(await confirm({
        title: "Delete",
        message: `Delete "${item.name}"? You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteDepartmentProgramme(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete programme")
    }
  }

  async function handleRestore(item: DepartmentProgramme) {
    try {
      await restoreDepartmentProgramme(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore programme")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (i) =>
        (levelFilter === "ALL" || i.level === levelFilter) &&
        (!q ||
          i.name.toLowerCase().includes(q) ||
          (i.code ?? "").toLowerCase().includes(q) ||
          deptName(i.departmentId).toLowerCase().includes(q)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, levelFilter, departments])

  const live = filtered.filter((i) => !i.deletedAt)
  const removed = filtered.filter((i) => i.deletedAt)
  const isFormOpen = creating || editing !== null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Academics — Programmes</h1>
          <p className="text-sm text-slate-500">
            Every programme the college offers. These drive Academics → Courses &amp; Intake and the
            UG / PG / Diploma admissions tables, and each department&apos;s own page.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
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

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit programme" : "New programme"}</p>
          <TextField
            label="Programme name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
            placeholder="B.Tech - Computer Science & Engineering"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField
              label="Department"
              value={String(form.departmentId)}
              onChange={(v) => setForm({ ...form, departmentId: Number(v) })}
              options={departments.map((d) => ({ value: String(d.id), label: d.name }))}
            />
            <SelectField
              label="Level"
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v as ProgrammeLevel })}
              options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
            />
            <NumberField label="Intake (seats)" value={form.intake} onChange={(v) => setForm({ ...form, intake: v })} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Course code"
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v })}
              placeholder="05"
              helperText="Shown in the Code column. Blank falls back to the department's short name."
            />
            <TextField
              label="Accreditation"
              value={form.accreditation}
              onChange={(v) => setForm({ ...form, accreditation: v })}
              placeholder="NBA Accredited"
              helperText="Leave blank if this programme is not separately accredited."
            />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name.trim() || Number.isNaN(form.intake)}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search programme, code or department..."
      />

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...LEVELS.map((l) => l.value)] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevelFilter(lv as ProgrammeLevel | "ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              levelFilter === lv
                ? "bg-admin-primary text-white"
                : "border border-admin-border bg-white text-slate-700 hover:bg-admin-bg"
            }`}
          >
            {lv === "ALL" ? "All levels" : LEVELS.find((l) => l.value === lv)?.label}
          </button>
        ))}
      </div>

      {LEVELS.map((lv) => {
        const rows = live.filter((i) => i.level === lv.value)
        if (rows.length === 0) return null
        const total = rows.reduce((sum, r) => sum + (r.intake || 0), 0)
        return (
          <div key={lv.value}>
            <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {lv.label} — {rows.length} programme{rows.length === 1 ? "" : "s"}, {total} seats
            </p>
            <div className="overflow-x-auto rounded-xl border border-admin-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="bg-admin-bg/60 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Programme</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Intake</th>
                    <th className="px-3 py-2">Accreditation</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-admin-border">
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {r.name}
                        {!r.isActive && <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">Inactive</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{deptName(r.departmentId)}</td>
                      <td className="px-3 py-2 text-slate-600">{r.code || <span className="text-slate-400">{deptName(r.departmentId)}</span>}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{r.intake}</td>
                      <td className="px-3 py-2 text-slate-600">{r.accreditation || <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => startEdit(r)} aria-label="Edit" className="rounded p-1.5 text-slate-500 hover:bg-admin-bg hover:text-admin-primary">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(r)} aria-label="Delete" className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {live.length === 0 && (
        <p className="rounded-xl border border-dashed border-admin-border p-8 text-center text-sm text-slate-400">
          No programmes yet. Add one and it appears on Academics and the admissions tables straight away.
        </p>
      )}

      {removed.length > 0 && (
        <div>
          <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Recently deleted</p>
          <div className="overflow-hidden rounded-xl border border-admin-border">
            {removed.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-b border-admin-border bg-white px-3 py-2.5 last:border-b-0">
                <p className="truncate text-sm text-slate-500">
                  {r.name} <span className="text-slate-400">· {deptName(r.departmentId)}</span>
                </p>
                <button type="button" onClick={() => handleRestore(r)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AcademicsManager() {
  return (
    <PermissionGate permission="department_programmes.view">
      <AcademicsManagerInner />
    </PermissionGate>
  )
}
