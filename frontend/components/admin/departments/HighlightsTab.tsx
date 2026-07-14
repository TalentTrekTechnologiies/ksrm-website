"use client"

import { useState } from "react"
import DepartmentDragListManager from "./DepartmentDragListManager"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getDepartmentHighlightsAdmin,
  createDepartmentHighlight,
  updateDepartmentHighlight,
  deleteDepartmentHighlight,
  restoreDepartmentHighlight,
  reorderDepartmentHighlights,
  DepartmentHighlight,
  DepartmentHighlightKind,
} from "@/lib/department-highlights-api"

interface FormState {
  title: string
  description: string
  imageUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = { title: "", description: "", imageUrl: "", mediaId: null, isActive: true }

const TABS: { kind: DepartmentHighlightKind; label: string }[] = [
  { kind: "HIGHLIGHT", label: "Highlights" },
  { kind: "ACHIEVEMENT", label: "Achievements" },
]

function KindManager({ departmentId, kind }: { departmentId: number; kind: DepartmentHighlightKind }) {
  return (
    <DepartmentDragListManager<DepartmentHighlight, FormState>
      title=""
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={(departmentId, includeDeleted) =>
        getDepartmentHighlightsAdmin(departmentId, includeDeleted).then((all) => all.filter((h) => h.kind === kind))
      }
      create={(dto) => createDepartmentHighlight({ ...dto, kind })}
      update={updateDepartmentHighlight}
      del={deleteDepartmentHighlight}
      restore={restoreDepartmentHighlight}
      reorder={reorderDepartmentHighlights}
      mapToForm={(item) => ({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl ?? "",
        mediaId: item.mediaId,
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.title && !!form.description}
      getName={(item) => item.title}
      addLabel={kind === "HIGHLIGHT" ? "Add highlight" : "Add achievement"}
      renderRow={(item) => (
        <div>
          <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
          <p className="truncate text-xs text-slate-500">{item.description}</p>
        </div>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required rows={2} />
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}

export default function HighlightsTab({ departmentId }: { departmentId: number }) {
  const [active, setActive] = useState<DepartmentHighlightKind>("HIGHLIGHT")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Highlights & Achievements</h2>
        <p className="text-sm text-slate-500">AI-enabled highlight promo cards and department achievements.</p>
      </div>
      <div className="flex gap-1 border-b border-admin-border">
        {TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            onClick={() => setActive(tab.kind)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              active === tab.kind
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <KindManager departmentId={departmentId} kind={active} />
    </div>
  )
}
