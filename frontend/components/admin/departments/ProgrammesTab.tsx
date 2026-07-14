"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import { TextField, NumberField, SelectField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getDepartmentProgrammesAdmin,
  createDepartmentProgramme,
  updateDepartmentProgramme,
  deleteDepartmentProgramme,
  restoreDepartmentProgramme,
  reorderDepartmentProgrammes,
  DepartmentProgramme,
  ProgrammeLevel,
} from "@/lib/department-programmes-api"

interface FormState {
  name: string
  level: ProgrammeLevel
  intake: number
  isActive: boolean
}

const emptyForm: FormState = { name: "", level: "UG", intake: NaN, isActive: true }

const LEVEL_OPTIONS: { value: ProgrammeLevel; label: string }[] = [
  { value: "UG", label: "Undergraduate" },
  { value: "PG", label: "Postgraduate" },
  { value: "PHD", label: "Ph.D." },
  { value: "DIPLOMA", label: "Diploma" },
]

export default function ProgrammesTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<DepartmentProgramme, FormState>
      title="Programmes"
      description="Drag to reorder. Degree programmes offered by this department."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={getDepartmentProgrammesAdmin}
      create={createDepartmentProgramme}
      update={updateDepartmentProgramme}
      del={deleteDepartmentProgramme}
      restore={restoreDepartmentProgramme}
      reorder={reorderDepartmentProgrammes}
      mapToForm={(item) => ({ name: item.name, level: item.level, intake: item.intake, isActive: item.isActive })}
      buildCreateDto={(form, departmentId) => ({ departmentId, ...form })}
      buildUpdateDto={(form) => ({ ...form })}
      isValid={(form) => !!form.name && !Number.isNaN(form.intake)}
      getName={(item) => item.name}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.name}</span>{" "}
          <span className="text-slate-500">
            · {LEVEL_OPTIONS.find((l) => l.value === item.level)?.label} · Intake {item.intake}
          </span>
        </p>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Programme name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="B.Tech - Computer Science & Engineering" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Level"
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v as ProgrammeLevel })}
              options={LEVEL_OPTIONS.map((l) => ({ value: l.value, label: l.label }))}
            />
            <NumberField label="Intake" value={form.intake} onChange={(v) => setForm({ ...form, intake: v })} required />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}
