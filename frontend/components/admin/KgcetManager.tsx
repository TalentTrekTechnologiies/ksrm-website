"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ExternalLink, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import {
  TextField,
  TextAreaField,
  NumberField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getKgcetAdmin,
  createKgcet,
  updateKgcet,
  deleteKgcet,
  restoreKgcet,
  reorderKgcet,
  KgcetParticipation,
  KgcetHighlight,
} from "@/lib/kgcet-api"

/**
 * KGCET's own screen.
 *
 * The scholarship test's two tables used to be reachable only as loose text
 * slots in Page Content - publishing this year's turnout meant finding
 * "participation.4.attended" among sixty text boxes and typing a number into
 * it. Numbers belong in number fields, and a yearly row belongs in a list you
 * can add a row to.
 *
 * The page's wording, its documents and its committee are still edited where
 * every other page's are, and are linked to from here rather than duplicated -
 * one screen owning KGCET's structured content, not a second half-copy of the
 * whole CMS.
 */

type Tab = "participation" | "highlights"

interface ParticipationForm {
  year: string
  registered: number
  attended: number
  qualified: number
  isActive: boolean
}

interface HighlightForm {
  icon: string
  title: string
  description: string
  isActive: boolean
}

const emptyParticipation: ParticipationForm = {
  year: "",
  registered: 0,
  attended: 0,
  qualified: 0,
  isActive: true,
}

const emptyHighlight: HighlightForm = { icon: "", title: "", description: "", isActive: true }

function KgcetManagerInner() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [tab, setTab] = useState<Tab>("participation")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)

  const [participation, setParticipation] = useState<KgcetParticipation[]>([])
  const [highlights, setHighlights] = useState<KgcetHighlight[]>([])

  // Held per tab so switching tabs cannot leave a half-filled form from the
  // other one open over the wrong list.
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [pForm, setPForm] = useState<ParticipationForm>(emptyParticipation)
  const [hForm, setHForm] = useState<HighlightForm>(emptyHighlight)

  async function refresh() {
    setError(null)
    try {
      const [p, h] = await Promise.all([
        getKgcetAdmin<KgcetParticipation>("participation"),
        getKgcetAdmin<KgcetHighlight>("highlights"),
      ])
      setParticipation(p)
      setHighlights(h)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load KGCET content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function closeForm() {
    setEditingId(null)
    setCreating(false)
    setPForm(emptyParticipation)
    setHForm(emptyHighlight)
  }

  function switchTab(next: Tab) {
    closeForm()
    setTab(next)
  }

  function startEditParticipation(item: KgcetParticipation) {
    setCreating(false)
    setEditingId(item.id)
    setPForm({
      year: item.year,
      registered: item.registered,
      attended: item.attended,
      qualified: item.qualified,
      isActive: item.isActive,
    })
  }

  function startEditHighlight(item: KgcetHighlight) {
    setCreating(false)
    setEditingId(item.id)
    setHForm({
      icon: item.icon ?? "",
      title: item.title,
      description: item.description ?? "",
      isActive: item.isActive,
    })
  }

  async function handleSave() {
    if (
      !(await confirm({
        title: "Save changes?",
        message: "Save your changes? They go live on the public site straight away.",
        confirmLabel: "Save",
      }))
    )
      return

    setSaving(true)
    setError(null)
    try {
      if (tab === "participation") {
        const dto = {
          year: pForm.year.trim(),
          registered: pForm.registered,
          attended: pForm.attended,
          qualified: pForm.qualified,
          isActive: pForm.isActive,
        }
        if (editingId) {
          const current = participation.find((r) => r.id === editingId)!
          await updateKgcet("participation", editingId, { ...dto, version: current.version })
        } else {
          await createKgcet("participation", dto)
        }
      } else {
        const dto = {
          // null, never undefined: an omitted key leaves the column untouched,
          // so clearing the icon or the description would silently not take.
          icon: hForm.icon.trim() || null,
          title: hForm.title.trim(),
          description: hForm.description.trim() || null,
          isActive: hForm.isActive,
        }
        if (editingId) {
          const current = highlights.find((r) => r.id === editingId)!
          await updateKgcet("highlights", editingId, { ...dto, version: current.version })
        } else {
          await createKgcet("highlights", dto)
        }
      }
      closeForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your changes")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, label: string) {
    if (
      !(await confirm({
        title: "Delete",
        message: `Delete "${label}"? You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteKgcet(tab, id)
      await refresh()
      notifySaved("Deleted. You can restore it from this list.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete")
    }
  }

  async function handleRestore(id: number) {
    try {
      await restoreKgcet(tab, id)
      await refresh()
      notifySaved("Restored.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not restore")
    }
  }

  async function handleReorder(items: { id: number }[]) {
    setReordering(true)
    try {
      // The complete list, in its new order - a partial one would renumber
      // these rows from 0 and collide with whatever was left out.
      const rows = await reorderKgcet<KgcetParticipation & KgcetHighlight>(
        tab,
        items.map((i) => i.id),
      )
      if (tab === "participation") setParticipation(rows as KgcetParticipation[])
      else setHighlights(rows as KgcetHighlight[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the new order")
      await refresh()
    } finally {
      setReordering(false)
    }
  }

  const isFormOpen = creating || editingId !== null
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "participation", label: "Participation by year", count: participation.length },
    { id: "highlights", label: "Highlight cards", count: highlights.length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">KGCET</h1>
          <p className="text-sm text-slate-500">
            The Kandula Group Common Entrance Test — the figures and cards shown on the public KGCET
            page.
          </p>
        </div>
        <a
          href="/kgcet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-admin-bg"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View page
        </a>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {/* The rest of KGCET is edited where every other page's is. Linked, not
          duplicated - a second copy of the document uploader here would be one
          more place for a file to go missing. */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-admin-border bg-admin-bg px-4 py-3 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Also part of KGCET:</span>
        <Link href="/admin/page-content?section=kgcet" className="font-semibold text-admin-primary hover:underline">
          page wording
        </Link>
        <span>·</span>
        <Link href="/admin/downloads" className="font-semibold text-admin-primary hover:underline">
          notifications &amp; results (Documents)
        </Link>
        <span>·</span>
        {/* KGCET photographs are ordinary gallery images with the category
            "kgcet" - the page reads exactly that. Linked rather than given a
            second uploader here, so a picture cannot end up in a KGCET-only
            store the Gallery screen knows nothing about. */}
        <Link href="/admin/gallery?category=kgcet" className="font-semibold text-admin-primary hover:underline">
          photographs (Gallery, category &ldquo;kgcet&rdquo;)
        </Link>
        <span>·</span>
        <Link href="/admin/committees" className="font-semibold text-admin-primary hover:underline">
          the KGCET committee
        </Link>
      </div>

      <div className="flex gap-2 border-b border-admin-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs font-medium text-slate-400">{t.count}</span>
          </button>
        ))}
      </div>

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">
            {editingId ? "Edit" : "New"} {tab === "participation" ? "year" : "highlight card"}
          </p>

          {tab === "participation" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <TextField
                  label="Year"
                  value={pForm.year}
                  onChange={(v) => setPForm({ ...pForm, year: v })}
                  required
                  helperText="As shown, e.g. 2026"
                />
                <NumberField
                  label="Registered"
                  value={pForm.registered}
                  onChange={(v) => setPForm({ ...pForm, registered: v })}
                />
                <NumberField
                  label="Attended"
                  value={pForm.attended}
                  onChange={(v) => setPForm({ ...pForm, attended: v })}
                />
                <NumberField
                  label="Qualified"
                  value={pForm.qualified}
                  onChange={(v) => setPForm({ ...pForm, qualified: v })}
                />
              </div>
              <ToggleField
                label="Show on the page"
                checked={pForm.isActive}
                onChange={(v) => setPForm({ ...pForm, isActive: v })}
              />
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
                <TextField
                  label="Icon"
                  value={hForm.icon}
                  onChange={(v) => setHForm({ ...hForm, icon: v })}
                  helperText="One emoji"
                />
                <TextField
                  label="Title"
                  value={hForm.title}
                  onChange={(v) => setHForm({ ...hForm, title: v })}
                  required
                />
              </div>
              <TextAreaField
                label="Description"
                value={hForm.description}
                onChange={(v) => setHForm({ ...hForm, description: v })}
                rows={2}
              />
              <ToggleField
                label="Show on the page"
                checked={hForm.isActive}
                onChange={(v) => setHForm({ ...hForm, isActive: v })}
              />
            </>
          )}

          <FormActions>
            <SecondaryButton onClick={closeForm}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={saving || (tab === "participation" ? !pForm.year.trim() : !hForm.title.trim())}
            >
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {!isFormOpen && (
        <button
          type="button"
          onClick={() => {
            setCreating(true)
            setEditingId(null)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add {tab === "participation" ? "a year" : "a card"}
        </button>
      )}

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        {reordering ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Saving the new order…
          </>
        ) : (
          <>Drag a row to change the order it appears in on the public page.</>
        )}
      </p>

      {tab === "participation" ? (
        <CmsDragList
          items={participation}
          onReorder={handleReorder}
          onEdit={startEditParticipation}
          onDelete={(item) => handleDelete(item.id, item.year)}
          onRestore={(item) => handleRestore(item.id)}
          emptyLabel="No years yet. Add the first one."
          renderRow={(r) => (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <p className="font-medium text-slate-800">{r.year}</p>
              <p className="text-xs text-slate-500">
                {r.registered.toLocaleString()} registered · {r.attended.toLocaleString()} attended ·{" "}
                {r.qualified.toLocaleString()} qualified
              </p>
            </div>
          )}
        />
      ) : (
        <CmsDragList
          items={highlights}
          onReorder={handleReorder}
          onEdit={startEditHighlight}
          onDelete={(item) => handleDelete(item.id, item.title)}
          onRestore={(item) => handleRestore(item.id)}
          emptyLabel="No cards yet. Add the first one."
          renderRow={(r) => (
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-800">
                {r.icon && <span className="mr-1.5">{r.icon}</span>}
                {r.title}
              </p>
              {r.description && <p className="text-xs text-slate-500">{r.description}</p>}
            </div>
          )}
        />
      )}
    </div>
  )
}

export default function KgcetManager() {
  return (
    <PermissionGate permission="kgcet.view">
      <KgcetManagerInner />
    </PermissionGate>
  )
}
