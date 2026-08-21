import type { DepartmentProgramme } from "@/lib/department-programmes-api";

/**
 * BCA, approved for an intake of 60 from AY 2026-27.
 *
 * The programme is approved and has to appear on the site now, but it has no
 * DepartmentProgramme record yet, and every programme figure on the public
 * pages is counted from those records. Without this the Admissions card said
 * "8 programmes - 810 seats" while the college was offering nine.
 *
 * The rule lives here rather than in each page because three surfaces have to
 * agree: the Admissions card's tally, the UG list it links to, and the intake
 * table on Courses & Intake. They disagreeing is exactly the failure the
 * Admissions page's own comment warns about.
 *
 * The moment an admin adds BCA under Admin -> Academics, `withApprovedBca`
 * finds it and stops adding this one, so the record takes over and revising
 * the intake stays an admin edit like every other programme.
 */

/** Matches BCA by name, whatever an admin ends up calling the record. */
export function isBcaProgramme(p: { name?: string | null }): boolean {
  return /\bBCA\b|bachelor of computer applications/i.test(p.name ?? "");
}

/**
 * Negative id so it can never collide with a real record, and so anything that
 * keys on id treats it as its own row.
 */
export const APPROVED_BCA: DepartmentProgramme = {
  id: -1,
  name: "Bachelor of Computer Applications",
  code: "BCA",
  level: "UG",
  intake: 60,
} as DepartmentProgramme;

/** The academic year BCA is offered from, shown wherever it is listed. */
export const BCA_FROM_YEAR = "Offered from AY 2026-27";

/**
 * `programmes` with BCA guaranteed present - added only when the CMS does not
 * already have it, so it is never counted twice.
 *
 * Returns the list untouched while `programmes` is still null/empty, which is
 * the pre-hydration and API-failure case: those pages fall back to their own
 * built-in lists there, and injecting a lone BCA would replace a full table
 * with a single row.
 */
export function withApprovedBca(programmes: DepartmentProgramme[] | null | undefined): DepartmentProgramme[] {
  if (!programmes?.length) return programmes ?? [];
  return programmes.some(isBcaProgramme) ? programmes : [...programmes, APPROVED_BCA];
}
