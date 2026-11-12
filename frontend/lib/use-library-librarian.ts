"use client"

import { getFacultyPublic, Faculty } from "./faculty-api"
import { useLiveData } from "./use-live-data"

const SECTION = "Central Library"

/**
 * The Central Library's Librarian - the Faculty record flagged isHod for the
 * Central Library department. Shared by LibrarianProfile and the page's own
 * "Contact" card so both name mentions come from the one record instead of
 * drifting into two different answers for who the Librarian is.
 *
 * `undefined` while the staff list is loading, `null` once it has loaded and
 * no one is flagged. The two used to be the same, so the page showed the
 * previous Librarian's built-in details for a moment before every visit -
 * a different person from the one in the CMS.
 */
export function useLibrarian(): Faculty | null | undefined {
  const staff = useLiveData<Faculty[]>(
    () => getFacultyPublic(SECTION).catch(() => [] as Faculty[]),
    [],
  )
  if (staff === null) return undefined
  return staff.find((s) => s.isHod) ?? null
}
