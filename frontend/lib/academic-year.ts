/**
 * The current academic year, worked out rather than written down.
 *
 * "Current AY: 2025-2026" was typed into the calendar page, so it was correct
 * for one year and wrong from the next July onwards - with nothing to signal
 * it had gone stale. Derived, it simply keeps up.
 *
 * An Indian academic year opens around June/July, so anything from June counts
 * as the start of AY <this year>-<next>, and January to May still belongs to
 * the year that began the previous June.
 */
const ACADEMIC_YEAR_STARTS_IN_MONTH = 5; // June, zero-indexed

export function currentAcademicYear(now: Date = new Date()): { startYear: number; endYear: number } {
  const startYear = now.getMonth() >= ACADEMIC_YEAR_STARTS_IN_MONTH ? now.getFullYear() : now.getFullYear() - 1;
  return { startYear, endYear: startYear + 1 };
}

/** "2026–2027" */
export function formatAcademicYear(now: Date = new Date()): string {
  const { startYear, endYear } = currentAcademicYear(now);
  return `${startYear}–${endYear}`;
}

/** "2026-27" - the short form the college uses in document titles. */
export function formatAcademicYearShort(now: Date = new Date()): string {
  const { startYear, endYear } = currentAcademicYear(now);
  return `${startYear}-${String(endYear).slice(2)}`;
}
