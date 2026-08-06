"use client"

import DepartmentDragListManager from "./DepartmentDragListManager"
import MediaField from "@/components/admin/cms/MediaField"
import { TextField, TextAreaField, ToggleField } from "@/components/admin/cms/CmsForm"
import {
  getDownloadsAdmin,
  createDownload,
  updateDownload,
  deleteDownload,
  restoreDownload,
  reorderDownloads,
  Download,
} from "@/lib/downloads-api"

/**
 * A department's Board of Studies papers - minutes, agendas, resolutions.
 *
 * The BoS gained a members table on the public department page, and nowhere to
 * put the documents that go with it: minutes uploaded through the general
 * Documents screen landed in the department's flat document list, nowhere near
 * the committee they belong to.
 *
 * These are ordinary department documents routed to a fixed section, the same
 * arrangement the Professional Chapters tab uses. The section slug is set here
 * rather than chosen in a dropdown, because choosing it wrongly is exactly how
 * an upload disappears into the wrong block on the public page.
 */
const BOS_SECTION = "board-of-studies"

interface FormState {
  title: string
  description: string
  fileUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = {
  title: "",
  description: "",
  fileUrl: "",
  mediaId: null,
  isActive: true,
}

export default function BoardOfStudiesTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<Download, FormState>
      title="Board of Studies"
      description="Minutes, agendas and resolutions of this department's Board of Studies. They appear beneath the BoS members table on the department's public page. The members themselves are in Admin → Committees."
      departmentId={departmentId}
      emptyForm={emptyForm}
      // Only this department's BoS papers, never its general documents.
      fetchAdmin={async (departmentId, includeDeleted) => {
        const all = await getDownloadsAdmin(includeDeleted, departmentId)
        return all.filter((d) => d.pageSection === BOS_SECTION)
      }}
      create={createDownload}
      update={updateDownload}
      del={deleteDownload}
      restore={restoreDownload}
      reorder={reorderDownloads}
      mapToForm={(item) => ({
        title: item.title,
        description: item.description ?? "",
        fileUrl: item.fileUrl,
        mediaId: item.mediaId,
        isActive: item.isActive,
      })}
      buildCreateDto={(form, departmentId) => ({
        departmentId,
        title: form.title,
        description: form.description || null,
        pageSection: BOS_SECTION,
        category: "OTHER" as const,
        fileUrl: form.fileUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        title: form.title,
        description: form.description || null,
        pageSection: BOS_SECTION,
        fileUrl: form.fileUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      isValid={(form) => !!form.title && !!form.fileUrl}
      getName={(item) => item.title}
      renderRow={(item) => (
        <p className="truncate text-sm text-slate-700">
          <span className="font-semibold">{item.title}</span>
          {item.description && <span className="text-slate-500"> · {item.description}</span>}
        </p>
      )}
      renderFields={(form, setForm) => (
        <>
          <TextField
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
            placeholder="BoS Meeting Minutes — 12 March 2026"
          />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            rows={2}
            helperText="Optional. e.g. Syllabus revision for R26, 4th meeting"
          />
          <MediaField
            label="File"
            url={form.fileUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, fileUrl: url, mediaId })}
            accept={["DOCUMENT"]}
            urlPlaceholder="…or paste a link"
          />
          <ToggleField
            label="Active"
            checked={form.isActive}
            onChange={(v) => setForm({ ...form, isActive: v })}
          />
        </>
      )}
    />
  )
}
