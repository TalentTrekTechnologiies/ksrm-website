"use client"

import { ReactNode } from "react"
import { Pencil, Trash2, RotateCcw, Inbox } from "lucide-react"
import { CmsListTimestamp } from "@/components/admin/cms/CmsRecordMeta"

export interface CmsCardGridItem {
  id: number
  isActive: boolean
  deletedAt: string | null
  /** Optional: rendered as an "Added/Updated <date>" line under each card. */
  createdAt?: string | null
  updatedAt?: string | null
}

/**
 * Card-grid counterpart to CmsTable - the default view for small, visual,
 * curated CMS lists (testimonials, campus videos, accreditation badges,
 * recruiter logos, department teasers) where a data table hides the thing
 * editors actually need to see to edit confidently: the photo/thumbnail/
 * logo. `renderCard` supplies only the visual body (image + key text) - the
 * surrounding card chrome (selection checkbox, status badge, Edit/Delete/
 * Restore actions) is rendered consistently here, same split of
 * responsibility as CmsDragList's `renderRow`.
 *
 * Selection (checkbox + highlighted border) is opt-in via `selectedIds` /
 * `onToggleSelect` - omit both for a plain, unselectable grid.
 */
export default function CmsCardGrid<T extends CmsCardGridItem>({
  items,
  renderCard,
  onEdit,
  onDelete,
  onRestore,
  onDeleteForever,
  selectedIds,
  onToggleSelect,
  emptyTitle = "No items yet",
  emptyDescription,
}: {
  items: T[]
  renderCard: (item: T) => ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRestore?: (item: T) => void
  /** Shown only on already-deleted rows. Omit to keep a module restore-only. */
  onDeleteForever?: (item: T) => void
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
  emptyTitle?: string
  emptyDescription?: string
}) {
  const selectable = selectedIds !== undefined && onToggleSelect !== undefined

  if (items.length === 0) {
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const isDeleted = item.deletedAt !== null
        const isSelected = selectable && selectedIds!.has(item.id)

        return (
          <div
            key={item.id}
            style={{ boxShadow: "var(--shadow-admin-card)" }}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-[var(--shadow-admin-card-hover)] ${
              isSelected ? "border-admin-primary ring-2 ring-admin-primary/20" : "border-admin-border"
            }`}
          >
            {selectable && (
              <label className="absolute left-2.5 top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-white/90 shadow">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect!(item.id)}
                  className="h-3.5 w-3.5 rounded border-admin-border text-admin-primary"
                  aria-label="Select"
                />
              </label>
            )}

            {!isDeleted && !item.isActive && (
              <span className="absolute right-2.5 top-2.5 z-10 rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 shadow">
                Inactive
              </span>
            )}
            {isDeleted && (
              <span className="absolute right-2.5 top-2.5 z-10 rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50 shadow">
                Deleted
              </span>
            )}

            <div className="flex-1">{renderCard(item)}</div>

            {/* When this record was added or last changed - so a list can be
                scanned for recency without opening each card. */}
            {(item.createdAt || item.updatedAt) && (
              <div className="px-3 pb-1">
                <CmsListTimestamp createdAt={item.createdAt} updatedAt={item.updatedAt} />
              </div>
            )}

            <div className="flex items-center justify-end gap-1 border-t border-admin-border px-2 py-1.5">
              {isDeleted ? (
                <>
                  {onRestore && (
                    <button
                      type="button"
                      onClick={() => onRestore(item)}
                      aria-label="Restore"
                      className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-emerald-600"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  {/* Deleted rows previously offered ONLY "Restore", so an
                      admin who deleted something by mistake - or deliberately -
                      could never get it out of the recycle view. This is the
                      permanent removal, deliberately styled as destructive and
                      only ever shown on already-soft-deleted rows. */}
                  {onDeleteForever && (
                    <button
                      type="button"
                      onClick={() => onDeleteForever(item)}
                      aria-label="Delete permanently"
                      title="Delete permanently"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label="Edit"
                      className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-admin-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      aria-label="Delete"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
