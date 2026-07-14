"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Folder, FolderPlus, Pencil, Trash2, X, Check } from "lucide-react"
import type { MediaFolder } from "@/lib/media-api"

interface TreeNode {
  folder: MediaFolder
  children: TreeNode[]
}

function buildTree(folders: MediaFolder[]): TreeNode[] {
  const byParent = new Map<number | null, MediaFolder[]>()
  for (const folder of folders) {
    const key = folder.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(folder)
  }
  function build(parentId: number | null): TreeNode[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({ folder, children: build(folder.id) }))
  }
  return build(null)
}

/**
 * Folder tree sidebar for the Media Library - built from a flat
 * `MediaFolder[]` (parentId-linked) rather than the backend returning a
 * nested shape, so it stays a plain, cacheable list on the wire. Folders
 * are not media-type-gated (an admin can mix images/videos/documents in
 * one folder) - see the Media Library backend design notes.
 */
export default function CmsFolderTree({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: {
  folders: MediaFolder[]
  selectedFolderId: number | null
  onSelect: (id: number | null) => void
  onCreateFolder?: (name: string, parentId: number | null) => void
  onRenameFolder?: (id: number, name: string) => void
  onDeleteFolder?: (id: number) => void
}) {
  const tree = useMemo(() => buildTree(folders), [folders])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [creatingUnder, setCreatingUnder] = useState<number | null | "none">("none")
  const [createValue, setCreateValue] = useState("")

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startRename(folder: MediaFolder) {
    setRenamingId(folder.id)
    setRenameValue(folder.name)
  }

  function confirmRename() {
    if (renamingId !== null && renameValue.trim() && onRenameFolder) {
      onRenameFolder(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }

  function confirmCreate(parentId: number | null) {
    if (createValue.trim() && onCreateFolder) {
      onCreateFolder(createValue.trim(), parentId)
    }
    setCreateValue("")
    setCreatingUnder("none")
  }

  function renderNode(node: TreeNode, depth: number) {
    const isExpanded = expanded.has(node.folder.id)
    const isSelected = selectedFolderId === node.folder.id
    const isRenaming = renamingId === node.folder.id

    return (
      <div key={node.folder.id}>
        <div
          className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
            isSelected ? "bg-admin-primary/10 text-admin-primary font-semibold" : "text-slate-600 hover:bg-admin-bg"
          }`}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {node.children.length > 0 ? (
            <button type="button" onClick={() => toggle(node.folder.id)} className="shrink-0 text-slate-400">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0" />

          {isRenaming ? (
            <span className="flex flex-1 items-center gap-1">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                className="min-w-0 flex-1 rounded border border-admin-primary px-1 py-0.5 text-xs"
              />
              <button type="button" onClick={confirmRename} aria-label="Confirm rename">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </button>
              <button type="button" onClick={() => setRenamingId(null)} aria-label="Cancel rename">
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.folder.id)}
              className="min-w-0 flex-1 truncate text-left"
            >
              {node.folder.name}
            </button>
          )}

          {!isRenaming && (
            <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
              {onCreateFolder && (
                <button
                  type="button"
                  onClick={() => setCreatingUnder(node.folder.id)}
                  aria-label="New subfolder"
                  className="rounded p-1 text-slate-400 hover:text-admin-primary"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              )}
              {onRenameFolder && (
                <button
                  type="button"
                  onClick={() => startRename(node.folder)}
                  aria-label="Rename folder"
                  className="rounded p-1 text-slate-400 hover:text-admin-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDeleteFolder && (
                <button
                  type="button"
                  onClick={() => onDeleteFolder(node.folder.id)}
                  aria-label="Delete folder"
                  className="rounded p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          )}
        </div>

        {creatingUnder === node.folder.id && (
          <div className="flex items-center gap-1" style={{ paddingLeft: 26 + depth * 16 }}>
            <input
              autoFocus
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmCreate(node.folder.id)}
              placeholder="Folder name"
              className="min-w-0 flex-1 rounded border border-admin-primary px-1 py-0.5 text-xs"
            />
            <button type="button" onClick={() => confirmCreate(node.folder.id)} aria-label="Confirm new folder">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button type="button" onClick={() => setCreatingUnder("none")} aria-label="Cancel new folder">
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        )}

        {isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm ${
          selectedFolderId === null ? "bg-admin-primary/10 text-admin-primary font-semibold" : "text-slate-600 hover:bg-admin-bg"
        }`}
      >
        <Folder className="h-3.5 w-3.5" /> All Media
      </button>

      {tree.map((node) => renderNode(node, 0))}

      {onCreateFolder && (
        creatingUnder === null ? (
          <div className="flex items-center gap-1 px-2">
            <input
              autoFocus
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmCreate(null)}
              placeholder="Folder name"
              className="min-w-0 flex-1 rounded border border-admin-primary px-1 py-0.5 text-xs"
            />
            <button type="button" onClick={() => confirmCreate(null)} aria-label="Confirm new folder">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button type="button" onClick={() => setCreatingUnder("none")} aria-label="Cancel new folder">
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreatingUnder(null)}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-admin-primary hover:bg-admin-bg"
          >
            <FolderPlus className="h-3.5 w-3.5" /> New root folder
          </button>
        )
      )}
    </div>
  )
}
