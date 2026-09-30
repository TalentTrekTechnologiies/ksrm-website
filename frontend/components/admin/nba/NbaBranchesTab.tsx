"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Search } from "lucide-react"
import {
  DepartmentProgramme,
  getDepartmentProgrammesAdmin,
  updateDepartmentProgramme,
} from "@/lib/department-programmes-api"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import CmsLoadingState from "@/components/admin/cms/CmsLoadingState"

/**
 * Which branches carry NBA accreditation.
 *
 * Deliberately NOT a list of NBA branches that this screen owns. The branches
 * are the same `DepartmentProgramme` rows that drive Courses & Intake, the
 * department pages and the admissions pages, and a programme is on the NBA
 * page because its own `accreditation` field says NBA. Keeping one row means
 * the NBA page cannot drift from what the college publishes everywhere else -
 * a second list would be two sources of truth for the same fact, and they
 * would disagree within a year.
 *
 * So this screen turns the flag on and off, and the wording of the badge, and
 * nothing else. Creating a programme, its intake and its code stay on
 * Academics and the department screens, where the rest of that record lives.
 */

/** What the public page tests for. Anything matching /nba/i puts the branch on it. */
const NBA_BADGE = "NBA Accredited"
const isNba = (p: DepartmentProgramme) => /nba/i.test(p.accreditation ?? "")

export default function NbaBranchesTab() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<DepartmentProgramme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      const rows = await getDepartmentProgrammesAdmin()
      setItems(rows)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load programmes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Queued rather than started in the effect body: the first statement of
    // `refresh` runs synchronously, and a setState there drives a second
    // render pass before the first has committed.
    let live = true
    queueMicrotask(() => {
      if (live) void refresh()
    })
    return () => {
      live = false
    }
  }, [refresh])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((p) => p.isActive !== false && !p.deletedAt)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.code ?? "").toLowerCase().includes(q) ||
          (p.department?.name ?? "").toLowerCase().includes(q),
      )
      // Accredited first, so the NBA page's contents read off the top.
      .sort((a, b) => Number(isNba(b)) - Number(isNba(a)) || a.name.localeCompare(b.name))
  }, [items, search])

  const accreditedCount = items.filter((p) => p.isActive !== false && isNba(p)).length

  async function toggle(p: DepartmentProgramme) {
    const turningOff = isNba(p)
    if (turningOff) {
      const ok = await confirm({
        title: `Remove ${p.name} from the NBA page?`,
        // Spelled out, because this edits a row that several other pages read.
        message:
          "This clears the programme's accreditation badge, so the NBA badge also disappears from Courses & Intake and the department page. The programme itself is not deleted.",
        confirmLabel: "Remove",
        destructive: true,
      })
      if (!ok) return
    }

    setSavingId(p.id)
    try {
      // Only the field that changes, plus the row's version. Sending the whole
      // record back would let this screen silently overwrite an intake or a
      // code that somebody edited on Academics while this list was open.
      await updateDepartmentProgramme(p.id, {
        accreditation: turningOff ? null : NBA_BADGE,
        version: p.version,
      })
      await refresh()
      notifySaved(turningOff ? `${p.name} removed from NBA` : `${p.name} added to NBA`)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.message} — if somebody else changed this programme, reload and try again.`
          : "Could not update the programme",
      )
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <CmsLoadingState />

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-sm text-slate-600">
        <strong className="text-slate-800">{accreditedCount} branch(es)</strong> currently show on the
        public NBA page. These are the same programme records used by Courses &amp; Intake and the
        department pages — adding one here sets its accreditation badge, it does not create a second
        copy. To add a programme that does not exist yet, create it under{" "}
        <strong>Academics</strong> or its department first.
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branches…"
          className="w-full rounded-lg border border-admin-border bg-white py-2 pl-9 pr-3 text-sm text-slate-700"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-admin-bg text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Branch</th>
              <th className="px-4 py-2.5">Department</th>
              <th className="px-4 py-2.5">Level</th>
              <th className="px-4 py-2.5">Intake</th>
              <th className="px-4 py-2.5 text-right">On the NBA page</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const on = isNba(p)
              return (
                <tr key={p.id} className="border-t border-admin-border">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {p.name}
                    {p.code && <span className="ml-2 text-xs font-normal text-slate-400">{p.code}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{p.department?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{p.level}</td>
                  <td className="px-4 py-2.5 text-slate-600">{p.intake}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      disabled={savingId === p.id}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        on
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-admin-border bg-white text-slate-600 hover:bg-admin-bg"
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                      {savingId === p.id ? "Saving…" : on ? "Accredited" : "Add to NBA"}
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No active programmes match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
