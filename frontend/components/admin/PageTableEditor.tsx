"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2, Table as TableIcon } from "lucide-react"
import { TextField, PrimaryButton, SecondaryButton, FormActions } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getPageTablesAdmin,
  createPageTable,
  updatePageTable,
  deletePageTable,
  PageTable,
} from "@/lib/page-tables-api"

/**
 * Edits the text tables a page renders (fee structures, courses & intake, ...).
 * Cells are plain inputs in a grid mirroring the public table, so an admin
 * edits what they see. Columns are free-form, so this one editor serves every
 * table without per-page code.
 */
/**
 * Pages whose content is genuinely tabular - these offer "Add table" even when
 * empty. Every other page only shows this section once it actually has a table,
 * so the editor doesn't clutter the ~40 pages that will never need one.
 */
const TABLE_CAPABLE_PAGES = new Set([
  "academics.fee-structure",
  "academics.courses-intake",
  "academics.regulations",
  "admissions",
  "admissions.ug",
  "admissions.pg",
  "admissions.diploma",
])

export default function PageTableEditor({ pageSection }: { pageSection: string }) {
  const { confirm, notifySaved } = useCmsConfirm()
  const [tables, setTables] = useState<PageTable[] | null>(null)
  const [drafts, setDrafts] = useState<Record<number, { title: string; columns: string[]; rows: string[][]; footnote: string }>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newColumns, setNewColumns] = useState("Column 1, Column 2")

  async function load() {
    try {
      const rows = await getPageTablesAdmin(pageSection)
      setTables(rows)
      const d: typeof drafts = {}
      for (const t of rows) {
        d[t.id] = { title: t.title, columns: [...t.columns], rows: t.rows.map((r) => [...r]), footnote: t.footnote ?? "" }
      }
      setDrafts(d)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tables")
      setTables([])
    }
  }

  useEffect(() => {
    setTables(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSection])

  function setCell(tableId: number, r: number, c: number, value: string) {
    setDrafts((prev) => {
      const d = prev[tableId]
      if (!d) return prev
      const rows = d.rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? value : cell)) : row))
      return { ...prev, [tableId]: { ...d, rows } }
    })
  }

  function addRow(tableId: number) {
    setDrafts((prev) => {
      const d = prev[tableId]
      if (!d) return prev
      return { ...prev, [tableId]: { ...d, rows: [...d.rows, d.columns.map(() => "")] } }
    })
  }

  function removeRow(tableId: number, r: number) {
    setDrafts((prev) => {
      const d = prev[tableId]
      if (!d) return prev
      return { ...prev, [tableId]: { ...d, rows: d.rows.filter((_, i) => i !== r) } }
    })
  }

  async function save(t: PageTable) {
    const d = drafts[t.id]
    if (!d) return
    if (!(await confirm({ title: "Save changes?", message: "Save this table? It goes live on the public page straight away.", confirmLabel: "Save" }))) return
    setSavingId(t.id)
    setError(null)
    try {
      await updatePageTable(t.id, {
        title: d.title,
        columns: d.columns,
        rows: d.rows,
        footnote: d.footnote || undefined,
        version: t.version,
      })
      await load()
      notifySaved("Table saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save the table")
    } finally {
      setSavingId(null)
    }
  }

  async function removeTable(t: PageTable) {
    if (!(await confirm({ title: "Delete", message: `Delete the "${t.title}" table? This cannot be undone.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deletePageTable(t.id)
      await load()
      notifySaved("Table deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete")
    }
  }

  async function addTable() {
    const columns = newColumns.split(",").map((c) => c.trim()).filter(Boolean)
    if (!newTitle || columns.length === 0) return
    setError(null)
    try {
      await createPageTable({
        // Key just has to be unique and stable; derived from the section+title.
        key: `${pageSection}.${newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
        pageSection,
        title: newTitle,
        columns,
        rows: [columns.map(() => "")],
        sortOrder: tables?.length ?? 0,
        isActive: true,
      })
      setCreating(false)
      setNewTitle("")
      setNewColumns("Column 1, Column 2")
      await load()
      notifySaved("Table added.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add the table")
    }
  }

  if (tables === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-admin-primary" />
      </div>
    )
  }

  // Nothing to manage and this page isn't one that uses tables - render nothing
  // rather than an empty "Text tables (0)" box on every page.
  if (tables.length === 0 && !TABLE_CAPABLE_PAGES.has(pageSection)) return null

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <TableIcon className="h-4 w-4" /> Text tables ({tables.length})
        </h3>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-admin-bg"
          >
            <Plus className="h-4 w-4" /> Add table
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {creating && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="mb-3 space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">New table</p>
          <TextField label="Table title" value={newTitle} onChange={setNewTitle} required placeholder="B.Tech (First Year)" />
          <TextField
            label="Columns (comma separated)"
            value={newColumns}
            onChange={setNewColumns}
            required
            helperText="e.g. Branch, Annual Fee, Admission Fee, Notes"
          />
          <FormActions>
            <SecondaryButton onClick={() => setCreating(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={addTable} disabled={!newTitle || !newColumns.trim()}>Add</PrimaryButton>
          </FormActions>
        </div>
      )}

      {tables.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border p-5 text-center text-sm text-slate-400">
          No text tables on this page yet.
        </p>
      ) : (
        <div className="space-y-5">
          {tables.map((t) => {
            const d = drafts[t.id]
            if (!d) return null
            return (
              <div key={t.id} style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={d.title}
                    onChange={(e) => setDrafts((p) => ({ ...p, [t.id]: { ...d, title: e.target.value } }))}
                    className="flex-1 rounded-lg border border-admin-border px-3 py-2 text-sm font-semibold text-slate-800"
                    aria-label="Table title"
                  />
                  <button type="button" onClick={() => removeTable(t)} aria-label="Delete table" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr>
                        {d.columns.map((c, ci) => (
                          <th key={ci} className="border border-admin-border bg-admin-bg px-2 py-1.5 text-left text-xs font-semibold text-slate-600">
                            {c}
                          </th>
                        ))}
                        <th className="w-8 border border-admin-border bg-admin-bg" />
                      </tr>
                    </thead>
                    <tbody>
                      {d.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border border-admin-border p-0">
                              <input
                                value={cell}
                                onChange={(e) => setCell(t.id, ri, ci, e.target.value)}
                                className="w-full bg-transparent px-2 py-1.5 text-sm text-slate-700 outline-none focus:bg-admin-bg"
                                aria-label={`${d.columns[ci]} row ${ri + 1}`}
                              />
                            </td>
                          ))}
                          <td className="border border-admin-border text-center">
                            <button type="button" onClick={() => removeRow(t.id, ri)} aria-label="Remove row" className="p-1 text-slate-300 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => addRow(t.id)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add row
                  </button>
                  <PrimaryButton onClick={() => save(t)} disabled={savingId === t.id}>
                    {savingId === t.id ? "Saving…" : "Save table"}
                  </PrimaryButton>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
