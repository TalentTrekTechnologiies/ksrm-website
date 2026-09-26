"use client"

import { useState } from "react"
import { FileQuestion } from "lucide-react"
import { SelectField, PrimaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { updateDownload, Download } from "@/lib/downloads-api"
import type { SyllabusProgramme } from "@/lib/syllabus-api"

/**
 * Syllabus files that predate the Syllabus screen, and the way to file them.
 *
 * Seventy of them exist, uploaded when a document's branch and regulation were
 * worked out from the words in its title. They still appear on the public page
 * that way, so nothing is broken - but they are invisible on this screen,
 * which listed only what it had been told about. That left the college editing
 * the same library in two places and finding different things in each, which
 * is the confusion this screen was supposed to remove.
 *
 * Filing one here writes the branch and the regulation onto the document, and
 * from then on its title decides nothing. The list shrinks as they are done;
 * there is no deadline and no migration, because guessing at seventy files on
 * the college's behalf is how the wrong branch ends up published.
 */
export default function SyllabusUnfiled({
  documents,
  programmes,
  branchesFor,
  onChanged,
  onError,
}: {
  documents: Download[]
  programmes: SyllabusProgramme[]
  branchesFor: (programme: SyllabusProgramme) => string[] | null
  onChanged: () => Promise<void>
  onError: (message: string) => void
}) {
  const { notifySaved } = useCmsConfirm()
  const [picks, setPicks] = useState<Record<number, { reg: string; branch: string }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const unfiled = documents.filter((d) => d.syllabusRegulationId == null && !d.deletedAt)
  if (unfiled.length === 0) return null

  // "B.Tech (UG) - R23", so one dropdown covers every programme's regulations
  // without making the admin pick the programme first.
  const options = programmes
    .filter((p) => !p.deletedAt)
    .flatMap((p) =>
      p.regulations
        .filter((r) => !r.deletedAt)
        .map((r) => ({
          value: String(r.id),
          label: `${p.name} — ${r.label?.trim() || r.code}`,
          programme: p,
        })),
    )

  const visible = showAll ? unfiled : unfiled.slice(0, 10)

  async function file(doc: Download) {
    const pick = picks[doc.id]
    const chosen = options.find((o) => o.value === pick?.reg)
    if (!chosen) return
    const branches = branchesFor(chosen.programme)
    const needsBranch = branches !== null && branches.length > 0

    setSaving(doc.id)
    try {
      await updateDownload(doc.id, {
        version: doc.version,
        syllabusRegulationId: Number(pick.reg),
        syllabusBranch: needsBranch ? pick.branch : null,
      })
      await onChanged()
      notifySaved("The syllabus has been filed.")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to file the syllabus")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <FileQuestion className="h-4 w-4 text-amber-600" />
        <p className="font-semibold text-slate-900">
          {unfiled.length} syllabus file{unfiled.length === 1 ? "" : "s"} not filed yet
        </p>
      </div>
      <p className="mb-3 text-sm text-slate-500">
        Uploaded before this screen existed, so they are placed on the public page by
        the words in their titles. They still work. Filing one here makes it exact, and
        its title stops mattering.
      </p>

      <ul className="space-y-2">
        {visible.map((doc) => {
          const pick = picks[doc.id] ?? { reg: "", branch: "" }
          const chosen = options.find((o) => o.value === pick.reg)
          const branches = chosen ? branchesFor(chosen.programme) : null
          const needsBranch = branches !== null && branches.length > 0
          const ready = pick.reg !== "" && (!needsBranch || pick.branch !== "")

          return (
            <li key={doc.id} className="rounded-lg border border-admin-border bg-admin-bg p-3">
              <p className="mb-2 truncate text-sm font-medium text-slate-700">{doc.title}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <SelectField
                  label="Regulation"
                  value={pick.reg}
                  onChange={(reg) => setPicks({ ...picks, [doc.id]: { reg, branch: "" } })}
                  options={[{ value: "", label: "— Choose —" }, ...options.map(({ value, label }) => ({ value, label }))]}
                />
                <SelectField
                  label="Branch"
                  value={pick.branch}
                  onChange={(branch) => setPicks({ ...picks, [doc.id]: { ...pick, branch } })}
                  options={
                    needsBranch
                      ? [{ value: "", label: "— Choose —" }, ...(branches ?? []).map((b) => ({ value: b, label: b }))]
                      : [{ value: "", label: chosen ? "Whole course" : "Choose a regulation first" }]
                  }
                />
                <PrimaryButton onClick={() => file(doc)} disabled={!ready || saving === doc.id}>
                  {saving === doc.id ? "Filing..." : "File"}
                </PrimaryButton>
              </div>
            </li>
          )
        })}
      </ul>

      {!showAll && unfiled.length > visible.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm font-semibold text-admin-primary hover:underline"
        >
          Show the other {unfiled.length - visible.length}
        </button>
      )}
    </div>
  )
}
