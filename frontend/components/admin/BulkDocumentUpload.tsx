"use client"

import { useRef, useState } from "react"
import { AlertTriangle, CheckCircle2, FileText, Loader2, Trash2, UploadCloud, X } from "lucide-react"
import { SelectField, TextField } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { bulkUploadMedia } from "@/lib/media-api"
import {
  bulkCreateDownloads,
  DownloadCategory,
  PAGE_SECTIONS,
} from "@/lib/downloads-api"

/**
 * Publishes a batch of documents in one pass.
 *
 * Adding documents one at a time is fine for a prospectus; it is not fine for
 * a semester's results, where the same category/page/group is retyped for
 * every one of forty PDFs. Here the shared settings are filled once, the files
 * are dropped together, and titles are derived from the filenames so the only
 * per-file work is correcting the ones that read badly.
 *
 * Two steps behind the scenes: the files go to the Media Library first (so
 * they get the same dedup, validation and Replace support as any other asset),
 * then one call creates the Document rows pointing at them.
 *
 * Used by DownloadsManager and by the Examinations manager's Results tab.
 */

const CATEGORY_OPTIONS: { value: DownloadCategory; label: string }[] = [
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Papers" },
  { value: "BROCHURE", label: "Brochures" },
  { value: "AFFIDAVIT", label: "Affidavits" },
  { value: "FORM", label: "Forms" },
  { value: "OTHER", label: "Other" },
]

/** "B.Tech-I-Sem-R20_Results.pdf" -> "B.Tech I Sem R20 Results" */
export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "")
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

interface Row {
  file: File
  title: string
}

export default function BulkDocumentUpload({
  defaultCategory = "OTHER",
  defaultPageSection = "",
  pageSectionOptions,
  departmentId,
  onDone,
  onCancel,
}: {
  defaultCategory?: DownloadCategory
  defaultPageSection?: string
  /** Restricts the page dropdown - the Examinations tab offers only its own sections. */
  pageSectionOptions?: { value: string; label: string }[]
  departmentId?: number
  onDone: (count: number) => void
  onCancel: () => void
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [category, setCategory] = useState<DownloadCategory>(defaultCategory)
  const [pageSection, setPageSection] = useState(defaultPageSection)
  const [groupLabel, setGroupLabel] = useState("")
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<"idle" | "uploading" | "publishing">("idle")
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sections = pageSectionOptions ?? PAGE_SECTIONS

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files)
    setRows((prev) => {
      // Re-dropping the same file should not queue it twice.
      const seen = new Set(prev.map((r) => `${r.file.name}:${r.file.size}`))
      const fresh = incoming
        .filter((f) => !seen.has(`${f.name}:${f.size}`))
        .map((file) => ({ file, title: titleFromFilename(file.name) }))
      return [...prev, ...fresh]
    })
    setError(null)
  }

  async function handlePublish() {
    if (rows.length === 0) return
    setBusy(true)
    setError(null)
    try {
      // 1. Files into the Media Library.
      setStage("uploading")
      setProgress(0)
      const uploaded = await bulkUploadMedia(
        rows.map((r) => r.file),
        { category: "document" },
        (p) => setProgress(p),
      )

      const failures = uploaded.results.filter((r) => !r.success)
      if (failures.length === uploaded.results.length) {
        throw new Error(failures[0]?.error ?? "Every file failed to upload.")
      }

      // 2. One Document row per uploaded file, sharing the settings above.
      //    Match on filename so a partially-failed upload still publishes the
      //    files that made it, with the titles the admin actually typed.
      setStage("publishing")
      const items = uploaded.results
        .filter((r) => r.success && r.media)
        .map((r) => {
          const row = rows.find((x) => x.file.name === r.originalFilename)
          return {
            title: row?.title?.trim() || titleFromFilename(r.originalFilename),
            // Only the id. Media processing is asynchronous, so the freshly
            // uploaded record still has no variants here and therefore no URL
            // to read - the server resolves the id to the canonical file URL.
            mediaId: r.media!.id,
          }
        })

      await bulkCreateDownloads({
        items,
        category,
        pageSection: pageSection || undefined,
        groupLabel: groupLabel.trim() || undefined,
        departmentId,
        isActive: true,
      })

      if (failures.length > 0) {
        setError(
          `Published ${items.length}. ${failures.length} file${failures.length === 1 ? "" : "s"} could not be uploaded: ${failures
            .map((f) => f.originalFilename)
            .join(", ")}`,
        )
        setRows([])
        setBusy(false)
        setStage("idle")
        return
      }

      onDone(items.length)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Bulk publish failed")
      setBusy(false)
      setStage("idle")
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Upload many documents at once</p>
          <p className="text-xs text-slate-500">
            Set where they go once, drop the files, and publish them together.
          </p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Close" className="rounded-lg p-1 hover:bg-admin-bg">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {/* Shared settings - filled once, applied to every file. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as DownloadCategory)}
          options={CATEGORY_OPTIONS}
          required
        />
        <SelectField
          label="Show on page"
          value={pageSection}
          onChange={setPageSection}
          options={[{ value: "", label: "Not tied to a page" }, ...sections]}
        />
        <TextField
          label="Group heading (optional)"
          value={groupLabel}
          onChange={setGroupLabel}
          placeholder="AY 2025-26"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? "border-admin-primary bg-admin-primary/5" : "border-admin-border hover:border-admin-primary/50"
        }`}
      >
        <UploadCloud className="mb-2 h-7 w-7 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">Drop files here, or click to choose</p>
        <p className="mt-0.5 text-xs text-slate-500">PDFs, Word and Excel files. Up to 200 at a time.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {rows.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {rows.length} file{rows.length === 1 ? "" : "s"} ready
            </p>
            <button
              type="button"
              onClick={() => setRows([])}
              disabled={busy}
              className="text-xs font-medium text-slate-500 hover:text-red-600 disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          {/* Titles come from the filenames; fix the ones that read badly. */}
          <div className="max-h-72 overflow-auto rounded-xl border border-admin-border">
            {rows.map((row, i) => (
              <div
                key={`${row.file.name}:${row.file.size}`}
                className={`flex items-center gap-2 px-3 py-2 ${i > 0 ? "border-t border-admin-border" : ""}`}
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={row.title}
                  onChange={(e) =>
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))
                  }
                  disabled={busy}
                  aria-label={`Title for ${row.file.name}`}
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-slate-800 hover:border-admin-border focus:border-admin-primary focus:outline-none disabled:opacity-60"
                />
                <span className="hidden shrink-0 text-[11px] text-slate-400 sm:block" title={row.file.name}>
                  {row.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                  disabled={busy}
                  aria-label={`Remove ${row.file.name}`}
                  className="shrink-0 rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {busy && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {stage === "uploading" ? `Uploading files… ${progress}%` : "Publishing documents…"}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-admin-bg">
            <div
              className="h-full rounded-full bg-admin-primary transition-all"
              style={{ width: stage === "uploading" ? `${progress}%` : "100%" }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-admin-border px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={busy || rows.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-admin-primary px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {busy ? "Working…" : `Publish ${rows.length || ""} document${rows.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  )
}
