"use client"

import { ReactNode } from "react"
import { Plus, Trash2, ChevronUp, ChevronDown, Inbox } from "lucide-react"

/**
 * The generalized "M1/M2/M3 add/remove card" pattern - Mission points,
 * About paragraphs/highlights/statistics, and any future dynamic-list
 * content all use this one component instead of four bespoke ones. Plain
 * up/down buttons for reordering (not drag-and-drop): items here are
 * arbitrary-shaped plain data (strings, {code,text}, ...) with no stable id
 * the way database rows have, so dnd-kit's identity-tracking doesn't apply
 * cleanly - these lists are also typically 2-8 items, where buttons are
 * just as fast as dragging.
 */
export default function CmsDynamicList<T>({
  items,
  onChange,
  newItem,
  renderItem,
  itemLabel,
  emptyTitle,
  emptyDescription,
  maxItems,
}: {
  items: T[]
  onChange: (items: T[]) => void
  newItem: () => T
  renderItem: (item: T, index: number, update: (item: T) => void) => ReactNode
  itemLabel: string
  emptyTitle: string
  emptyDescription: string
  maxItems?: number
}) {
  function add() {
    onChange([...items, newItem()])
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }
  function update(index: number, item: T) {
    onChange(items.map((existing, i) => (i === index ? item : existing)))
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const canAddMore = maxItems === undefined || items.length < maxItems

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-admin-border bg-admin-bg py-8 text-center">
          <Inbox className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">{emptyTitle}</p>
          <p className="mb-3 text-xs text-slate-400">{emptyDescription}</p>
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Add {itemLabel}
          </button>
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border border-admin-border bg-white p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {itemLabel} {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="rounded p-1 text-slate-400 hover:bg-admin-bg hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label="Move down"
                    className="rounded p-1 text-slate-400 hover:bg-admin-bg hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Delete"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {renderItem(item, index, (updated) => update(index, updated))}
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={add}
              className="flex items-center gap-1.5 text-sm font-medium text-admin-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Add {itemLabel}
            </button>
          )}
        </>
      )}
    </div>
  )
}
