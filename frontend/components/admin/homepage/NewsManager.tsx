"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, AlertTriangle, Star } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsStatusBadge from "@/components/admin/cms/CmsStatusBadge"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import SectionVisibilityToggle from "@/components/admin/cms/SectionVisibilityToggle"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getNewsAdmin,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  restoreNewsArticle,
  NewsArticle,
} from "@/lib/news-api"

interface FormState {
  title: string
  content: string
  category: string
  imageUrl: string
  mediaId: number | null
  date: string
  isPublished: boolean
  isFeatured: boolean
  videoUrl: string
  videoMediaId: number | null
  documentUrl: string
  documentMediaId: number | null

}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm: FormState = {
  title: "",
  content: "",
  category: "Examinations",
  imageUrl: "",
  mediaId: null,
  date: todayIso(),
  isPublished: true,
  isFeatured: false,
  videoUrl: "",
  videoMediaId: null,
  documentUrl: "",
  documentMediaId: null,

}

const CATEGORY_OPTIONS = ["Examinations", "Results", "Event", "Admissions", "Placements", "General"].map((c) => ({
  value: c,
  label: c,
}))

function NewsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<NewsArticle[]>([])
  const [editing, setEditing] = useState<NewsArticle | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  async function refresh() {
    try {
      setItems(await getNewsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load news articles")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getNewsAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load news articles")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: NewsArticle) {
    setEditing(item)
    setCreating(false)
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl ?? "",
      videoUrl: item.videoUrl ?? "",
      videoMediaId: item.videoMediaId,
      documentUrl: item.documentUrl ?? "",
      documentMediaId: item.documentMediaId,
      mediaId: item.mediaId,
      date: item.date.slice(0, 10),
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        title: form.title,
        content: form.content,
        category: form.category,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        videoMediaId: form.videoMediaId,
        documentUrl: form.documentUrl || null,
        documentMediaId: form.documentMediaId,
        mediaId: form.mediaId,
        date: form.date,
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      }
      if (editing) {
        await updateNewsArticle(editing.id, { ...dto, version: editing.version })
      } else {
        await createNewsArticle(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save article")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: NewsArticle) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteNewsArticle(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete article")
    }
  }

  async function handleRestore(item: NewsArticle) {
    try {
      await restoreNewsArticle(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore article")
    }
  }

  async function toggleFeatured(item: NewsArticle) {
    try {
      await updateNewsArticle(item.id, { isFeatured: !item.isFeatured, version: item.version })
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update article")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<NewsArticle>[] = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) =>
        row.original.imageUrl ? (
          <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.original.imageUrl} alt={row.original.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
          </div>
        ) : (
          <div className="h-10 w-14 rounded-lg bg-admin-bg" />
        ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[240px] truncate font-medium text-slate-800">{row.original.title}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "category", header: "Category" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <CmsStatusBadge status={row.original.isPublished ? "PUBLISHED" : "DRAFT"} />,
    },
    {
      id: "date",
      header: "Publish Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      id: "views",
      header: "Views",
      cell: () => <span className="text-slate-300">—</span>,
    },
    {
      id: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => toggleFeatured(row.original)}
          disabled={!!row.original.deletedAt}
          aria-label={row.original.isFeatured ? "Unfeature" : "Feature"}
        >
          <Star className={`h-4 w-4 ${row.original.isFeatured ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        </button>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <button type="button" onClick={() => handleRestore(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
            Restore
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => startEdit(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(row.original)} className="text-xs font-semibold text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ),
    },
  ]

  if (loading) {
    return <CmsTableSkeleton />
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            News
          </h1>
          <p className="text-sm text-slate-500">
            The Featured column controls which stories the homepage&apos;s Latest News section shows first.
          </p>
        </div>
        <SectionVisibilityToggle sectionKey="latestNews" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit article" : "New article"}</p>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={300} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORY_OPTIONS} required />
            <TextField label="Publish date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required placeholder="YYYY-MM-DD" />
          </div>
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, imageUrl: url, mediaId })}
            accept={["IMAGE"]}
            urlPlaceholder="/news/article-1.jpg"
          />
          {/* Optional extras. News and events also cover newspaper clippings,
              interviews and recorded coverage, so each item can carry a video
              and a downloadable document as well as its image. */}
          <MediaField
            label="Video (optional)"
            url={form.videoUrl}
            mediaId={form.videoMediaId}
            onChange={(url, mediaId) => setForm({ ...form, videoUrl: url, videoMediaId: mediaId })}
            accept={["VIDEO"]}
          />
          <MediaField
            label="Document (optional)"
            url={form.documentUrl}
            mediaId={form.documentMediaId}
            onChange={(url, mediaId) => setForm({ ...form, documentUrl: url, documentMediaId: mediaId })}
            accept={["DOCUMENT"]}
          />
          <TextAreaField label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} required rows={5} />
          <div className="flex flex-wrap gap-6">
            <ToggleField label="Published" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
            <ToggleField label="Featured" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
          </div>
          <FormActions>
            {editing && (
              <DangerButton onClick={() => handleDelete(editing)}>Delete</DangerButton>
            )}
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.content || !form.category}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search articles..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add article
          </button>
        }
      />

      <CmsTable
        data={filtered}
        columns={columns}
        emptyTitle="No news articles yet"
        emptyDescription="Add your first article - it's an honest, valid state for the homepage to show its fallback content until you do."
        pageSize={15}
      />
    </div>
  )
}

export default function NewsManager() {
  return (
    <PermissionGate permission="news.view">
      <NewsManagerInner />
    </PermissionGate>
  )
}
