"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import { TextField, NumberField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getStatisticsAdmin,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  restoreStatistic,
  reorderStatistics,
  SiteStatistic,
} from "@/lib/homepage-api"

interface FormState {
  label: string
  value: number
  suffix: string
  isActive: boolean
}

const emptyForm: FormState = { label: "", value: NaN, suffix: "", isActive: true }

export default function StatisticsTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<SiteStatistic, FormState>
      title="Department Statistics"
      description="Drag to reorder. E.g. Faculty Count, Labs, Placement %, NBA Status."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={(departmentId, includeDeleted) => getStatisticsAdmin("department", includeDeleted, departmentId)}
      create={createStatistic}
      update={updateStatistic}
      del={deleteStatistic}
      restore={restoreStatistic}
      reorder={(items) => reorderStatistics("department", items, departmentId)}
      mapToForm={(item) => ({ label: item.label, value: item.value, suffix: item.suffix ?? "", isActive: item.isActive })}
      buildCreateDto={(form, departmentId) => ({
        scope: "department",
        departmentId,
        label: form.label,
        value: form.value,
        suffix: form.suffix || undefined,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        label: form.label,
        value: form.value,
        suffix: form.suffix || undefined,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.label && !Number.isNaN(form.value)}
      getName={(item) => `${item.value}${item.suffix ?? ""} ${item.label}`}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.value}{item.suffix}</span>{" "}
          <span className="text-slate-500">{item.label}</span>
        </p>
      )}
      renderFields={(form, setForm) => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} required />
          <NumberField label="Value" value={form.value} onChange={(v) => setForm({ ...form, value: v })} required />
          <TextField label="Suffix" value={form.suffix} onChange={(v) => setForm({ ...form, suffix: v })} placeholder="+  %" />
          <div className="sm:col-span-3">
            <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
        </div>
      )}
    />
  )
}
