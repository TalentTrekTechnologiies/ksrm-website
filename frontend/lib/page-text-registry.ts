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

import { GENERATED_PAGE_TEXT } from "./page-text-registry.generated"

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

/**
 * Keyed by page section slug.
 *
 * The generated entries come from the one-time migration that lifted each
 * page's wording out of its JSX; the hand-written ones below are spread on top,
 * so a page curated by hand always wins over its generated equivalent.
 */
export const PAGE_TEXT: Record<string, PageTextPage> = {
  ...GENERATED_PAGE_TEXT,

  // Extends the generated About entry rather than replacing it: a plain
  // `about: {...}` here would win outright and silently drop every slot the
  // migration lifted out of that page's JSX.
  about: {
    ...GENERATED_PAGE_TEXT.about,
    groups: [
      ...GENERATED_PAGE_TEXT.about.groups,
      {
        label: "Sri Kandula Obula Reddy Charities",
        slots: [
          {
            id: "charities.heading",
            label: "Section heading",
            kind: "line",
            default: "Sri Kandula Obula Reddy Charities",
          },
          {
            id: "charities.p1",
            label: "Founding paragraph",
            kind: "paragraph",
            default:
              "Late Sri Kandula Obula Reddy, former Member of Parliament, transformed his noble vision into reality by establishing K.S.R.M. College of Engineering (KSRMCE) under the aegis of Sri Kandula Obula Reddy Charities in 1980. The institution was established in the rural part of Kadapa in memory of his younger son, Late Sri Kandula Srinivasa Reddy, who tragically lost his life in a road accident in New Delhi while pursuing his engineering education.",
          },
          {
            id: "charities.p2",
            label: "Vision paragraph",
            kind: "paragraph",
            default:
              "Since its inception, the institute has stood as a testament to the foresight, commitment, and social responsibility of its Founder Chairman, Late Sri Kandula Obula Reddy. He envisioned KSRMCE as a centre of excellence that would empower the youth of the rural and underserved communities of the Rayalaseema region through quality technical education. The region, characterized by its arid and semi-arid climate and recurrent drought conditions, had limited access to higher technical education. KSRMCE was established to bridge this gap and has since played a pivotal role in producing competent engineers, technologists, and leaders who have contributed significantly to society and the nation.",
          },
          {
            id: "charities.trusteesHeading",
            label: "Trustees heading",
            kind: "line",
            default: "The following are the current Managing Trustees of Sri Kandula Obula Reddy Charities",
          },
          { id: "trustees.0.name", label: "Trustee 1 - name", kind: "line", default: "Sri. K. Madan Mohan Reddy" },
          { id: "trustees.0.role", label: "Trustee 1 - role", kind: "line", default: "President" },
          { id: "trustees.1.name", label: "Trustee 2 - name", kind: "line", default: "Smt. K. Rajeswari" },
          { id: "trustees.1.role", label: "Trustee 2 - role", kind: "line", default: "Vice-President & Treasurer" },
          { id: "trustees.2.name", label: "Trustee 3 - name", kind: "line", default: "Sri. K. Chandra Obul Reddy" },
          { id: "trustees.2.role", label: "Trustee 3 - role", kind: "line", default: "Secretary" },
          { id: "trustees.3.name", label: "Trustee 4 - name", kind: "line", default: "Sri. K. Raja Mohan Reddy" },
          { id: "trustees.3.role", label: "Trustee 4 - role", kind: "line", default: "Member" },
          { id: "trustees.4.name", label: "Trustee 5 - name", kind: "line", default: "Sri. S. Venkata Siva Reddy" },
          { id: "trustees.4.role", label: "Trustee 5 - role", kind: "line", default: "Member" },
          { id: "trustees.5.name", label: "Trustee 6 - name", kind: "line", default: "Sri. K. Murali Mohan Reddy" },
          { id: "trustees.5.role", label: "Trustee 6 - role", kind: "line", default: "Member" },
        ],
      },
    ],
  },

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
      {
        // The Librarian's own profile block, above the editable staff grid.
        // Name, qualification, specialisation, experience and photo come from
        // the Faculty record itself (Admin -> Departments -> Central Library
        // -> Faculty, the isHod row) rather than a slot here - Faculty already
        // has columns for all of those, and a second, separate copy of the
        // same facts is exactly the kind of drift that caused this page to
        // need fixing in the first place. Only what Faculty has no column for
        // stays here.
        label: "Librarian profile",
        slots: [
          {
            id: "librarian.joiningDate",
            label: "Date of joining K.S.R.M.C.E.",
            kind: "line",
            default: "09 October 2010",
          },
          {
            id: "librarian.previousExperience",
            label: "Previous experience",
            kind: "paragraph",
            default:
              "Teacher, Mangalakara Children's Home Education Centre, Puttaparthi (2004–2009); Loyola Master of Computer Science & Applications, Pulivendula (2009–2010)",
          },
          {
            id: "librarian.publications",
            label: "Publications",
            kind: "line",
            default: "12 articles in national and international conferences; 5 workshops; 6 seminars",
          },
        ],
      },

      {
        label: "stats (4 items)",
        slots: [
          {
            id: "stats.0.label",
            label: "1. label - Volumes",
            kind: "line",
            default: "Volumes",
          },
          {
            id: "stats.1.label",
            label: "2. label - Titles",
            kind: "line",
            default: "Titles",
          },
          {
            id: "stats.2.label",
            label: "3. label - Journals",
            kind: "line",
            default: "Journals",
          },
          {
            id: "stats.3.label",
            label: "4. label - Seating",
            kind: "line",
            default: "Seating",
          },
        ],
      },
      {
        label: "services (5 items)",
        slots: [
          {
            id: "services.0.desc",
            label: "1. desc - 20 systems with internet access to DELNET, I...",
            kind: "line",
            default: "20 systems with internet access to DELNET, IEEE, NLIST, JNTUA Consortium, NDLI and NPTEL.",
          },
          {
            id: "services.0.title",
            label: "1. title - Digital Library",
            kind: "line",
            default: "Digital Library",
          },
          {
            id: "services.1.desc",
            label: "2. desc - Photocopy facility on payment basis at 50 pa...",
            kind: "line",
            default: "Photocopy facility on payment basis at 50 paise per copy, 09:00 am to 05:00 pm.",
          },
          {
            id: "services.1.title",
            label: "2. title - Reprographic Services",
            kind: "line",
            default: "Reprographic Services",
          },
          {
            id: "services.2.desc",
            label: "3. desc - Dedicated internet access for reference, res...",
            kind: "line",
            default: "Dedicated internet access for reference, research and e-resource browsing.",
          },
          {
            id: "services.2.title",
            label: "3. title - Internet Services",
            kind: "line",
            default: "Internet Services",
          },
          {
            id: "services.3.desc",
            label: "4. desc - Two dedicated terminals for searching the co...",
            kind: "paragraph",
            default: "Two dedicated terminals for searching the collection by Author, Title, Subject and Publisher.",
          },
          {
            id: "services.3.title",
            label: "4. title - OPAC Services",
            kind: "line",
            default: "OPAC Services",
          },
          {
            id: "services.4.desc",
            label: "5. desc - Important information from newspapers is cli...",
            kind: "line",
            default: "Important information from newspapers is clipped and archived for the user community.",
          },
          {
            id: "services.4.title",
            label: "5. title - Newspaper Clipping Services",
            kind: "line",
            default: "Newspaper Clipping Services",
          },
        ],
      },
      {
        label: "seating (4 items)",
        slots: [
          {
            id: "seating.0.section",
            label: "1. section - Reading Section",
            kind: "line",
            default: "Reading Section",
          },
          {
            id: "seating.1.section",
            label: "2. section - Reference Section",
            kind: "line",
            default: "Reference Section",
          },
          {
            id: "seating.2.section",
            label: "3. section - Journals and News Paper Section",
            kind: "line",
            default: "Journals and News Paper Section",
          },
          {
            id: "seating.3.section",
            label: "4. section - Digital Library",
            kind: "line",
            default: "Digital Library",
          },
        ],
      },
      {
        label: "reprographics (4 items)",
        slots: [
          {
            id: "reprographics.0.item",
            label: "1. item - Xerox Machine",
            kind: "line",
            default: "Xerox Machine",
          },
          {
            id: "reprographics.1.item",
            label: "2. item - Printer",
            kind: "line",
            default: "Printer",
          },
          {
            id: "reprographics.2.item",
            label: "3. item - Bar Code Printer",
            kind: "line",
            default: "Bar Code Printer",
          },
          {
            id: "reprographics.3.item",
            label: "4. item - Bar Code Scanners",
            kind: "line",
            default: "Bar Code Scanners",
          },
        ],
      },
      {
        label: "floors (3 items)",
        slots: [
          {
            id: "floors.0.floor",
            label: "1. floor - Ground Floor",
            kind: "line",
            default: "Ground Floor",
          },
          {
            id: "floors.1.floor",
            label: "2. floor - First Floor",
            kind: "line",
            default: "First Floor",
          },
          {
            id: "floors.2.floor",
            label: "3. floor - Second Floor",
            kind: "line",
            default: "Second Floor",
          },
        ],
      },
      {
        label: "holdings (7 items)",
        slots: [
          {
            id: "holdings.0.branch",
            label: "1. branch - Civil",
            kind: "line",
            default: "Civil",
          },
          {
            id: "holdings.1.branch",
            label: "2. branch - CSE",
            kind: "line",
            default: "CSE",
          },
          {
            id: "holdings.2.branch",
            label: "3. branch - EEE",
            kind: "line",
            default: "EEE",
          },
          {
            id: "holdings.3.branch",
            label: "4. branch - ECE",
            kind: "line",
            default: "ECE",
          },
          {
            id: "holdings.4.branch",
            label: "5. branch - Mechanical",
            kind: "line",
            default: "Mechanical",
          },
          {
            id: "holdings.5.branch",
            label: "6. branch - Humanities & Sciences",
            kind: "line",
            default: "Humanities & Sciences",
          },
          {
            id: "holdings.6.branch",
            label: "7. branch - General",
            kind: "line",
            default: "General",
          },
        ],
      },
      {
        label: "journals (6 items)",
        slots: [
          {
            id: "journals.0.branch",
            label: "1. branch - Civil",
            kind: "line",
            default: "Civil",
          },
          {
            id: "journals.1.branch",
            label: "2. branch - CSE",
            kind: "line",
            default: "CSE",
          },
          {
            id: "journals.2.branch",
            label: "3. branch - EEE",
            kind: "line",
            default: "EEE",
          },
          {
            id: "journals.3.branch",
            label: "4. branch - ECE",
            kind: "line",
            default: "ECE",
          },
          {
            id: "journals.4.branch",
            label: "5. branch - Mechanical",
            kind: "line",
            default: "Mechanical",
          },
          {
            id: "journals.5.branch",
            label: "6. branch - Humanities & Sciences",
            kind: "line",
            default: "Humanities & Sciences",
          },
        ],
      },
      {
        label: "otherHoldings (6 items)",
        slots: [
          {
            id: "otherHoldings.0.title",
            label: "1. title - NPTEL Video Lectures",
            kind: "line",
            default: "NPTEL Video Lectures",
          },
          {
            id: "otherHoldings.1.title",
            label: "2. title - DVDs, CDs & Floppies",
            kind: "line",
            default: "DVDs, CDs & Floppies",
          },
          {
            id: "otherHoldings.2.title",
            label: "3. title - Question Papers (All Branches)",
            kind: "line",
            default: "Question Papers (All Branches)",
          },
          {
            id: "otherHoldings.3.title",
            label: "4. title - Newspaper Clippings",
            kind: "line",
            default: "Newspaper Clippings",
          },
          {
            id: "otherHoldings.4.title",
            label: "5. title - Back Volumes of National & International Jou...",
            kind: "line",
            default: "Back Volumes of National & International Journals",
          },
          {
            id: "otherHoldings.5.title",
            label: "6. title - Back Volumes of Project Reports",
            kind: "line",
            default: "Back Volumes of Project Reports",
          },
        ],
      },
      {
        label: "eresources (6 items)",
        slots: [
          {
            id: "eresources.0.desc",
            label: "1. desc - Full-text access to IEEE transactions, confe...",
            kind: "paragraph",
            default: "Full-text access to IEEE transactions, conference proceedings and standards in electrical engineering and computer science.",
          },
          {
            id: "eresources.0.title",
            label: "1. title - IEEE Xplore",
            kind: "line",
            default: "IEEE Xplore",
          },
          {
            id: "eresources.1.desc",
            label: "2. desc - Developing Library Network - resource sharin...",
            kind: "paragraph",
            default: "Developing Library Network - resource sharing, inter-library loan and access to a large union catalogue of Indian libraries.",
          },
          {
            id: "eresources.1.title",
            label: "2. title - DELNET",
            kind: "line",
            default: "DELNET",
          },
          {
            id: "eresources.2.desc",
            label: "3. desc - National Library and Information Services In...",
            kind: "paragraph",
            default: "National Library and Information Services Infrastructure for Scholarly Content - e-journals and e-books across disciplines.",
          },
          {
            id: "eresources.2.title",
            label: "3. title - NLIST",
            kind: "line",
            default: "NLIST",
          },
          {
            id: "eresources.3.desc",
            label: "4. desc - National Digital Library of India - a single...",
            kind: "paragraph",
            default: "National Digital Library of India - a single-window search for learning resources from Indian institutions. The college runs an NDLI Club.",
          },
          {
            id: "eresources.3.title",
            label: "4. title - NDLI & NDLI Club",
            kind: "line",
            default: "NDLI & NDLI Club",
          },
          {
            id: "eresources.4.desc",
            label: "5. desc - Consortium access provided through Jawaharla...",
            kind: "paragraph",
            default: "Consortium access provided through Jawaharlal Nehru Technological University Anantapur for affiliated colleges.",
          },
          {
            id: "eresources.4.title",
            label: "5. title - JNTUA Consortium",
            kind: "line",
            default: "JNTUA Consortium",
          },
          {
            id: "eresources.5.desc",
            label: "6. desc - 3,500 video lectures from IIT and IISc facul...",
            kind: "line",
            default: "3,500 video lectures from IIT and IISc faculty across engineering, science and humanities.",
          },
          {
            id: "eresources.5.title",
            label: "6. title - NPTEL",
            kind: "line",
            default: "NPTEL",
          },
        ],
      },
      {
        label: "practices (8 items)",
        slots: [
          {
            id: "practices.0.body",
            label: "1. body - Books and journals are recommended by facult...",
            kind: "paragraph",
            default: "Books and journals are recommended by faculty using selection tools such as Books in Print, trade catalogues and publishers' catalogues, with the decision taken by the Library Committee and the Librarian. For general and reference books, students may recommend titles to the Librarian. Orders are then placed with approved vendors.",
          },
          {
            id: "practices.0.title",
            label: "1. title - Book Selection & Procurement",
            kind: "line",
            default: "Book Selection & Procurement",
          },
          {
            id: "practices.1.body",
            label: "2. body - The Library has adopted the Dewey Decimal Cl...",
            kind: "paragraph",
            default: "The Library has adopted the Dewey Decimal Classification (DDC 22nd edition) scheme, which is widely recognised by the AICTE.",
          },
          {
            id: "practices.1.title",
            label: "2. title - Classification Scheme",
            kind: "line",
            default: "Classification Scheme",
          },
          {
            id: "practices.2.body",
            label: "3. body - Books are arranged according to call numbers...",
            kind: "paragraph",
            default: "Books are arranged according to call numbers on the shelves. The OPAC facility assists users and faculty in locating books - the database can be searched by Author, Title, Accession Number and Publisher.",
          },
          {
            id: "practices.2.title",
            label: "3. title - Locating Documents",
            kind: "line",
            default: "Locating Documents",
          },
          {
            id: "practices.3.body",
            label: "4. body - The Library follows an open system. Books ar...",
            kind: "paragraph",
            default: "The Library follows an open system. Books are arranged as Text Books (for issue) and Reference Books (for reading only). Acquired books are accessioned and classified, and newly procured titles are displayed within 15 days.",
          },
          {
            id: "practices.3.title",
            label: "4. title - Arrangement of Books",
            kind: "line",
            default: "Arrangement of Books",
          },
          {
            id: "practices.4.body",
            label: "5. body - The Library receives 22 magazines and 11 new...",
            kind: "paragraph",
            default: "The Library receives 22 magazines and 11 newspapers, along with Employment News and Assignment Abroad Times, which provide the latest information on job opportunities to the user community.",
          },
          {
            id: "practices.4.title",
            label: "5. title - Magazines & Newspapers",
            kind: "line",
            default: "Magazines & Newspapers",
          },
          {
            id: "practices.5.body",
            label: "6. body - The Library subscribes to about 32 national ...",
            kind: "paragraph",
            default: "The Library subscribes to about 32 national periodicals and magazines, displayed branch-wise on separate racks. The latest issue is displayed on the rack with back volumes kept beneath. Bulletins and newsletters received on gratis or exchange from other organisations and libraries are arranged separately.",
          },
          {
            id: "practices.5.title",
            label: "6. title - Current Periodicals",
            kind: "line",
            default: "Current Periodicals",
          },
          {
            id: "practices.6.body",
            label: "7. body - Loose issues of periodicals are withdrawn fo...",
            kind: "paragraph",
            default: "Loose issues of periodicals are withdrawn for binding as soon as a volume is complete. These bound volumes are arranged systematically in the reference section - about 250 back volumes of journals across different branches.",
          },
          {
            id: "practices.6.title",
            label: "7. title - Back Volumes of Periodicals",
            kind: "line",
            default: "Back Volumes of Periodicals",
          },
          {
            id: "practices.7.body",
            label: "8. body - The Reference Section holds subject books, d...",
            kind: "paragraph",
            default: "The Reference Section holds subject books, dictionaries, handbooks and current technical information for in-library consultation.",
          },
          {
            id: "practices.7.title",
            label: "8. title - Reference Service",
            kind: "line",
            default: "Reference Service",
          },
        ],
      },
      {
        label: "committee (8 items)",
        slots: [
          {
            id: "committee.0.dept",
            label: "1. dept - ME",
            kind: "line",
            default: "ME",
          },
          {
            id: "committee.0.desig",
            label: "1. desig - Principal",
            kind: "line",
            default: "Principal",
          },
          {
            id: "committee.0.name",
            label: "1. name - Dr. V.S.S. Murthy",
            kind: "line",
            default: "Dr. V.S.S. Murthy",
          },
          {
            id: "committee.0.role",
            label: "1. role - Chairman",
            kind: "line",
            default: "Chairman",
          },
          {
            id: "committee.1.dept",
            label: "2. dept - Library",
            kind: "line",
            default: "Library",
          },
          {
            id: "committee.1.desig",
            label: "2. desig - Librarian",
            kind: "line",
            default: "Librarian",
          },
          {
            id: "committee.1.name",
            label: "2. name - Smt. L. Sasikala",
            kind: "line",
            default: "Smt. L. Sasikala",
          },
          {
            id: "committee.1.role",
            label: "2. role - Convener",
            kind: "line",
            default: "Convener",
          },
          {
            id: "committee.2.dept",
            label: "3. dept - CE",
            kind: "line",
            default: "CE",
          },
          {
            id: "committee.2.desig",
            label: "3. desig - Assistant Professor",
            kind: "line",
            default: "Assistant Professor",
          },
          {
            id: "committee.2.name",
            label: "3. name - Sri. P. Pavan Kumar",
            kind: "line",
            default: "Sri. P. Pavan Kumar",
          },
          {
            id: "committee.2.role",
            label: "3. role - Member",
            kind: "line",
            default: "Member",
          },
          {
            id: "committee.3.dept",
            label: "4. dept - EEE",
            kind: "line",
            default: "EEE",
          },
          {
            id: "committee.3.desig",
            label: "4. desig - Associate Professor",
            kind: "line",
            default: "Associate Professor",
          },
          {
            id: "committee.3.name",
            label: "4. name - Dr. C. Kumar Reddy",
            kind: "line",
            default: "Dr. C. Kumar Reddy",
          },
          {
            id: "committee.3.role",
            label: "4. role - Member",
            kind: "line",
            default: "Member",
          },
          {
            id: "committee.4.dept",
            label: "5. dept - Mechanical",
            kind: "line",
            default: "Mechanical",
          },
          {
            id: "committee.4.desig",
            label: "5. desig - Assistant Professor",
            kind: "line",
            default: "Assistant Professor",
          },
          {
            id: "committee.4.name",
            label: "5. name - Sri. D. Merwin Rajesh",
            kind: "line",
            default: "Sri. D. Merwin Rajesh",
          },
          {
            id: "committee.4.role",
            label: "5. role - Member",
            kind: "line",
            default: "Member",
          },
          {
            id: "committee.5.dept",
            label: "6. dept - ECE",
            kind: "line",
            default: "ECE",
          },
          {
            id: "committee.5.desig",
            label: "6. desig - Assistant Professor",
            kind: "line",
            default: "Assistant Professor",
          },
          {
            id: "committee.5.name",
            label: "6. name - Miss. S. Jabeen",
            kind: "line",
            default: "Miss. S. Jabeen",
          },
          {
            id: "committee.5.role",
            label: "6. role - Member",
            kind: "line",
            default: "Member",
          },
          {
            id: "committee.6.dept",
            label: "7. dept - CSE",
            kind: "line",
            default: "CSE",
          },
          {
            id: "committee.6.desig",
            label: "7. desig - Assistant Professor",
            kind: "line",
            default: "Assistant Professor",
          },
          {
            id: "committee.6.name",
            label: "7. name - Miss. T. Anitha",
            kind: "line",
            default: "Miss. T. Anitha",
          },
          {
            id: "committee.6.role",
            label: "7. role - Member",
            kind: "line",
            default: "Member",
          },
          {
            id: "committee.7.dept",
            label: "8. dept - H&S",
            kind: "line",
            default: "H&S",
          },
          {
            id: "committee.7.desig",
            label: "8. desig - Assistant Professor",
            kind: "line",
            default: "Assistant Professor",
          },
          {
            id: "committee.7.name",
            label: "8. name - Sri. D. Mallikarjun Reddy",
            kind: "line",
            default: "Sri. D. Mallikarjun Reddy",
          },
          {
            id: "committee.7.role",
            label: "8. role - Member",
            kind: "line",
            default: "Member",
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
