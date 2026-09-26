"use client"

import { useState } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  SelectField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { createDownload, deleteDownload, Download } from "@/lib/downloads-api"
import type { SyllabusRegulation } from "@/lib/syllabus-api"

/**
 * The syllabus files published under one regulation, uploaded from here.
 *
 * They used to be uploaded in Downloads, where the form has a Title box and no
 * branch field at all: the public page worked the branch and the regulation
 * out from the words in the title, so "I & II SEM R18 ECE" landed under ECE,
 * R18 - and a title that matched neither landed under "Other" without saying
 * so. The first question anyone asked of that form was where to choose ECE.
 *
 * Here the branch and the regulation are what you pick, and the title is just
 * a title. The document records both, so nothing depends on how it was named.
 */
export default function SyllabusUploads({
  regulation,
  branches,
  documents,
  onChanged,
  onError,
}: {
  regulation: SyllabusRegulation
  /** The branches of the owning programme. Empty for a course with no
   *  branches, where the file belongs to the course itself. */
  branches: string[]
  documents: Download[]
  onChanged: () => Promise<void>
  onError: (message: string) => void
}) {
  const { confirm, notifySaved } = useCmsConfirm()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [branch, setBranch] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [mediaId, setMediaId] = useState<number | null>(null)

  const mine = documents.filter((d) => d.syllabusRegulationId === regulation.id)

  function reset() {
    setOpen(false)
    setTitle("")
    setBranch("")
    setFileUrl("")
    setMediaId(null)
  }

  async function save() {
    setSaving(true)
    try {
      await createDownload({
        title: title.trim(),
        category: "SYLLABUS",
        pageSection: "syllabus",
        fileUrl,
        mediaId: mediaId ?? undefined,
        syllabusRegulationId: regulation.id,
        // Empty means the course itself, not a branch - which is what a
        // programme with no specialisations needs.
        syllabusBranch: branch || null,
        isActive: true,
      })
      reset()
      await onChanged()
      notifySaved("The syllabus has been uploaded.")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to upload the syllabus")
    } finally {
      setSaving(false)
    }
  }

  async function remove(doc: Download) {
    if (
      !(await confirm({
        title: "Delete syllabus",
        message: `Remove "${doc.title}" from ${regulation.code}? The file stays in the Media Library.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteDownload(doc.id)
      await onChanged()
      notifySaved("The syllabus has been removed.")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to remove the syllabus")
    }
  }

  const needsBranch = branches.length > 0
  const canSave = title.trim() !== "" && fileUrl !== "" && (!needsBranch || branch !== "")

  return (
    <div className="mt-2 border-t border-admin-border pt-2">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {mine.length === 0
            ? "No syllabus files yet"
            : `${mine.length} syllabus file${mine.length === 1 ? "" : "s"}`}
        </p>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Upload syllabus
          </button>
        )}
      </div>

      {open && (
        <div className="mb-2 space-y-3 rounded-lg border border-admin-border bg-white p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {needsBranch ? (
              <SelectField
                label="Branch"
                value={branch}
                onChange={setBranch}
                required
                options={[
                  { value: "", label: "— Choose a branch —" },
                  ...branches.map((b) => ({ value: b, label: b })),
                ]}
              />
            ) : (
              <TextField label="Branch" value="Whole course (no branches)" onChange={() => {}} />
            )}
            <TextField
              label="Title"
              value={title}
              onChange={setTitle}
              required
              placeholder="I & II Semester"
            />
          </div>
          <MediaField
            label="File"
            url={fileUrl}
            mediaId={mediaId}
            onChange={(url, id, name) => {
              setFileUrl(url)
              setMediaId(id)
              // A picked file usually already has the right name on it, and
              // typing it again is the step people skip.
              if (!title.trim() && name) setTitle(name)
            }}
            accept={["DOCUMENT"]}
            required
          />
          <p className="text-xs text-slate-500">
            Filed under <span className="font-semibold">{regulation.code}</span>
            {needsBranch && branch ? (
              <>
                {" "}and <span className="font-semibold">{branch}</span>
              </>
            ) : null}
            . The title is only what visitors read - it no longer decides where the
            file appears.
          </p>
          <FormActions>
            <SecondaryButton onClick={reset}>Cancel</SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving || !canSave}>
              {saving ? "Uploading..." : "Upload"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {mine.length > 0 && (
        <ul className="space-y-1">
          {mine.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded bg-white px-2.5 py-1.5 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-slate-700">{doc.title}</span>
                {doc.syllabusBranch && (
                  <span className="shrink-0 rounded bg-admin-bg px-1.5 py-0.5 text-slate-500">
                    {doc.syllabusBranch}
                  </span>
                )}
              </span>
              <button
                type="button"
                aria-label={`Remove ${doc.title}`}
                onClick={() => remove(doc)}
                className="shrink-0 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
