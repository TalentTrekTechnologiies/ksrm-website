"use client"

import { useEffect, useState } from "react"
import {
  getSyllabusProgrammesPublic,
  SyllabusProgramme,
} from "@/lib/syllabus-api"
import {
  getDepartmentProgrammesPublic,
  DepartmentProgramme,
} from "@/lib/department-programmes-api"
import { docMatchesBranch, docMatchesReg } from "@/lib/syllabus-matching"

/**
 * Tells an admin where a syllabus document is about to be filed, while they
 * are still typing its title.
 *
 * A syllabus PDF has no branch field and no regulation field - the upload form
 * is a Title box, a Category and a file. The public page works out where it
 * belongs from the words in the title, and a title that matches nothing lands
 * quietly under "Other". So the obvious question on opening that form is
 * "where do I choose ECE?", and nothing on the screen answers it.
 *
 * This answers it by doing the real matching, with the real branches and the
 * real regulations, and saying the outcome in a sentence.
 */
export default function SyllabusTitleHint({ title }: { title: string }) {
  const [syllabus, setSyllabus] = useState<SyllabusProgramme[] | null>(null)
  const [branches, setBranches] = useState<DepartmentProgramme[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getSyllabusProgrammesPublic().catch(() => [] as SyllabusProgramme[]),
      getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    ]).then(([s, b]) => {
      if (cancelled) return
      setSyllabus(s)
      setBranches(b)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (syllabus === null) return null

  const typed = title.trim()

  // Every branch any heading would list, so the hint covers the whole page
  // rather than one programme.
  const listedBranches = new Set<string>()
  for (const programme of syllabus) {
    if (!programme.level) continue
    const needle = programme.nameContains?.trim().toLowerCase()
    for (const b of branches) {
      if (b.level !== programme.level || b.isActive === false) continue
      if (needle && !b.name.toLowerCase().includes(needle)) continue
      listedBranches.add(b.name)
    }
  }

  const codes = [
    ...new Set(
      syllabus.flatMap((p) =>
        p.regulations.filter((r) => r.isActive !== false && !r.deletedAt).map((r) => r.code),
      ),
    ),
  ]

  const matchedBranches = [...listedBranches].filter((b) => docMatchesBranch(typed, b)).sort()
  const matchedCodes = codes.filter((c) => docMatchesReg(typed, c))

  const ok = matchedBranches.length > 0 && matchedCodes.length > 0

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 text-xs ${
        typed && ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <p className="mb-1 font-semibold">
        There is no branch to pick - the title decides it.
      </p>
      {typed === "" ? (
        <p>
          Put the branch and the regulation in the Title, e.g.{" "}
          <span className="font-semibold">I &amp; II SEM R23 ECE</span>.
        </p>
      ) : ok ? (
        <p>
          This will appear under{" "}
          <span className="font-semibold">{matchedBranches.join(", ")}</span>, in{" "}
          <span className="font-semibold">{matchedCodes.join(" and ")}</span>.
        </p>
      ) : (
        <p>
          {matchedBranches.length === 0 && (
            <>
              No branch recognised in this title, so it will show under every branch
              it is not filed to as &quot;Other&quot;. Add one of:{" "}
              <span className="font-semibold">
                {[...listedBranches].sort().slice(0, 8).join(", ") || "none configured yet"}
              </span>
              {listedBranches.size > 8 ? ", …" : ""}.{" "}
            </>
          )}
          {matchedCodes.length === 0 && (
            <>
              No regulation code recognised, so it will be grouped as
              &quot;Other&quot;. Known codes:{" "}
              <span className="font-semibold">
                {codes.join(", ") || "none added yet"}
              </span>
              .
            </>
          )}
        </p>
      )}
    </div>
  )
}
