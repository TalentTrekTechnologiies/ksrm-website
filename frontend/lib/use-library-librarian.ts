"use client"

import { getFacultyPublic, Faculty } from "./faculty-api"
import { useLiveData } from "./use-live-data"

const SECTION = "Central Library"

/**
 * The Central Library's Librarian - the Faculty record flagged isHod for the
 * Central Library department. Shared by LibrarianProfile and the page's own
 * "Contact" card so both name mentions come from the one record instead of
 * drifting into two different answers for who the Librarian is.
 */
export function useLibrarian(): Faculty | undefined {
  const staff = useLiveData<Faculty[]>(
    () => getFacultyPublic(SECTION).catch(() => [] as Faculty[]),
    [],
  )
  return staff?.find((s) => s.isHod)
}
