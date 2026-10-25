import { canonicalDepartmentSlug } from "@/lib/department-slugs"

/**
 * The order the college lists its departments in, everywhere:
 * CE, CSE, EEE, ECE, ME, H&S, CA, MS, Polytechnic (the college's list, 2026-10).
 *
 * Department records have no order field and the API returns them by name,
 * which put Computer Applications second and Mechanical last. Anything not in
 * the list (offices such as the Examination Section, a department added later)
 * follows, by name.
 */
export const DEPARTMENT_ORDER = ["civil", "cse", "eee", "ece", "mech", "hs", "bca", "mba", "polytechnic"] as const

/** Other spellings of the same departments, as slugs or short codes. */
const ALIASES: Record<string, (typeof DEPARTMENT_ORDER)[number]> = {
  ce: "civil",
  me: "mech",
  mechanical: "mech",
  "h-s": "hs",
  "humanities-sciences": "hs",
  "humanities-and-sciences": "hs",
  ca: "bca",
  mca: "bca",
  "computer-applications": "bca",
  ms: "mba",
  "management-studies": "mba",
  diploma: "polytechnic",
}

/** Position in the college's order; departments not in it sort after. */
export function departmentRank(slugOrCode: string | null | undefined): number {
  const key = canonicalDepartmentSlug((slugOrCode ?? "").trim().toLowerCase())
  const i = DEPARTMENT_ORDER.indexOf((ALIASES[key] ?? key) as (typeof DEPARTMENT_ORDER)[number])
  return i < 0 ? DEPARTMENT_ORDER.length : i
}

/** A copy of the list in the college's order (unknown ones by name, after). */
export function sortDepartments<T extends { slug: string; name: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => departmentRank(a.slug) - departmentRank(b.slug) || a.name.localeCompare(b.name),
  )
}
