"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Loader2 } from "lucide-react"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { ApiError } from "@/lib/api-client"
import { getStoredAdmin, hasPermission } from "@/lib/auth"
import { formatPublished } from "@/lib/format-date"
import { EXAM_DOC_BLOCKS } from "@/lib/exam-page-blocks"
import { docHeading, selectBlockDocs } from "@/lib/page-doc-rules"
import {
  deleteDownload,
  getDownloadsAdmin,
  restoreDownload,
  updateDownload,
  type Download,
} from "@/lib/downloads-api"

const NO_HEADING = "No heading"
/** Rows drawn per open heading before "Show all" - some hold 400+. */
const ROWS_SHOWN = 100
/** Requests in flight at once during a bulk action. */
const PARALLEL = 4

interface Heading {
  label: string
  docs: Download[]
}

type Undo = { kind: "delete" | "hide"; ids: number[] }

/**
 * The Examinations page's documents, block by block and heading by heading,
 * exactly as a visitor sees them - "More Exam Documents -> Notices (427)".
 *
 * Staff could see migration leftovers on the site ("Legacy uploads (demo1)",
 * hundreds of notices titled "10", "100", ...) but not find them: the only
 * place to delete was the Documents screen, six thousand rows fifteen at a
 * time, one delete per click. Here a whole heading goes in two clicks.
 *
 * Each item still goes through the ordinary per-document delete/update/restore
 * calls, so page ownership checks and the audit log apply to every one, and a
 * delete is the usual soft delete - restorable from the "Deleted" view.
 */
export default function ExamPageDocuments() {
  const { confirm } = useCmsConfirm()
  const admin = getStoredAdmin()
  const canDelete = hasPermission(admin, "downloads.delete")
  const canUpdate = hasPermission(admin, "downloads.update")
  const canRestore = hasPermission(admin, "downloads.restore")

  const [all, setAll] = useState<Download[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [blockId, setBlockId] = useState(EXAM_DOC_BLOCKS[0].id)
  const [view, setView] = useState<"live" | "deleted">("live")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<{ label: string; done: number; total: number } | null>(null)
  const [result, setResult] = useState<{ message: string; undo?: Undo } | null>(null)

  const load = useCallback(async () => {
    try {
      setAll(await getDownloadsAdmin(true))
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load the documents.")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getDownloadsAdmin(true)
      .then((rows) => {
        if (!cancelled) setAll(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load the documents.")
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Every block's documents for the current view. Hidden documents stay in
  // their block (marked), so they can be shown again.
  const blocks = useMemo(() => {
    if (!all) return null
    const pool = all.filter((d) => (view === "deleted" ? !!d.deletedAt : !d.deletedAt))
    return EXAM_DOC_BLOCKS.map((b) => ({ ...b, docs: selectBlockDocs(pool, b.rules) }))
  }, [all, view])

  const block = blocks?.find((b) => b.id === blockId) ?? null

  const headings = useMemo<Heading[]>(() => {
    if (!block) return []
    const byLabel = new Map<string, Heading>()
    for (const d of block.docs) {
      const label = docHeading(d) ?? NO_HEADING
      let h = byLabel.get(label)
      if (!h) {
        h = { label, docs: [] }
        byLabel.set(label, h)
      }
      h.docs.push(d)
    }
    // The un-headed list sits last, as on the page.
    return [...byLabel.values()].sort((a, b) => Number(a.label === NO_HEADING) - Number(b.label === NO_HEADING))
  }, [block])

  const selectedDocs = useMemo(() => (block ? block.docs.filter((d) => selected.has(d.id)) : []), [block, selected])

  function resetFor(next: () => void) {
    next()
    setSelected(new Set())
    setOpen(new Set())
    setShowAll(new Set())
  }

  function toggle(ids: number[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function toggleSet(setter: typeof setOpen, key: string) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function run(label: string, docs: Download[], op: (d: Download) => Promise<unknown>) {
    const ok: number[] = []
    let failed = 0
    let done = 0
    const queue = [...docs]
    setResult(null)
    setProgress({ label, done, total: docs.length })
    const worker = async () => {
      for (let d = queue.shift(); d; d = queue.shift()) {
        try {
          await op(d)
          ok.push(d.id)
        } catch {
          failed++
        }
        done++
        setProgress({ label, done, total: docs.length })
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL, docs.length) }, worker))
    setProgress(null)
    setSelected(new Set())
    await load()
    return { ok, failed }
  }

  const plural = (n: number) => `${n} document${n === 1 ? "" : "s"}`
  const failNote = (n: number) =>
    n ? ` ${plural(n)} could not be changed - someone may have edited them, or your role does not cover them.` : ""

  async function remove(docs: Download[]) {
    if (!docs.length) return
    const ok = await confirm({
      title: `Delete ${plural(docs.length)}?`,
      message:
        "They come off the Examinations page straight away. Nothing is erased: they stay under \"Deleted\" on this screen and can be restored at any time.",
      confirmLabel: `Delete ${docs.length}`,
      destructive: true,
    })
    if (!ok) return
    const r = await run("Deleting", docs, (d) => deleteDownload(d.id))
    setResult({ message: `Deleted ${plural(r.ok.length)}.${failNote(r.failed)}`, undo: { kind: "delete", ids: r.ok } })
  }

  async function setVisible(docs: Download[], visible: boolean) {
    const targets = docs.filter((d) => d.isActive !== visible)
    if (!targets.length) return
    const r = await run(visible ? "Showing" : "Hiding", targets, (d) =>
      updateDownload(d.id, { isActive: visible, version: d.version }),
    )
    setResult({
      message: `${visible ? "Showing" : "Hid"} ${plural(r.ok.length)}${visible ? " on the site again" : " from the site (kept here)"}.${failNote(r.failed)}`,
      undo: visible ? undefined : { kind: "hide", ids: r.ok },
    })
  }

  async function restore(docs: Download[]) {
    if (!docs.length) return
    const r = await run("Restoring", docs, (d) => restoreDownload(d.id))
    setResult({ message: `Restored ${plural(r.ok.length)}.${failNote(r.failed)}` })
  }

  async function undo(u: Undo) {
    // Fresh rows: a hide bumped every version, so the old ones would be refused.
    const fresh = await getDownloadsAdmin(true)
    const ids = new Set(u.ids)
    const docs = fresh.filter((d) => ids.has(d.id))
    const r =
      u.kind === "delete"
        ? await run("Undoing", docs.filter((d) => d.deletedAt), (d) => restoreDownload(d.id))
        : await run("Undoing", docs.filter((d) => !d.isActive && !d.deletedAt), (d) =>
            updateDownload(d.id, { isActive: true, version: d.version }),
          )
    setResult({ message: `Undone: ${plural(r.ok.length)} back as they were.${failNote(r.failed)}` })
  }

  if (error && !all) {
    return (
      <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
      </p>
    )
  }
  if (!blocks || !block) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const busy = progress !== null
  const selHidden = selectedDocs.filter((d) => !d.isActive).length
  const selShown = selectedDocs.length - selHidden

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Documents on the Examinations page</p>
        <p className="text-sm text-slate-500">
          The same blocks and headings a visitor sees. Pick a block, open a heading, tick what should go and press
          Delete - or tick a heading to take all of it. Deleted documents leave the site at once and can be restored
          from &ldquo;Deleted&rdquo;. Renaming a document is done under{" "}
          <a href="/admin/downloads" className="font-semibold text-admin-primary hover:underline">
            Documents
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["live", "deleted"] as const).map((v) => (
          <button
            key={v}
            type="button"
            disabled={busy}
            onClick={() => resetFor(() => setView(v))}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              view === v ? "bg-slate-800 text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-admin-bg"
            }`}
          >
            {v === "live" ? "On the page" : "Deleted (can be restored)"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Block on the Examinations page">
        {blocks.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={b.id === blockId}
            disabled={busy}
            onClick={() => resetFor(() => setBlockId(b.id))}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              b.id === blockId
                ? "bg-admin-primary text-white"
                : "border border-admin-border bg-white text-slate-700 hover:bg-admin-bg"
            }`}
          >
            {b.title} <span className="ml-1 opacity-75">{b.docs.length}</span>
          </button>
        ))}
      </div>

      {/* Action bar: stays in view while scrolling a long heading. */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-admin-border bg-white/95 p-3 backdrop-blur-sm">
        <span className="text-sm text-slate-600">
          <strong>{block.title}</strong>: {plural(block.docs.length)}
          {selectedDocs.length > 0 && <> &middot; <strong>{selectedDocs.length} selected</strong></>}
        </span>
        <a
          href={`/examinations#${block.anchor}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
        >
          View on site <ExternalLink className="h-3 w-3" />
        </a>
        <span className="flex-1" />
        {progress ? (
          <span className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" /> {progress.label} {progress.done} of {progress.total}...
          </span>
        ) : view === "live" ? (
          <>
            {canUpdate && selShown > 0 && (
              <button type="button" onClick={() => setVisible(selectedDocs, false)} className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-admin-bg">
                Hide from site
              </button>
            )}
            {canUpdate && selHidden > 0 && (
              <button type="button" onClick={() => setVisible(selectedDocs, true)} className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-admin-bg">
                Show on site
              </button>
            )}
            {canDelete && selectedDocs.length > 0 && (
              <button type="button" onClick={() => remove(selectedDocs)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700">
                Delete {selectedDocs.length}
              </button>
            )}
          </>
        ) : (
          canRestore &&
          selectedDocs.length > 0 && (
            <button type="button" onClick={() => restore(selectedDocs)} className="rounded-lg bg-admin-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-admin-primary-dark">
              Restore {selectedDocs.length}
            </button>
          )
        )}
        {!busy && selectedDocs.length > 0 && (
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs font-semibold text-slate-500 hover:underline">
            Clear
          </button>
        )}
      </div>

      {result && (
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {result.message}
          {result.undo && result.undo.ids.length > 0 && !busy && (
            <button type="button" onClick={() => undo(result.undo!)} className="font-semibold underline">
              Undo
            </button>
          )}
        </p>
      )}
      {error && all && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {headings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border bg-admin-bg px-4 py-10 text-center text-sm text-slate-500">
          {view === "live" ? "Nothing in this block." : "Nothing deleted from this block."}
        </p>
      ) : (
        <div className="space-y-2">
          {headings.map((h) => {
            const ids = h.docs.map((d) => d.id)
            const picked = ids.filter((id) => selected.has(id)).length
            const isOpen = open.has(h.label)
            const rows = showAll.has(h.label) ? h.docs : h.docs.slice(0, ROWS_SHOWN)
            return (
              <div key={h.label} className="overflow-hidden rounded-xl border border-admin-border bg-white">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select every document under ${h.label}`}
                    className="h-4 w-4"
                    disabled={busy}
                    checked={picked === ids.length}
                    ref={(el) => {
                      if (el) el.indeterminate = picked > 0 && picked < ids.length
                    }}
                    onChange={(e) => toggle(ids, e.target.checked)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSet(setOpen, h.label)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                    <span className="truncate font-semibold text-slate-800">{h.label}</span>
                    <span className="shrink-0 rounded-full bg-admin-bg px-2 py-0.5 text-xs font-semibold text-slate-600">{h.docs.length}</span>
                  </button>
                  {!busy && view === "live" && canDelete && (
                    <button type="button" onClick={() => remove(h.docs)} className="text-xs font-semibold text-red-600 hover:underline">
                      Delete all {h.docs.length}
                    </button>
                  )}
                  {!busy && view === "deleted" && canRestore && (
                    <button type="button" onClick={() => restore(h.docs)} className="text-xs font-semibold text-admin-primary hover:underline">
                      Restore all {h.docs.length}
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ul className="divide-y divide-admin-border border-t border-admin-border">
                    {rows.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-4 py-2 pl-11 text-sm">
                        <input
                          type="checkbox"
                          aria-label={`Select ${d.title}`}
                          className="h-4 w-4"
                          disabled={busy}
                          checked={selected.has(d.id)}
                          onChange={(e) => toggle([d.id], e.target.checked)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-slate-800" title={d.title}>{d.title}</span>
                          <span className="text-xs text-slate-400">
                            {formatPublished(d.publishedAt) ?? ""}
                            {!d.isActive && <span className="ml-2 font-semibold text-amber-700">Hidden from site</span>}
                          </span>
                        </span>
                        {d.fileUrl && (
                          <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-admin-primary hover:underline">
                            Open
                          </a>
                        )}
                      </li>
                    ))}
                    {rows.length < h.docs.length && (
                      <li className="px-4 py-2 pl-11">
                        <button type="button" onClick={() => toggleSet(setShowAll, h.label)} className="text-xs font-semibold text-admin-primary hover:underline">
                          Show all {h.docs.length}
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
