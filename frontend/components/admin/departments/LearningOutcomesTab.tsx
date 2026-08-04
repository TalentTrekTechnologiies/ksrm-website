"use client"

import { useState } from "react"
import DepartmentDragListManager from "./DepartmentDragListManager"
import { TextField, TextAreaField } from "@/components/admin/cms/CmsForm"
import {
  getLearningOutcomesAdmin,
  createLearningOutcome,
  updateLearningOutcome,
  deleteLearningOutcome,
  restoreLearningOutcome,
  reorderLearningOutcomes,
  LearningOutcome,
  OutcomeType,
} from "@/lib/learning-outcomes-api"

interface FormState {
  code: string
  title: string
  text: string
}

const emptyForm: FormState = { code: "", title: "", text: "" }

const TABS: { type: OutcomeType; label: string }[] = [
  { type: "PEO", label: "Program Educational Objectives (PEO)" },
  { type: "PO", label: "Program Outcomes (PO)" },
  { type: "PSO", label: "Program Specific Outcomes (PSO)" },
]

// Reorder scoping in the backend is per (departmentId, type) pair - each
// sub-tab below fetches and reorders only its own type, filtered client-side
// from the same full admin list so switching sub-tabs doesn't re-fetch.
function OutcomeTypeManager({ departmentId, type }: { departmentId: number; type: OutcomeType }) {
  return (
    <DepartmentDragListManager<LearningOutcome, FormState>
      title=""
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={(departmentId, includeDeleted) =>
        getLearningOutcomesAdmin(departmentId, includeDeleted).then((all) => all.filter((o) => o.type === type))
      }
      create={(dto) => createLearningOutcome({ ...dto, type })}
      update={updateLearningOutcome}
      del={deleteLearningOutcome}
      restore={restoreLearningOutcome}
      reorder={reorderLearningOutcomes}
      mapToForm={(item) => ({ code: item.code, title: item.title ?? "", text: item.text })}
      buildCreateDto={(form, departmentId) => ({ departmentId, code: form.code, title: form.title || null, text: form.text })}
      buildUpdateDto={(form) => ({ code: form.code, title: form.title || null, text: form.text })}
      isValid={(form) => !!form.code && !!form.text}
      getName={(item) => `${item.code}: ${item.text}`}
      addLabel={`Add ${type}`}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.code}</span>{" "}
          {item.title && <span className="font-medium text-slate-600">{item.title} — </span>}
          <span className="text-slate-500">{item.text}</span>
        </p>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required placeholder={`${type}1`} />
          <TextField label="Title (optional)" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <TextAreaField label="Text" value={form.text} onChange={(v) => setForm({ ...form, text: v })} required rows={3} />
        </>
      )}
    />
  )
}

export default function LearningOutcomesTab({ departmentId }: { departmentId: number }) {
  const [active, setActive] = useState<OutcomeType>("PEO")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">PEO / PO / PSO</h2>
        <p className="text-sm text-slate-500">Program Educational Objectives, Outcomes, and Specific Outcomes.</p>
      </div>
      <div className="flex gap-1 border-b border-admin-border">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActive(tab.type)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              active === tab.type
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.type}
          </button>
        ))}
      </div>
      <OutcomeTypeManager departmentId={departmentId} type={active} />
    </div>
  )
}
