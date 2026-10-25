"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Folder, Loader2, Search, X } from "lucide-react"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { ApiError } from "@/lib/api-client"
import { getStoredAdmin, hasPermission } from "@/lib/auth"
import { formatPublished } from "@/lib/format-date"
import { docHeading, selectBlockDocs, type PageDocBlock } from "@/lib/page-doc-rules"
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
/** Title groups drawn in search results before "Show more". */
const RESULTS_SHOWN = 150
/** Requests in flight at once during a bulk action. */
const PARALLEL = 4

interface Heading {
  label: string
  docs: Download[]
}

interface Place {
  blockId: string
  blockTitle: string
  heading: string
}

type Undo = { kind: "delete" | "hide"; ids: number[] }

/**
 * Items a block shows that are not documents - on the Examinations page, the
 * notices and calendars posted under Exam Notifications. Without this the
 * block read "0" here while the page was full.
 */
export interface BlockExtra {
  count: number
  /** "posted under Exam Notifications -> Notifications" */
  text: string
  actionLabel?: string
  onAction?: () => void
}

/** Lower-case, single-spaced - what a search compares on. */
const norm = (s: string) => s.toLowerCase().replace(/[_\s]+/g, " ").trim()

function headingsOf(docs: Download[]): Heading[] {
  const byLabel = new Map<string, Heading>()
  for (const d of docs) {
    // A folder path (NAAC / IQAC documents) is the heading the page files it
    // under; otherwise the year or group heading, as on the page.
    const label = d.folderPath?.trim() || docHeading(d) || NO_HEADING
    let h = byLabel.get(label)
    if (!h) {
      h = { label, docs: [] }
      byLabel.set(label, h)
    }
    h.docs.push(d)
  }
  // As on the page: folders first, in natural order (Criterion-1 before
  // Criterion-7, 7.1.2 before 7.1.10); then the other headings as they come;
  // the un-headed list last.
  const folders = new Set(docs.map((d) => d.folderPath?.trim()).filter(Boolean))
  const rank = (h: Heading) => (folders.has(h.label) ? 0 : h.label === NO_HEADING ? 2 : 1)
  return [...byLabel.values()].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (rank(a) === 0 ? a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }) : 0),
  )
}

const placeText = (p: Place) => `${p.blockTitle} › ${p.heading}`

/**
 * A public page's documents, block by block and heading by heading, exactly
 * as a visitor sees them - "More Exam Documents -> Notices (427)", "DVV ->
 * DVV2 (40)". Used for the Examinations and NAAC pages, whose blocks pull
 * documents in by title and heading as well as by section, so a list by
 * section alone showed "No documents" under blocks full of files.
 *
 * Staff could see migration leftovers on the site ("Legacy uploads (demo1)",
 * hundreds of notices titled "10", "100", ...) but not find them: the only
 * place to delete was the Documents screen, six thousand rows fifteen at a
 * time, one delete per click. Here a whole heading goes in two clicks, and the
 * search finds a document or a heading anywhere on the page - with every place
 * a name appears, so the right copy is the one removed.
 *
 * Each item still goes through the ordinary per-document delete/update/restore
 * calls, so page ownership checks and the audit log apply to every one, and a
 * delete is the usual soft delete - restorable from the "Deleted" view.
 */
export default function PageDocumentsManager({
  blocks: pageBlocks,
  pageName,
  pagePath,
  initialBlockId,
  extras,
}: {
  blocks: PageDocBlock[]
  /** "Examinations page", "NAAC page". */
  pageName: string
  /** "/examinations" - the "View on site" links add the block's anchor. */
  pagePath: string
  /** The block to open first, e.g. the one for the section picked elsewhere. */
  initialBlockId?: string
  /** Non-document items per block id, counted alongside the documents. */
  extras?: Record<string, BlockExtra>
}) {
  const { confirm } = useCmsConfirm()
  const admin = getStoredAdmin()
  const canDelete = hasPermission(admin, "downloads.delete")
  const canUpdate = hasPermission(admin, "downloads.update")
  const canRestore = hasPermission(admin, "downloads.restore")

  const [all, setAll] = useState<Download[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [blockId, setBlockId] = useState(
    initialBlockId && pageBlocks.some((b) => b.id === initialBlockId) ? initialBlockId : pageBlocks[0].id,
  )
  const [view, setView] = useState<"live" | "deleted">("live")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  // Open headings / title groups, keyed "block::heading" or "title::<name>".
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState<Set<string>>(new Set())
  const [moreResults, setMoreResults] = useState(false)
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

  // Every block's documents and headings for the current view. Hidden
  // documents stay in their block (marked), so they can be shown again.
  const blocks = useMemo(() => {
    if (!all) return null
    const pool = all.filter((d) => (view === "deleted" ? !!d.deletedAt : !d.deletedAt))
    return pageBlocks.map((b) => {
      const docs = selectBlockDocs(pool, b.rules)
      return { ...b, docs, headings: headingsOf(docs) }
    })
  }, [all, view, pageBlocks])

  // Where each document appears. Usually one place; a title pattern can pull
  // the same document into two blocks, and the search says so.
  const places = useMemo(() => {
    const m = new Map<number, { doc: Download; places: Place[] }>()
    for (const b of blocks ?? []) {
      for (const h of b.headings) {
        for (const d of h.docs) {
          const entry = m.get(d.id) ?? { doc: d, places: [] }
          entry.places.push({ blockId: b.id, blockTitle: b.title, heading: h.label })
          m.set(d.id, entry)
        }
      }
    }
    return m
  }, [blocks])

  const terms = useMemo(() => norm(query).split(" ").filter(Boolean), [query])
  const searching = terms.length > 0

  const search = useMemo(() => {
    if (!searching || !blocks) return null
    const hit = (text: string) => {
      const t = norm(text)
      return terms.every((w) => t.includes(w))
    }
    const headingHits = blocks.flatMap((b) =>
      b.headings.filter((h) => h.label !== NO_HEADING && hit(h.label)).map((h) => ({ block: b, heading: h })),
    )
    // Same name in more than one place -> one row with every copy under it.
    const byTitle = new Map<string, { title: string; entries: { doc: Download; places: Place[] }[] }>()
    for (const entry of places.values()) {
      if (!hit(entry.doc.title)) continue
      const key = norm(entry.doc.title)
      const g = byTitle.get(key) ?? { title: entry.doc.title, entries: [] }
      g.entries.push(entry)
      byTitle.set(key, g)
    }
    const titleHits = [...byTitle.entries()]
      .map(([key, g]) => ({ key, ...g }))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }))
    return { headingHits, titleHits }
  }, [searching, terms, blocks, places])

  const block = blocks?.find((b) => b.id === blockId) ?? null

  // Selection can span blocks while searching, so it is resolved against
  // every document in the current view, not just the open block.
  const selectedDocs = useMemo(
    () => [...selected].map((id) => places.get(id)?.doc).filter((d): d is Download => !!d),
    [selected, places],
  )

  function resetFor(next: () => void) {
    next()
    setSelected(new Set())
    setOpen(new Set())
    setShowAll(new Set())
    setMoreResults(false)
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
        `They come off the ${pageName} straight away. Nothing is erased: they stay under \"Deleted\" on this screen and can be restored at any time.`,
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

  /** A tickbox for a set of documents: ticked, empty, or part-ticked. */
  const groupBox = (ids: number[], label: string) => {
    const picked = ids.filter((id) => selected.has(id)).length
    return (
      <input
        type="checkbox"
        aria-label={label}
        className="h-4 w-4 shrink-0"
        disabled={busy}
        checked={ids.length > 0 && picked === ids.length}
        ref={(el) => {
          if (el) el.indeterminate = picked > 0 && picked < ids.length
        }}
        onChange={(e) => toggle(ids, e.target.checked)}
      />
    )
  }

  /** One document: tickbox, title, date, hidden flag, where else it is, Open. */
  const docRow = (d: Download, opts: { titleText?: string; showPlaces?: boolean; hidePlaces?: boolean; note?: string } = {}) => {
    const where = places.get(d.id)?.places ?? []
    return (
      <li key={d.id} className="flex items-center gap-3 px-4 py-2 pl-11 text-sm">
        <input
          type="checkbox"
          aria-label={`Select ${d.title}`}
          className="h-4 w-4 shrink-0"
          disabled={busy}
          checked={selected.has(d.id)}
          onChange={(e) => toggle([d.id], e.target.checked)}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-slate-800" title={d.title}>{opts.titleText ?? d.title}</span>
          <span className="text-xs text-slate-400">
            {formatPublished(d.publishedAt) ?? ""}
            {!d.isActive && <span className="ml-2 font-semibold text-amber-700">Hidden from site</span>}
            {opts.note && <span className="ml-2 font-semibold text-slate-600">{opts.note}</span>}
            {opts.showPlaces
              ? where.map((p) => (
                  <span key={p.blockId + p.heading} className="ml-2 text-slate-500">
                    {placeText(p)}
                  </span>
                ))
              : !opts.hidePlaces && where.length > 1 && <span className="ml-2 text-slate-500">also in {where.filter((p) => p.blockId !== blockId).map(placeText).join(", ")}</span>}
          </span>
        </span>
        {d.fileUrl && (
          <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-admin-primary hover:underline">
            Open
          </a>
        )}
      </li>
    )
  }

  /** A heading ("folder") with its documents, closed until clicked. */
  const headingCard = (b: PageDocBlock, h: Heading, subtitle?: string) => {
    const key = `${b.id}::${h.label}`
    const isOpen = open.has(key)
    const rows = showAll.has(key) ? h.docs : h.docs.slice(0, ROWS_SHOWN)
    return (
      <div key={key} className="overflow-hidden rounded-xl border border-admin-border bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          {groupBox(h.docs.map((d) => d.id), `Select every document under ${h.label}`)}
          <button
            type="button"
            onClick={() => toggleSet(setOpen, key)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={isOpen}
          >
            {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate font-semibold text-slate-800">{h.label}</span>
            <span className="shrink-0 rounded-full bg-admin-bg px-2 py-0.5 text-xs font-semibold text-slate-600">{h.docs.length}</span>
            {subtitle && <span className="truncate text-xs text-slate-500">in {subtitle}</span>}
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
            {rows.map((d) => docRow(d))}
            {rows.length < h.docs.length && (
              <li className="px-4 py-2 pl-11">
                <button type="button" onClick={() => toggleSet(setShowAll, key)} className="text-xs font-semibold text-admin-primary hover:underline">
                  Show all {h.docs.length}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }

  const titleHits = search ? (moreResults ? search.titleHits : search.titleHits.slice(0, RESULTS_SHOWN)) : []

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Documents on the {pageName}</p>
        <p className="text-sm text-slate-500">
          The same blocks and headings a visitor sees. Search for a document or a heading, or pick a block and open a
          heading; tick what should go and press Delete - or tick a heading to take all of it. Deleted documents leave
          the site at once and can be restored from &ldquo;Deleted&rdquo;. Renaming a document is done under{" "}
          <a href="/admin/downloads" className="font-semibold text-admin-primary hover:underline">
            Documents
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            disabled={busy}
            onChange={(e) => resetFor(() => setQuery(e.target.value))}
            placeholder="Search a document or heading name, e.g. roll list, Notices, 2019"
            aria-label={`Search documents and headings on the ${pageName}`}
            className="w-full rounded-lg border border-admin-border bg-white py-2 pl-9 pr-9 text-sm text-slate-700"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => resetFor(() => setQuery(""))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {(["live", "deleted"] as const).map((v) => (
          <button
            key={v}
            type="button"
            disabled={busy}
            onClick={() => resetFor(() => setView(v))}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              view === v ? "bg-slate-800 text-white" : "border border-admin-border bg-white text-slate-600 hover:bg-admin-bg"
            }`}
          >
            {v === "live" ? "On the page" : "Deleted (can be restored)"}
          </button>
        ))}
      </div>

      {!searching && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={`Block on the ${pageName}`}>
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
              {view === "live" && (extras?.[b.id]?.count ?? 0) > 0 && (
                <span className="ml-1 opacity-75">+ {extras![b.id].count} notices</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Action bar: stays in view while scrolling a long heading. */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-admin-border bg-white/95 p-3 backdrop-blur-sm">
        <span className="text-sm text-slate-600">
          {search ? (
            <>
              <strong>Search</strong>: {search.headingHits.length} heading{search.headingHits.length === 1 ? "" : "s"},{" "}
              {plural(search.titleHits.reduce((n, g) => n + g.entries.length, 0))}
            </>
          ) : (
            <>
              <strong>{block.title}</strong>: {plural(block.docs.length)}
            </>
          )}
          {selectedDocs.length > 0 && <> &middot; <strong>{selectedDocs.length} selected</strong></>}
        </span>
        {!search && (
          <a
            href={`${pagePath}#${block.anchor}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
          >
            View on site <ExternalLink className="h-3 w-3" />
          </a>
        )}
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

      {search ? (
        search.headingHits.length === 0 && search.titleHits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-admin-border bg-admin-bg px-4 py-10 text-center text-sm text-slate-500">
            Nothing {view === "live" ? `on the ${pageName}` : "deleted"} matches &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <div className="space-y-5">
            {search.headingHits.length > 0 && (
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Headings (folders)</p>
                {search.headingHits.map(({ block: b, heading: h }) => headingCard(b, h, b.title))}
              </section>
            )}
            {search.titleHits.length > 0 && (
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                <ul className="divide-y divide-admin-border overflow-hidden rounded-xl border border-admin-border bg-white">
                  {titleHits.map((g) => {
                    // One copy: a plain row with where it is.
                    if (g.entries.length === 1) return docRow(g.entries[0].doc, { showPlaces: true })
                    // The same name in several places: one row, every copy
                    // in a dropdown so the right one(s) can be picked.
                    const key = `title::${g.key}`
                    const isOpen = open.has(key)
                    const ids = g.entries.map((e) => e.doc.id)
                    const where = [...new Set(g.entries.flatMap((e) => e.places.map(placeText)))]
                    return (
                      <li key={key}>
                        <div className="flex items-center gap-3 px-4 py-2 pl-11 text-sm">
                          {groupBox(ids, `Select every copy of ${g.title}`)}
                          <button
                            type="button"
                            onClick={() => toggleSet(setOpen, key)}
                            aria-expanded={isOpen}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-slate-800" title={g.title}>{g.title}</span>
                              <span className="block truncate text-xs text-slate-500">{where.join(" · ")}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              {g.entries.length} copies {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </span>
                          </button>
                        </div>
                        {isOpen && (
                          <ul className="divide-y divide-admin-border border-t border-admin-border bg-admin-bg/40">
                            {g.entries.map((e, i) => {
                              // Copies often sit side by side with the same date;
                              // whether the file itself is the same is what tells
                              // a true duplicate (delete either) from two papers
                              // that only share a name.
                              const twin = g.entries.findIndex((o) => o.doc.fileUrl && o.doc.fileUrl === e.doc.fileUrl)
                              const note = twin < i ? `same file as copy ${twin + 1}` : g.entries.some((o, j) => j !== i && o.doc.fileUrl === e.doc.fileUrl) ? "same file as another copy" : "different file"
                              return docRow(e.doc, {
                                titleText: `Copy ${i + 1} - ${e.places.map(placeText).join(" · ")}`,
                                hidePlaces: true,
                                note,
                              })
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {titleHits.length < search.titleHits.length && (
                  <button type="button" onClick={() => setMoreResults(true)} className="text-xs font-semibold text-admin-primary hover:underline">
                    Show all {search.titleHits.length} names
                  </button>
                )}
              </section>
            )}
          </div>
        )
      ) : (
        <>
          {view === "live" && extras?.[block.id] && extras[block.id].count > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              <span>
                This block also shows <strong>{extras[block.id].count}</strong> item
                {extras[block.id].count === 1 ? "" : "s"} {extras[block.id].text}. They are edited and removed there,
                not here.
              </span>
              {extras[block.id].onAction && (
                <button
                  type="button"
                  onClick={extras[block.id].onAction}
                  className="rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-primary-dark"
                >
                  {extras[block.id].actionLabel ?? "Open"}
                </button>
              )}
            </div>
          )}
          {block.headings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border bg-admin-bg px-4 py-10 text-center text-sm text-slate-500">
          {view === "live"
            ? (extras?.[block.id]?.count ?? 0) > 0
              ? "No uploaded documents in this block - only the items above."
              : "Nothing in this block."
            : "Nothing deleted from this block."}
        </p>
      ) : (
            <div className="space-y-2">{block.headings.map((h) => headingCard(block, h))}</div>
          )}
        </>
      )}
    </div>
  )
}
