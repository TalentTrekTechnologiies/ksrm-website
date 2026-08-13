import { BreadcrumbJsonLd, type Crumb } from "@/components/seo/JsonLd"

/**
 * Emits BreadcrumbList structured data for a route, derived from its own path.
 *
 * Why derived rather than hand-written per page: the trail for
 * /campus-life/hostels is always Home > Campus Life > Student Hostels. Typing
 * that out 40 times is 40 chances to disagree with the nav.
 *
 * A NOTE ON VISIBLE BREADCRUMBS: the public site currently renders no
 * breadcrumb trail. Several pages define CSS for one (.ug-breadcrumb and
 * friends) but the class is never applied to an element - dead styling left
 * over from an earlier iteration. This component therefore supplies the
 * machine-readable trail only, which is what Google uses to show a site
 * hierarchy in place of a raw URL in search results.
 *
 * Adding the visible trail back is a UI change and is left for the client to
 * approve - the CMS already has a PageBanner.breadcrumbs JSON column waiting
 * for exactly that, so the data layer is in place.
 */

/**
 * Human labels for path segments. A segment missing here falls back to a
 * title-cased version of the slug, which is right often enough that the map
 * only needs the exceptions.
 */
const SEGMENT_LABELS: Record<string, string> = {
  about: "About",
  academics: "Academics",
  accreditation: "Accreditation",
  admissions: "Admissions",
  alumni: "Alumni",
  "academic-calendar": "Academic Calendar",
  "anti-ragging": "Anti-Ragging",
  "campus-facilities": "Campus Facilities",
  "campus-life": "Campus Life",
  careers: "Careers",
  "college-fest": "College Fest",
  contact: "Contact",
  "courses-intake": "Courses & Intake",
  cultural: "Cultural",
  departments: "Departments",
  diploma: "Diploma",
  downloads: "Downloads",
  edc: "Entrepreneurship Development Cell",
  "equal-opportunity-cell": "Equal Opportunity Cell",
  events: "Events",
  examinations: "Examinations",
  "facilities-for-differently-abled": "Facilities for Differently-Abled",
  "fee-structure": "Fee Structure",
  gallery: "Gallery",
  grievance: "Grievance Redressal",
  "health-facilities": "Health Facilities",
  hostels: "Student Hostels",
  iic: "Institution's Innovation Council",
  "industry-institute-interaction": "Industry Institute Interaction",
  internships: "Internships",
  iqac: "IQAC",
  kgcet: "KGCET",
  library: "Central Library",
  "mandatory-disclosure": "Mandatory Disclosure",
  mous: "MoUs",
  naac: "NAAC",
  news: "News",
  nss: "National Service Scheme",
  ombudsman: "Ombudsperson",
  "our-recruiters": "Our Recruiters",
  overview: "Overview",
  pg: "PG Admissions",
  placements: "Placements",
  "placements-record": "Placements Record",
  "professional-chapters": "Professional Chapters",
  regulations: "Regulations",
  research: "Research",
  "sedg-cell": "SEDG Cell",
  sports: "Sports",
  "startup-cell": "Startup Cell",
  syllabus: "Syllabus",
  trainings: "Training Programmes",
  transport: "Transport",
  ug: "B.Tech Admissions",
}

function labelFor(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  )
}

/**
 * @param path  Route path, e.g. "/campus-life/hostels".
 * @param currentLabel  Overrides the label of the final crumb - used where the
 *   page's real title is not derivable from the slug (a person's name, a
 *   department's full name).
 */
export default function RouteBreadcrumbs({ path, currentLabel }: { path: string; currentLabel?: string }) {
  const segments = path.split("/").filter(Boolean)
  if (segments.length === 0) return null

  const items: Crumb[] = [{ name: "Home", path: "/" }]
  segments.forEach((segment, i) => {
    const isLast = i === segments.length - 1
    const segmentPath = `/${segments.slice(0, i + 1).join("/")}`
    items.push({
      name: isLast ? currentLabel ?? labelFor(segment) : labelFor(segment),
      // The current page needs no URL - schema.org treats the last item as self.
      ...(isLast ? {} : { path: segmentPath }),
    })
  })

  return <BreadcrumbJsonLd items={items} />
}
