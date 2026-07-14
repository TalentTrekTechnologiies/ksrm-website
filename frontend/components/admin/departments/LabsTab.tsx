"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import MediaField from "@/components/admin/cms/MediaField"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import { TextField, TextAreaField, NumberField, ToggleField } from "@/components/admin/cms/CmsForm"
import { getLabsAdmin, createLab, updateLab, deleteLab, restoreLab, reorderLabs, Lab } from "@/lib/labs-api"

interface FormState {
  name: string
  description: string
  imageUrl: string
  mediaId: number | null
  capacity: number
  equipment: string[]
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  description: "",
  imageUrl: "",
  mediaId: null,
  capacity: NaN,
  equipment: [],
  isActive: true,
}

export default function LabsTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<Lab, FormState>
      title="Laboratories"
      description="Drag to reorder. Each lab can list its equipment and capacity."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={getLabsAdmin}
      create={createLab}
      update={updateLab}
      del={deleteLab}
      restore={restoreLab}
      reorder={reorderLabs}
      mapToForm={(item) => ({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl ?? "",
        mediaId: item.mediaId,
        capacity: item.capacity ?? NaN,
        equipment: item.equipment,
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        mediaId: form.mediaId,
        capacity: Number.isNaN(form.capacity) ? undefined : form.capacity,
        equipment: form.equipment,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        mediaId: form.mediaId,
        capacity: Number.isNaN(form.capacity) ? undefined : form.capacity,
        equipment: form.equipment,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.name && !!form.description}
      getName={(item) => item.name}
      renderRow={(item) => (
        <div>
          <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{item.description}</p>
        </div>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            required
            rows={2}
          />
          <MediaField
            label="Photo"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/departments/cse/labs/ai-lab.jpg"
          />
          <NumberField label="Capacity" value={form.capacity} onChange={(v) => setForm({ ...form, capacity: v })} />
          <CmsChipList
            label="Equipment"
            items={form.equipment}
            onChange={(equipment) => setForm({ ...form, equipment })}
            placeholder="Add an equipment item..."
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}
