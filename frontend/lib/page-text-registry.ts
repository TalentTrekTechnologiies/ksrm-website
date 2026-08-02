/**
 * Every piece of page wording an admin is allowed to edit.
 *
 * ## Why a registry rather than the text living in the page
 *
 * The admin screen has to be able to list a page's editable slots *before*
 * anyone has edited them, and it has to show what each one currently says. If
 * the wording lived only in the JSX, the CMS would have no way to enumerate it.
 * So this file is the single source of truth: `<CmsText>` renders the default
 * from here, and the admin screen builds its form from the same entries. They
 * cannot drift apart.
 *
 * ## How the text still gets indexed
 *
 * These defaults are compiled into the static export, so the HTML that ships -
 * and that Google reads - already contains the real wording. A CMS override is
 * applied client-side on top, exactly like every other live-data block on this
 * site. An empty database, or an unreachable API, leaves every page reading
 * precisely as it does today.
 *
 * ## Adding a page
 *
 * 1. Add an entry below keyed by the page's PAGE_SECTIONS slug.
 * 2. Move the page's wording out of the JSX into `slots`, keeping it verbatim.
 * 3. Replace the JSX with `<CmsText section="..." slot="..." />`.
 *
 * Slot ids are stable identifiers stored in the database - renaming one orphans
 * whatever the admin had written for it, so treat them as permanent.
 */

export type SlotKind = "line" | "paragraph"

export interface TextSlot {
  id: string
  /** What the admin sees in the editor, e.g. "Intro paragraph". */
  label: string
  /** `line` gets a single-line input, `paragraph` a textarea. */
  kind: SlotKind
  /** The page's own wording. Shipped in the static export; overridable. */
  default: string
  /** Optional hint shown under the field. */
  help?: string
}

export interface PageTextGroup {
  /** Heading the slots are grouped under in the editor. */
  label: string
  slots: TextSlot[]
}

export interface PageTextPage {
  /** Page name shown in the editor; matches the Page Content dropdown. */
  label: string
  /** Public path, so the editor can offer a "view page" link. */
  path: string
  groups: PageTextGroup[]
}

/** Keyed by PAGE_SECTIONS slug. */
export const PAGE_TEXT: Record<string, PageTextPage> = {
  library: {
    label: "Library",
    path: "/campus-life/library",
    groups: [
      {
        label: "Header",
        slots: [
          { id: "hero.title", label: "Page title", kind: "line", default: "Central Library" },
          {
            id: "hero.subtitle",
            label: "Subtitle",
            kind: "line",
            default: "The depository of knowledge for our students, staff and faculty",
          },
        ],
      },
      {
        label: "About",
        slots: [
          {
            id: "about.p1",
            label: "First paragraph",
            kind: "paragraph",
            default:
              "The Library is one of the most important facilities on campus and is well developed with digital library and reprographic facilities. A three-storeyed building, the Central Library is the depository of knowledge serving the students, staff and faculty of the college. It is spacious enough to accommodate nearly 300 users at a time.",
          },
          {
            id: "about.p2",
            label: "Second paragraph",
            kind: "paragraph",
            default:
              "At present the Library holds about 65,384 volumes, and is constantly being strengthened by adding new literature in the form of encyclopedias, periodicals, text books, reference books, journals of national and international repute, and CD-ROMs. Basic literature is also acquired for new programmes. Keeping in view the growing importance of this treasure of knowledge, it has been completely automated. The college also runs a book bank for the benefit of students belonging to weaker sections and Scheduled Castes and Scheduled Tribes.",
          },
        ],
      },
      {
        label: "Vision, Mission & Goals",
        slots: [
          {
            id: "vision.text",
            label: "Vision",
            kind: "paragraph",
            default:
              "To see this Central Library on par with reputed libraries as a seminary and repository of library resources and services.",
          },
          {
            id: "mission.text",
            label: "Mission",
            kind: "paragraph",
            default:
              "To support K.S.R.M. College of Engineering to become a global leader in the fields of engineering and management technology, to create a knowledge hub, and to enable access to information and effective, innovative services to the user community.",
          },
        ],
      },
      {
        label: "Section headings",
        slots: [
          { id: "tour.heading", label: "Tour heading", kind: "line", default: "Library Tour" },
          { id: "tour.lead", label: "Tour subheading", kind: "line", default: "A look inside the Central Library." },
          { id: "services.heading", label: "Services heading", kind: "line", default: "Library Services" },
          {
            id: "services.lead",
            label: "Services subheading",
            kind: "line",
            default: "Services available to every member of the college.",
          },
          { id: "staff.heading", label: "Staff heading", kind: "line", default: "Library Staff" },
          {
            id: "staff.lead",
            label: "Staff subheading",
            kind: "line",
            default: "The Librarian and the Central Library team.",
          },
        ],
      },
      {
        label: "Contact",
        slots: [
          { id: "contact.phone", label: "Phone", kind: "line", default: "94413 73732" },
          { id: "contact.email", label: "Email", kind: "line", default: "library@ksrmce.ac.in" },
          {
            id: "contact.timings",
            label: "Timings",
            kind: "line",
            default: "09:00 am to 05:00 pm on all working days",
          },
        ],
      },
    ],
  },
}

/** Flattens a page's groups into its slots, in editor order. */
export function slotsForPage(section: string): TextSlot[] {
  return (PAGE_TEXT[section]?.groups ?? []).flatMap((g) => g.slots)
}

/**
 * The database key for a slot. Namespaced by page so two pages can both have
 * an "about.p1" without colliding.
 */
export function slotKey(section: string, slotId: string): string {
  return `${section}.${slotId}`
}

/** The page's own wording for a slot, or "" if the slot is unknown. */
export function defaultText(section: string, slotId: string): string {
  return slotsForPage(section).find((s) => s.id === slotId)?.default ?? ""
}

/** Pages that have editable text, for the admin dropdown. */
export function pagesWithText(): { value: string; label: string }[] {
  return Object.entries(PAGE_TEXT).map(([value, page]) => ({ value, label: page.label }))
}
