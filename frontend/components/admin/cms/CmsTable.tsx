"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"

/**
 * Sticky-header, paginated, optionally-selectable table - the reusable
 * table every list-shaped CMS page needs (finally putting @tanstack/
 * react-table, installed since Sprint 1A, to use). Built now, not wired
 * into any Sprint 1B page - see CmsToolbar's doc comment for why.
 */
export default function CmsTable<T extends { id: number }>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  emptyTitle = "No data yet",
  emptyDescription,
  pageSize = 10,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.id),
    state: rowSelection !== undefined ? { rowSelection } : undefined,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const next = typeof updater === "function" ? updater(rowSelection ?? {}) : updater
          onRowSelectionChange(next)
        }
      : undefined,
    enableRowSelection: onRowSelectionChange !== undefined,
    initialState: { pagination: { pageSize } },
  })

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-border bg-admin-bg px-6 py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Inbox className="h-5 w-5 text-slate-300" />
        </div>
        <p className="text-[15px] font-semibold text-slate-700">{emptyTitle}</p>
        {emptyDescription && <p className="mt-1 max-w-sm text-sm text-slate-400">{emptyDescription}</p>}
      </div>
    )
  }

  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="overflow-hidden rounded-2xl border border-admin-border bg-white"
    >
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full text-left text-[15px]">
          <thead className="sticky top-0 z-10 bg-admin-bg/95 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-admin-border transition-colors hover:bg-admin-primary/[0.04]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-admin-border px-5 py-3 text-sm text-slate-500">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg p-1.5 transition-colors hover:bg-admin-bg disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg p-1.5 transition-colors hover:bg-admin-bg disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
