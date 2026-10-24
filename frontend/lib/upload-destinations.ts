import { PAGE_SECTIONS, type Download, type DownloadCategory } from "@/lib/downloads-api"
import { EXAM_DOC_BLOCKS } from "@/lib/exam-page-blocks"
import { docHeading, selectBlockDocs } from "@/lib/page-doc-rules"

/**
 * Where an uploaded document will appear on the public site.
 *
 * Staff uploading a file had no way to tell where it would land: the upload
 * form offers ~80 sections by name, and on the Examinations page the block a
 * document shows in depends on its title too ("... Results" filed under Other
 * Exam Documents is listed under Results). The upload forms now say, before
 * publishing, "Examinations page > Results > under AY 2025-26", with a link.
 */

/** Public page (and anchor) that lists each upload section. */
const SECTION_PAGES: Record<string, string> = {
  about: "/about",
  "about.organogram": "/about#organogram",
  "about.newsletters": "/about#newsletters",
  "about.financecommittee": "/about",
  "about.committees": "/about#committees-list",
  "about.ombudsman": "/about/ombudsman",
  "academics.calendar": "/academics/academic-calendar",
  "academics.courses-intake": "/academics/courses-intake",
  "academics.fee-structure": "/academics/fee-structure",
  "academics.regulations": "/academics/regulations",
  "academics.service-rules": "/academics/service-rules",
  accreditation: "/accreditation",
  admissions: "/admissions",
  "admissions.ug": "/admissions/ug",
  "admissions.pg": "/admissions/pg",
  "admissions.diploma": "/admissions/diploma",
  alumni: "/alumni",
  "anti-ragging": "/campus-life/anti-ragging",
  "campus-facilities": "/campus-life/campus-facilities",
  "campus-life.industry-institute-interaction": "/campus-life/industry-institute-interaction",
  careers: "/careers",
  "college-fest": "/campus-life/college-fest",
  committees: "/committees",
  contact: "/contact",
  cultural: "/campus-life/cultural",
  edc: "/edc",
  "equal-opportunity-cell": "/campus-life/equal-opportunity-cell",
  events: "/events",
  "facilities-for-differently-abled": "/campus-life/facilities-for-differently-abled",
  "faculty.data": "/faculty/data",
  "faculty.policies": "/faculty/policies-procedures",
  "faculty.rules": "/faculty/rules",
  grievance: "/campus-life/grievance",
  "health-facilities": "/campus-life/health-facilities",
  hostels: "/campus-life/hostels",
  iic: "/iic",
  iqac: "/iqac",
  "iqac.composition": "/iqac",
  "iqac.annualreports": "/naac",
  "iqac.aqar": "/naac",
  "iqac.minutes": "/naac",
  "iqac.survey": "/naac",
  kgcet: "/kgcet",
  library: "/campus-life/library",
  "mandatory-disclosure": "/mandatory-disclosure",
  naac: "/naac",
  "naac.aaa": "/naac",
  "naac.best-practices": "/naac",
  "naac.code-of-conduct": "/naac",
  "naac.distinctiveness": "/naac",
  "naac.dvv": "/naac",
  "naac.feedback": "/naac",
  "naac.policies": "/naac",
  "naac.ssr": "/naac",
  nba: "/nba",
  "nba-certificates": "/nba",
  nss: "/campus-life/nss",
  placements: "/placements/overview",
  "placements.internships": "/placements/internships",
  "placements.mous": "/placements/mous",
  "placements.record": "/placements/placements-record",
  "placements.recruiters": "/placements/our-recruiters",
  "placements.trainings": "/placements/trainings",
  policies: "/policies",
  "professional-chapters": "/campus-life/professional-chapters",
  research: "/research",
  "research.documents": "/research",
  "research.policies": "/research",
  "sedg-cell": "/campus-life/sedg-cell",
  sports: "/campus-life/sports",
  "startup-cell": "/campus-life/startup-cell",
  "students.data": "/students/data",
  "students.policies": "/students/policies-procedures",
  "students.rules": "/students/rules",
  syllabus: "/academics/syllabus",
  transport: "/campus-life/transport",
}

const SECTION_LABEL = new Map(PAGE_SECTIONS.map((s) => [s.value, s.label]))

export interface UploadDraft {
  pageSection?: string | null
  category: DownloadCategory
  title: string
  groupLabel?: string | null
  academicYear?: string | null
  folderPath?: string | null
}

export interface Destination {
  /** "Examinations page > Results", "About → List of Committees", ... */
  where: string
  /** Public link, or null when no page shows this section. */
  href: string | null
  /** The heading it is listed under on that page. */
  heading: string | null
  /** Set when the document will not show anywhere visitors browse. */
  warning?: string
}

const isExam = (s: string) => s === "examinations" || s.startsWith("examinations.")

export function describeDestination(draft: UploadDraft): Destination {
  const section = draft.pageSection?.trim() || ""
  // A stand-in record, so the Examinations blocks can be asked the same
  // question the public page asks of a real one.
  const probe = {
    id: -1,
    title: draft.title || "",
    category: draft.category,
    pageSection: section || null,
    groupLabel: draft.groupLabel?.trim() || null,
    academicYear: draft.academicYear?.trim() || null,
    folderPath: draft.folderPath?.trim() || null,
    fileUrl: "",
    sortOrder: 0,
  } as unknown as Download
  const heading = draft.folderPath?.trim() ? `folder ${draft.folderPath.trim()}` : docHeading(probe)

  if (!section || isExam(section)) {
    const blocks = EXAM_DOC_BLOCKS.filter((b) => selectBlockDocs([probe], b.rules).length > 0)
    if (blocks.length > 0) {
      return {
        where: `Examinations page › ${blocks.map((b) => b.title).join(" and ")}`,
        href: `/examinations#${blocks[0].anchor}`,
        heading,
      }
    }
  }

  if (!section) {
    return {
      where: "The Downloads page only",
      href: "/downloads",
      heading: null,
      warning: "No page is chosen, so it is listed only on the general Downloads page. Pick a page under \"Show on page\" to put it where visitors look.",
    }
  }

  if (section.startsWith("committees.")) {
    return { where: `Committees → ${section.slice("committees.".length)}`, href: `/${section.replace(".", "/")}`, heading }
  }

  const label = SECTION_LABEL.get(section) ?? section
  const href = SECTION_PAGES[section] ?? null
  return href
    ? { where: label, href, heading }
    : {
        where: label,
        href: null,
        heading,
        warning: "No page on the site shows this section yet, so visitors will not see this document. Choose another page.",
      }
}

/** One line for a success message: "Examinations page › Results, under AY 2025-26". */
export function destinationText(d: Destination): string {
  return d.heading ? `${d.where}, under "${d.heading}"` : d.where
}
