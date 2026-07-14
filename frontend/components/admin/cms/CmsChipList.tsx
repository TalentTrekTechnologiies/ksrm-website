"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

/**
 * Structured "add a branch" chip list - e.g. Admissions program branches
 * (["CSE", "ECE", ...]). Not a comma-separated text field: each entry is
 * added/removed individually, so a content editor can add "AI & DS" without
 * touching anything else.
 */
export default function CmsChipList({
  label,
  items,
  onChange,
  placeholder = "Add a branch...",
  error,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  error?: string
}) {
  const [draft, setDraft] = useState("")

  function commit() {
    const value = draft.trim()
    if (!value || items.includes(value)) {
      setDraft("")
      return
    }
    onChange([...items, value])
    setDraft("")
  }

  function remove(item: string) {
    onChange(items.filter((i) => i !== item))
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-white p-2 ${error ? "border-red-300" : "border-admin-border"}`}>
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 rounded-full bg-admin-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-admin-primary"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              aria-label={`Remove ${item}`}
              className="rounded-full p-0.5 hover:bg-admin-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
          placeholder={items.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none px-1 py-1 text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={commit}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-admin-primary hover:bg-admin-primary/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
