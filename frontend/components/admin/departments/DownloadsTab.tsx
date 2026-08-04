"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, SelectField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getDownloadsAdmin,
  createDownload,
  updateDownload,
  deleteDownload,
  restoreDownload,
  reorderDownloads,
  Download,
  DownloadCategory,
} from "@/lib/downloads-api"

interface FormState {
  title: string
  description: string
  category: DownloadCategory
  fileUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "OTHER",
  fileUrl: "",
  mediaId: null,
  isActive: true,
}

const CATEGORY_OPTIONS: { value: DownloadCategory; label: string }[] = [
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Paper" },
  { value: "BROCHURE", label: "Brochure" },
  { value: "AFFIDAVIT", label: "Affidavit" },
  { value: "FORM", label: "Form" },
  { value: "OTHER", label: "Other" },
]

export default function DownloadsTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<Download, FormState>
      title="Documents"
      description="Drag to reorder. Syllabus, question papers, forms and other documents."
      departmentId={departmentId}
      emptyForm={emptyForm}
      fetchAdmin={(departmentId, includeDeleted) => getDownloadsAdmin(includeDeleted, departmentId)}
      create={createDownload}
      update={updateDownload}
      del={deleteDownload}
      restore={restoreDownload}
      reorder={reorderDownloads}
      mapToForm={(item) => ({
        title: item.title,
        description: item.description ?? "",
        category: item.category,
        fileUrl: item.fileUrl,
        mediaId: item.mediaId,
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        title: form.title,
        description: form.description || null,
        category: form.category,
        fileUrl: form.fileUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        title: form.title,
        description: form.description || null,
        category: form.category,
        fileUrl: form.fileUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.title && !!form.fileUrl}
      getName={(item) => item.title}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.title}</span>{" "}
          <span className="text-slate-500">· {CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label}</span>
        </p>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <SelectField
            label="Category"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v as DownloadCategory })}
            options={CATEGORY_OPTIONS}
          />
          <MediaField
            label="File"
            url={form.fileUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, fileUrl: url, mediaId })}
            accept={["DOCUMENT"]}
            urlPlaceholder="/downloads/syllabus-cse.pdf"
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
        </>
      )}
    />
  )
}
