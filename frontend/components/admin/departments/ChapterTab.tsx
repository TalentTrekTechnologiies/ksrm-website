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
 * The department's professional chapter - its activities, events and reports.
 *
 * These are ordinary department documents routed to the Professional Chapters
 * section, which is what makes them appear in their own block on the public
 * department page rather than among syllabi and forms. Rather than asking
 * whoever runs the chapter to remember a section slug in the Documents screen,
 * the routing is fixed here and the tab only ever shows this chapter's items.
 */
const CHAPTER_SECTION = "professional-chapters"

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

export default function ChapterTab({ departmentId }: { departmentId: number }) {
  return (
    <DepartmentDragListManager<Download, FormState>
      title="Activity Reports & Documents"
      description="Photos, reports and certificates from this chapter's activities. Committee, events and About text are above."
      departmentId={departmentId}
      emptyForm={emptyForm}
      // Only this department's chapter items, never its general documents.
      fetchAdmin={async (departmentId, includeDeleted) => {
        const all = await getDownloadsAdmin(includeDeleted, departmentId)
        return all.filter((d) => d.pageSection === CHAPTER_SECTION)
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
        // Fixed, not chosen: getting this wrong is what would silently drop an
        // upload into the wrong block on the public page.
        pageSection: CHAPTER_SECTION,
        category: "OTHER" as const,
        fileUrl: form.fileUrl,
        mediaId: form.mediaId,
        isActive: form.isActive,
      })}
      buildUpdateDto={(form) => ({
        title: form.title,
        description: form.description || null,
        pageSection: CHAPTER_SECTION,
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
            placeholder="Hackathon 2026 - Event Report"
          />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            rows={2}
            helperText="Optional. e.g. 48-hour hackathon, 120 participants"
          />
          {/* Any of the three, or a pasted URL - a chapter's output is as
              often a photo set or a YouTube link as it is a PDF report. */}
          <MediaField
            label="File, image, video or link"
            url={form.fileUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, fileUrl: url, mediaId })}
            accept={["DOCUMENT", "IMAGE", "VIDEO"]}
            urlPlaceholder="…or paste a link: YouTube, Drive, an external page"
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
