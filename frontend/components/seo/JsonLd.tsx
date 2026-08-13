import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo"

/**
 * Structured data helpers.
 *
 * Ground rules applied throughout, per the SEO brief:
 *  - schema must describe what is actually visible on the page;
 *  - no Review, AggregateRating or FAQ markup anywhere (the site publishes no
 *    reviews or ratings, and inventing them is a manual-action risk);
 *  - no unverified external URLs. `sameAs` is deliberately absent until the
 *    college confirms its official social profiles - the two sets previously in
 *    the codebase (root layout vs Footer) contradicted each other and neither
 *    was verified.
 */

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered into the static HTML, so crawlers get it without
      // executing any JavaScript.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Stable @id so other nodes can reference the institution instead of restating it. */
export const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

/**
 * The institution itself. Values below are the college's own published
 * figures - founding year 1980 is stated in the Correspondent's published
 * message (data/leadership.ts) and matches the "45+ years" branding.
 */
export function OrganizationJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "CollegeOrUniversity",
        "@id": ORG_ID,
        name: SITE_NAME,
        alternateName: "KSRMCE",
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
        },
        image: `${SITE_URL}/og-image.jpg`,
        description:
          "K.S.R.M. College of Engineering, Kadapa - a UGC Autonomous, NAAC A+ accredited, NBA Tier-1 engineering institution in Andhra Pradesh.",
        foundingDate: "1980",
        address: {
          "@type": "PostalAddress",
          streetAddress: "K.S.R.M. College of Engineering",
          addressLocality: "Kadapa",
          addressRegion: "Andhra Pradesh",
          postalCode: "516005",
          addressCountry: "IN",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "Admissions",
            telephone: "+91-9000073434",
            email: "ksrmcengg@yahoo.co.in",
            areaServed: "IN",
            availableLanguage: ["en", "te"],
          },
        ],
      }}
    />
  )
}

/** Lets Google associate the domain with the institution and show a sitename. */
export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: "KSRMCE",
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      }}
    />
  )
}

export interface Crumb {
  name: string
  /** Route path. Omit on the final crumb - the current page needs no URL. */
  path?: string
}

/**
 * BreadcrumbList for pages that already display a breadcrumb trail visually.
 * Only added where a trail is actually shown, so the markup and the page agree.
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          ...(item.path ? { item: absoluteUrl(item.path) } : {}),
        })),
      }}
    />
  )
}

export interface CourseInput {
  name: string
  description?: string
  /** e.g. "UG", "PG" - shown on the department page as the programme level. */
  level?: string
}

/**
 * Course markup for the programmes a department actually lists on its page.
 * `provider` points at the institution node rather than duplicating it.
 *
 * Note: Google's Course rich result wants offers/duration data the site does
 * not publish for every programme, so this stays a plain, accurate Course
 * entity - useful for entity understanding, not chasing a rich snippet with
 * invented fields.
 */
export function CourseListJsonLd({ courses, departmentName }: { courses: CourseInput[]; departmentName: string }) {
  if (courses.length === 0) return null
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Programmes offered by ${departmentName}`,
        itemListElement: courses.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Course",
            name: c.name,
            ...(c.description ? { description: c.description } : {}),
            ...(c.level ? { educationalLevel: c.level } : {}),
            provider: { "@id": ORG_ID },
          },
        })),
      }}
    />
  )
}
