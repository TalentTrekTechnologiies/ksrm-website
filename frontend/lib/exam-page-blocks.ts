import type { DocBlockRules, PageDocBlock } from "@/lib/page-doc-rules"

/**
 * The document blocks of the public Examinations page, top to bottom.
 *
 * The page passes these to its PageResources blocks, and Admin -> Examinations
 * -> "Documents on the page" lists the same blocks from the same rules - so
 * what staff see in the CMS is exactly what is on the site, and a block
 * changed here changes in both.
 */

const EXAM_FALLBACK_SECTIONS = ["examinations"]
// Title patterns that pull documents left in the general "examinations"
// section into the block they belong to.
const CALENDAR_TITLE = "calendar"
const TIMETABLE_TITLE = "time\\s*table|timetable"
const RESULT_TITLE = "result"
const QUESTION_PAPER_TITLE = "question\\s*paper|qp\\b"

export type ExamDocBlock = PageDocBlock

export const EXAM_DOC_BLOCKS: ExamDocBlock[] = [
  {
    id: "notifications",
    title: "Latest Notifications",
    anchor: "notifications",
    rules: { section: "examinations.notifications" },
  },
  {
    id: "calendars",
    title: "Academic Calendars",
    anchor: "calendars",
    rules: { section: "examinations.calendars", fallbackSections: EXAM_FALLBACK_SECTIONS, fallbackTitlePattern: CALENDAR_TITLE },
  },
  {
    id: "timetables",
    title: "Exam Time Tables",
    anchor: "timetables",
    rules: { section: "examinations.timetables", fallbackSections: EXAM_FALLBACK_SECTIONS, fallbackTitlePattern: TIMETABLE_TITLE },
  },
  {
    // Deliberately no fallback: conduct rules show only when filed here.
    id: "rules",
    title: "Rules & Regulations",
    anchor: "rules",
    rules: { section: "examinations.rules" },
  },
  {
    id: "syllabus",
    title: "Syllabus",
    anchor: "syllabus",
    rules: { section: "examinations.syllabus", docsCategory: "SYLLABUS" },
  },
  {
    // This block and "More Exam Documents" read the same "examinations"
    // section and split it - papers here, everything else below - so nothing
    // is listed twice.
    id: "question-papers",
    title: "Question Papers",
    anchor: "question-papers",
    rules: {
      section: "examinations",
      docsCategory: "QUESTION_PAPER",
      fallbackSections: EXAM_FALLBACK_SECTIONS,
      fallbackTitlePattern: QUESTION_PAPER_TITLE,
      onlyShow: { category: "QUESTION_PAPER", titlePattern: QUESTION_PAPER_TITLE },
    },
  },
  {
    // What no block above claims: leaves out question papers and the
    // calendar / timetable / result titles those blocks pull in from here.
    id: "more",
    title: "More Exam Documents",
    anchor: "question-papers",
    rules: {
      section: "examinations",
      leaveOut: {
        category: "QUESTION_PAPER",
        titlePattern: [QUESTION_PAPER_TITLE, CALENDAR_TITLE, TIMETABLE_TITLE, RESULT_TITLE].join("|"),
      },
    },
  },
  {
    id: "results",
    title: "Results",
    anchor: "results",
    rules: { section: "examinations.results", fallbackSections: EXAM_FALLBACK_SECTIONS, fallbackTitlePattern: RESULT_TITLE },
  },
]

/** One block's rules, for spreading into <PageResources>. */
export function examBlockRules(id: string): DocBlockRules {
  const block = EXAM_DOC_BLOCKS.find((b) => b.id === id)
  if (!block) throw new Error(`Unknown Examinations block "${id}"`)
  return block.rules
}
