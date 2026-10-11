/**
 * True for a value that carries a date but no time.
 *
 * Exam notifications and news are saved with a date only, which the server
 * stores as midnight UTC ("2026-09-25T00:00:00.000Z"). Shown with a time, every
 * one of them read "5:30 am" - midnight UTC in Indian time - which looked like
 * an upload time and was not one.
 */
export function isDateOnly(iso: string): boolean {
  return /T00:00:00(\.0+)?Z$/.test(iso)
}

/**
 * "Published 25 Sep 2026" for a date-only value, "Published 25 Sep 2026,
 * 10:45 am" for a real timestamp. A date-only value is read in UTC so it is
 * the same calendar day everywhere. Unparseable input gives null rather than
 * "Invalid Date".
 */
export function formatPublished(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const dateOnly = isDateOnly(iso)
  const date = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly && { timeZone: "UTC" }),
  })
  if (dateOnly) return `Published ${date}`
  return `Published ${date}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
}
