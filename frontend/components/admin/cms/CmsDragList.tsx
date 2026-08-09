"use client"

import { ReactNode } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, RotateCcw } from "lucide-react"

export interface CmsDragListItem {
  id: number
  /** Optional: some modules (e.g. learning outcomes) have no active/inactive
   *  column, so the "Inactive" badge is simply not shown for them. */
  isActive?: boolean
  deletedAt: string | null
}

function SortableRow<T extends CmsDragListItem>({
  item,
  children,
  onEdit,
  onDelete,
  onRestore,
}: {
  item: T
  children: ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRestore?: (item: T) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isDeleted = item.deletedAt !== null

  return (
    // The whole row is the drag handle, not just the grip - a 16px target was
    // easy to miss, and picking a row up from wherever the cursor happens to be
    // is what people expect from a list like this.
    //
    // Safe for the buttons on the right: PointerSensor only starts a drag after
    // 4px of movement, so a click still reaches them. touch-none keeps a
    // touchscreen drag from scrolling the page instead of moving the row.
    <li
      ref={setNodeRef}
      style={style}
      className={`flex touch-none items-center gap-3 rounded-xl border bg-white px-3 py-3 transition-colors ${
        isDragging
          ? "border-admin-primary shadow-lg"
          : "border-admin-border hover:border-slate-300 hover:bg-admin-bg/40"
      } cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      <span aria-hidden="true" className="shrink-0 text-slate-300">
        <GripVertical className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">{children}</div>

      {!isDeleted && item.isActive === false && (
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">
          Inactive
        </span>
      )}
      {isDeleted && (
        <span className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50">
          Deleted
        </span>
      )}

      <div className="flex shrink-0 items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
        {isDeleted ? (
          onRestore && (
            <button
              type="button"
              onClick={() => onRestore(item)}
              aria-label="Restore"
              className="rounded-lg p-2 text-slate-400 hover:bg-admin-bg hover:text-emerald-600"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )
        ) : (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label="Edit"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-admin-bg hover:text-admin-primary"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                aria-label="Delete"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </li>
  )
}

export default function CmsDragList<T extends CmsDragListItem>({
  items,
  onReorder,
  renderRow,
  onEdit,
  onDelete,
  onRestore,
  emptyLabel = "Nothing here yet.",
}: {
  items: T[]
  onReorder: (items: T[]) => void
  renderRow: (item: T) => ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRestore?: (item: T) => void
  emptyLabel?: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">{emptyLabel}</p>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <SortableRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore}>
              {renderRow(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
