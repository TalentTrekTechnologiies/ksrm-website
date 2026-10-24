import type { Download, DownloadCategory } from "@/lib/downloads-api"
import { academicYearOf } from "@/lib/academic-year"

/**
 * Which documents one PageResources block lists.
 *
 * Kept apart from the component so the admin can work out the very same list
 * from its own copy of the documents. The Examinations CMS shows the page's
 * blocks and headings exactly as a visitor sees them - "More Exam Documents ->
 * Notices (427)" - because staff could see the leftovers on the site but could
 * not find them among six thousand rows on the Documents screen.
 */
export interface DocRule {
  category?: DownloadCategory
  /** Case-insensitive regex source, as a string (see PageResources). */
  titlePattern?: string
  groupPattern?: string
}

export interface DocBlockRules {
  section: string
  /** Also every document of this category that is not routed to another page. */
  docsCategory?: DownloadCategory
  fallbackSections?: string[]
  fallbackTitlePattern?: string
  fallbackGroupPattern?: string
  onlyShow?: DocRule
  leaveOut?: DocRule
}

interface CompiledRule {
  category?: DownloadCategory
  re?: RegExp
  group?: RegExp
}

export function compileRule(rule?: DocRule): CompiledRule | undefined {
  return (
    rule && {
      category: rule.category,
      re: rule.titlePattern ? new RegExp(rule.titlePattern, "i") : undefined,
      group: rule.groupPattern ? new RegExp(rule.groupPattern, "i") : undefined,
    }
  )
}

/** The fallback filter: title OR group; with neither pattern, keeps everything. */
export function matchesFallback(d: Download, titlePattern?: RegExp, groupPattern?: RegExp): boolean {
  return (
    (!titlePattern && !groupPattern) ||
    (titlePattern?.test(d.title) ?? false) ||
    (groupPattern?.test(d.groupLabel ?? "") ?? false)
  )
}

/**
 * One block's documents from its three sources, de-duplicated and in display
 * order.
 *
 * Explicit page routing wins over category inclusion: a doc the admin routed
 * to a specific section (e.g. "examinations.results") must appear only there,
 * not also in a broader block that happens to match its category.
 *
 * Deduplicated by id, and by file ONLY when the title matches too. The file
 * check used to stand alone, so two documents pointing at the same PDF
 * collapsed into one - which happens whenever an admin picks an existing item
 * from the Media Library rather than uploading a fresh copy. Same file AND
 * same title is still a genuine duplicate (the same document added twice, once
 * globally and once in a department's Documents tab).
 *
 * Admin order first, then newest. Without this the list came out in whatever
 * order the sections happened to concatenate in, so a document uploaded
 * minutes ago could sit below one from four years back - and behind a "Show
 * all" toggle, which reads as the upload having failed.
 */
export function mergeBlockDocs(
  section: string,
  routed: Download[],
  byCategory: Download[],
  fallbackDocs: Download[],
): Download[] {
  const byCategoryUnrouted = byCategory.filter((d) => !d.pageSection || d.pageSection === section)
  const seenId = new Set<number>()
  const seenFileTitle = new Set<string>()
  return [...routed, ...byCategoryUnrouted, ...fallbackDocs]
    .filter((d) => {
      if (seenId.has(d.id)) return false
      const key = `${(d.fileUrl || "").trim().toLowerCase()}::${(d.title || "").trim().toLowerCase()}`
      if (d.fileUrl && seenFileTitle.has(key)) return false
      seenId.add(d.id)
      if (d.fileUrl) seenFileTitle.add(key)
      return true
    })
    .sort((a, b) => {
      const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      if (order !== 0) return order
      return String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? ""))
    })
}

/** onlyShow / leaveOut: a document matches a rule on category, title or group. */
export function applyShowRules(docs: Download[], keep?: CompiledRule, leave?: CompiledRule): Download[] {
  const matches = (d: Download, rule: CompiledRule) =>
    (rule.category !== undefined && d.category === rule.category) ||
    (rule.re?.test(d.title) ?? false) ||
    (rule.group?.test(d.groupLabel ?? "") ?? false)
  return docs.filter((d) => {
    if (keep && !matches(d, keep)) return false
    if (leave && matches(d, leave)) return false
    return true
  })
}

/**
 * The heading a document is listed under, most deliberate first: the
 * academicYear an admin picked, the groupLabel an admin typed, then the year in
 * its title (for the thousands uploaded before either field existed). Null is
 * the trailing un-headed list.
 */
export function docHeading(d: Download): string | null {
  return d.academicYear?.trim() || d.groupLabel?.trim() || academicYearOf({ title: d.title }) || null
}

/**
 * The same selection PageResources makes from the public API, made from one
 * full list instead - for the admin, whose list also holds hidden and deleted
 * documents (the caller decides which of those to pass in).
 */
export function selectBlockDocs(all: Download[], rules: DocBlockRules): Download[] {
  const titlePattern = rules.fallbackTitlePattern ? new RegExp(rules.fallbackTitlePattern, "i") : undefined
  const groupPattern = rules.fallbackGroupPattern ? new RegExp(rules.fallbackGroupPattern, "i") : undefined
  const fallbackSections = new Set(rules.fallbackSections ?? [])
  const merged = mergeBlockDocs(
    rules.section,
    all.filter((d) => d.pageSection === rules.section),
    rules.docsCategory ? all.filter((d) => d.category === rules.docsCategory) : [],
    fallbackSections.size
      ? all.filter((d) => fallbackSections.has(d.pageSection ?? "") && matchesFallback(d, titlePattern, groupPattern))
      : [],
  )
  return applyShowRules(merged, compileRule(rules.onlyShow), compileRule(rules.leaveOut))
}
