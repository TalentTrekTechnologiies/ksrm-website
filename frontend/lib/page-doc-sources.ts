import type { Download } from "@/lib/downloads-api"
import { EXAM_DOC_BLOCKS } from "@/lib/exam-page-blocks"
import { NAAC_DOC_BLOCKS } from "@/lib/naac-page-blocks"
import { selectBlockDocs } from "@/lib/page-doc-rules"

/**
 * Upload sections whose public page lists more than the documents filed under
 * that exact section - so a CMS screen that matched on the section name said
 * "No documents" (or far too few) while the page showed them:
 *
 *   NAAC DVV, SSR, Minutes, AAA...  old-site files filed under plain "NAAC",
 *                                   placed by folder or title
 *   Examinations calendars, time    files left in the general Examinations
 *   tables, results, syllabus       section, placed by title or category
 *   Academics -> Academic Calendar  also every Examinations calendar
 *   Academics -> Regulations        also every Syllabus-category document
 *   Syllabus                        every Syllabus-category document
 *
 * Every CMS screen that lists a page's documents by section reads this, so
 * the CMS and the site cannot disagree. Sections not listed here are shown by
 * exact section, which is all their pages read.
 */
export interface PageDocSource {
  /** "NAAC page > DVV", for the note that explains the extra rows. */
  where: string
  /** The documents the public page lists for this section. */
  select: (all: Download[]) => Download[]
}

/** Every record once, in the order given - how the hand-built pages merge. */
function byRecord(...lists: Download[][]): Download[] {
  const seen = new Set<number>()
  return lists.flat().filter((d) => !seen.has(d.id) && seen.add(d.id))
}

const blockSources = [
  ...NAAC_DOC_BLOCKS.map((block) => ({ page: "NAAC page", block })),
  ...EXAM_DOC_BLOCKS.map((block) => ({ page: "Examinations page", block })),
]
  // Only blocks that reach beyond their own section, and not the broad
  // "naac" / "examinations" sections, whose plain match is the full set.
  .filter(({ block }) => block.rules.fallbackSections?.length || block.rules.docsCategory)
  .filter(({ block }) => block.rules.section.includes("."))
  .map(({ page, block }) => [
    block.rules.section,
    { where: `${page} › ${block.title}`, select: (all: Download[]) => selectBlockDocs(all, block.rules) },
  ] as const)

export const PAGE_DOC_SOURCES = new Map<string, PageDocSource>([
  ...blockSources,
  [
    "academics.calendar",
    {
      where: "Academic Calendar page",
      // app/academics/academic-calendar: its own section, then the
      // Examinations calendars.
      select: (all) =>
        byRecord(
          all.filter((d) => d.pageSection === "academics.calendar"),
          all.filter((d) => d.pageSection === "examinations.calendars"),
        ),
    },
  ],
  [
    "academics.regulations",
    {
      where: "Regulations page",
      // app/academics/regulations: its own section, then every syllabus.
      select: (all) =>
        byRecord(
          all.filter((d) => d.pageSection === "academics.regulations"),
          all.filter((d) => d.category === "SYLLABUS"),
        ),
    },
  ],
  [
    "syllabus",
    {
      where: "Syllabus page",
      // app/academics/syllabus: every Syllabus-category document.
      select: (all) => byRecord(all.filter((d) => d.category === "SYLLABUS")),
    },
  ],
])

/**
 * The documents a page shows for an upload section, from the admin's full
 * list. Live and deleted rows are selected separately, so a deleted copy
 * cannot hide a live one in a duplicate check. \`pulledIn\` counts the ones
 * filed under some other section.
 */
export function docsForSection(all: Download[], section: string): { docs: Download[]; pulledIn: number; source?: PageDocSource } {
  const source = PAGE_DOC_SOURCES.get(section)
  if (!source) return { docs: all.filter((d) => (d.pageSection ?? "") === section), pulledIn: 0 }
  const docs = [...source.select(all.filter((d) => !d.deletedAt)), ...source.select(all.filter((d) => d.deletedAt))]
  return { docs, pulledIn: docs.filter((d) => (d.pageSection ?? "") !== section).length, source }
}
