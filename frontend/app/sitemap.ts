import type { MetadataRoute } from "next"

// Generated into out/sitemap.xml at build. Lists every public, indexable page
// so search engines can discover them. Excludes /admin, /dashboard and /test.
// Keep the path lists in sync with the app/ routes and the department data.
const SITE_URL = "https://ksrmce.ac.in"

// Required so Next statically emits out/sitemap.xml under `output: "export"`.
export const dynamic = "force-static"

const STATIC_PATHS = [
  "",
  "/about",
  "/accreditation",
  "/contact",
  "/alumni",
  "/degree-verification",
  // Academics
  "/academics",
  "/academics/academic-calendar",
  "/academics/admissions",
  "/academics/courses-intake",
  "/academics/diploma",
  "/academics/fee-structure",
  "/academics/regulations",
  "/academics/syllabus",
  // Admissions
  "/admissions",
  "/admissions/diploma",
  "/admissions/pg",
  "/admissions/ug",
  // Campus life
  "/campus-life",
  "/campus-life/anti-ragging",
  "/campus-life/campus-facilities",
  "/campus-life/cultural",
  "/campus-life/edc",
  "/campus-life/grievance",
  "/campus-life/hostels",
  "/campus-life/library",
  "/campus-life/nss",
  "/campus-life/sports",
  "/campus-life/startup-cell",
  "/campus-life/transport",
  // Cells / quality
  "/edc",
  "/iic",
  "/iqac",
  "/naac",
  // Content hubs
  "/departments",
  "/downloads",
  "/events",
  "/examinations",
  "/gallery",
  "/news",
  "/research",
  "/careers",
  // Placements
  "/placements",
  "/placements/overview",
  "/placements/internships",
  "/placements/mous",
  "/placements/our-recruiters",
  "/placements/placements-record",
  "/placements/trainings",
]

// Keep in sync with app/departments/[slug]/page.tsx's departments map.
const DEPARTMENT_SLUGS = ["civil", "cse", "ece", "eee", "mech", "mba", "hs", "mca"]

// Keep in sync with app/about/[slug]/page.tsx's generateStaticParams.
const LEADERSHIP_SLUGS = ["correspondent", "chairman", "managing-director", "principal"]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  })

  return [
    ...STATIC_PATHS.map((p) => entry(p, p === "" ? 1 : 0.7)),
    ...DEPARTMENT_SLUGS.map((s) => entry(`/departments/${s}`, 0.8)),
    ...LEADERSHIP_SLUGS.map((s) => entry(`/about/${s}`, 0.5)),
  ]
}
