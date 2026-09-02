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

/* ------------------------------------------------------------------ */
/* Reading a year off a document                                       */
/* ------------------------------------------------------------------ */

/**
 * The label the pages group under, e.g. "AY 2026-27".
 *
 * Distinct from formatAcademicYear above, which is prose for a heading. This
 * is the exact string the college writes on its documents and picks in the
 * admin dropdown, so grouping compares like with like.
 */
export function currentAcademicYearLabel(now: Date = new Date()): string {
  const { startYear, endYear } = currentAcademicYear(now);
  return `AY ${startYear}-${String(endYear).slice(2)}`;
}

const AY_MARKER = /\bAY\s*(\d{4}|\d{2})\s*[-–—/ ]\s*(\d{4}|\d{2})\b/i;
const YEAR_SPAN = /(20\d{2})\s*[-–—]\s*(\d{2,4})/;

const asFourDigits = (year: string) => (year.length === 2 ? `20${year}` : year);

/**
 * Reads an academic year out of a document title.
 *
 * An explicit "AY ..." marker wins, because these titles carry several years
 * and only one of them is the academic year:
 *
 *   "A. Calendar II B.Tech 2025 (R) 2025 (LE) AY 26 27"  ->  AY 2026-27
 *
 * The rest are admission batches. Taking the first four-digit number filed
 * this year's calendars four years back.
 *
 * Accepts the marker written loosely, because that is how it is typed:
 * "AY 26 27", "AY26 27", "AY 2026-27", "AY 2026-2027".
 *
 * Returns null when the title says nothing definite. A lone year is NOT read
 * as an academic year - it is as likely to be the batch - so the caller
 * decides what to do with an undated document rather than being handed a guess.
 */
export function academicYearFromTitle(title: string): string | null {
  const marked = title.match(AY_MARKER);
  if (marked) return `AY ${asFourDigits(marked[1])}-${asFourDigits(marked[2]).slice(2)}`;

  const span = title.match(YEAR_SPAN);
  if (span) return `AY ${span[1]}-${span[2].length === 2 ? span[2] : span[2].slice(2)}`;

  return null;
}

/**
 * The year a document belongs to: the field an admin chose, else its title.
 *
 * The field wins because it was picked from a dropdown, which beats reading a
 * year out of a filename. The title is the fallback that groups the thousands
 * uploaded before the field existed, without anyone relabelling them by hand.
 */
export function academicYearOf(doc: { academicYear?: string | null; title?: string | null }): string | null {
  const field = doc.academicYear?.trim();
  // Tolerates "AY AY 2026-27", which is what the exam notification form has
  // been storing - it prefixes "AY " to a value that already carries one.
  if (field) return field.replace(/^(AY\s*)+/i, "AY ");

  return academicYearFromTitle(doc.title ?? "");
}
