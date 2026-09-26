"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-900">
      <p className="mb-1 font-semibold">
        There is an easier way to add a syllabus.
      </p>
      <p>
        On{" "}
        <Link href="/admin/academics" className="font-semibold underline">
          Academics &rarr; Syllabus
        </Link>{" "}
        you pick the branch and the regulation and upload the file there, and
        nothing depends on how it is named.
      </p>
      {typed !== "" && (
        <p className="mt-1.5">
          Uploaded from this form instead, it is filed by the words in the title.
          This one{" "}
          {ok ? (
            <>
              would appear under{" "}
              <span className="font-semibold">{matchedBranches.join(", ")}</span>, in{" "}
              <span className="font-semibold">{matchedCodes.join(" and ")}</span>.
            </>
          ) : (
            <>
              matches {matchedBranches.length === 0 ? "no branch" : "no regulation"},
              so it would be grouped as &quot;Other&quot;.
            </>
          )}
        </p>
      )}
    </div>
  )
}
