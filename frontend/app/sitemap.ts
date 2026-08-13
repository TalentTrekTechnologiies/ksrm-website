import type { MetadataRoute } from "next"
import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { LEADERSHIP } from "@/data/leadership"
import { absoluteUrl } from "@/lib/seo"

/**
 * Generated into out/sitemap.xml at build.
 *
 * Two things this file gets right that the previous hand-maintained version
 * did not:
 *
 *  1. **Trailing slashes.** next.config.ts sets `trailingSlash: true`, so the
 *     servable URL is /news/ and that is what the page's own canonical says.
 *     The old sitemap listed /news - meaning every one of its ~73 entries
 *     pointed at a redirect rather than the canonical URL. All URLs now go
 *     through absoluteUrl(), the same helper the canonicals use, so the two
 *     cannot disagree again.
 *
 *  2. **Drift.** The old list was typed by hand and had already fallen behind:
 *     nine live, indexable routes were missing (including /about/finance-officer,
 *     /kgcet and /mandatory-disclosure). Routes are now discovered by walking
 *     app/ at build time, so a new page is in the sitemap the moment it exists.
 *     Only exclusions need maintaining - and forgetting an exclusion is a much
 *     safer failure than forgetting a page.
 */

// Required so Next statically emits out/sitemap.xml under `output: "export"`.
export const dynamic = "force-static"

const APP_DIR = join(process.cwd(), "app")

/**
 * Route segments that must never appear in the sitemap.
 * Keep in sync with app/robots.ts and with any page carrying `noindex: true`.
 */
const EXCLUDED_PREFIXES = [
  "/admin", // admin SPA, behind login
  "/dashboard", // "Coming Soon" placeholder, noindexed
  "/test", // scaffolding page (removed, listed defensively)
  "/careers/apply", // application form, noindexed
  // Thin CMS shells that duplicate a richer page and are noindexed.
  // See the comment blocks in each page.tsx.
  "/academics/admissions",
  "/academics/diploma",
  "/campus-life/edc",
]

/**
 * Department URL aliases. These render the same page as their canonical slug,
 * so listing them would submit known duplicates. `/departments/mech/` and
 * `/departments/hs/` are the canonical forms.
 */
const DEPARTMENT_ALIASES = new Set([
  "mechanical",
  "humanities-sciences",
  "aids",
  "ai-ds",
  "ai-ml",
  "aiml",
  "cse-ds",
  "cse-aiml",
  "data-science",
])

const CANONICAL_DEPARTMENT_SLUGS = ["civil", "cse", "ece", "eee", "mech", "mba", "hs", "mca"]

/** Walks app/ and returns every static route that has a page.tsx. */
function discoverStaticRoutes(): string[] {
  const routes: string[] = []

  function walk(dir: string, route: string) {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }

    if (entries.includes("page.tsx")) routes.push(route === "" ? "/" : route)

    for (const entry of entries) {
      const full = join(dir, entry)
      if (!statSync(full).isDirectory()) continue
      // Dynamic segments are expanded from their data source below; route
      // groups and private folders contribute no URL segment of their own.
      if (entry.startsWith("[")) continue
      if (entry.startsWith("_")) continue
      if (entry.startsWith("(") && entry.endsWith(")")) {
        walk(full, route)
        continue
      }
      walk(full, `${route}/${entry}`)
    }
  }

  walk(APP_DIR, "")
  return routes
}

/**
 * Priority reflects how central a page is to what people search for, rather
 * than the flat 0.7 the old sitemap gave everything. These are hints, not
 * instructions - Google treats them loosely - but a flat file carries no signal
 * at all.
 */
function priorityFor(path: string): number {
  if (path === "/") return 1.0
  if (path === "/admissions" || path.startsWith("/admissions/")) return 0.9
  if (path === "/departments" || path.startsWith("/departments/")) return 0.9
  if (path === "/placements" || path.startsWith("/placements/")) return 0.8
  if (path === "/about" || path === "/contact" || path === "/academics") return 0.8
  if (path === "/news" || path === "/events") return 0.7
  if (path.startsWith("/about/")) return 0.5
  return 0.6
}

/** News and events change often; statutory and profile pages effectively never. */
function changeFrequencyFor(path: string): "daily" | "weekly" | "monthly" | "yearly" {
  if (path === "/news" || path === "/events") return "weekly"
  if (path === "/") return "weekly"
  if (path === "/downloads" || path === "/gallery" || path === "/careers") return "monthly"
  if (path.startsWith("/about/")) return "yearly"
  return "monthly"
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = discoverStaticRoutes().filter(
    (r) => !EXCLUDED_PREFIXES.some((ex) => r === ex || r.startsWith(`${ex}/`))
  )

  const departmentRoutes = CANONICAL_DEPARTMENT_SLUGS.filter((s) => !DEPARTMENT_ALIASES.has(s)).map(
    (s) => `/departments/${s}`
  )

  // Driven by the same data the pages are, so a new leader is never left out -
  // which is exactly how /about/finance-officer went missing before.
  const leadershipRoutes = LEADERSHIP.map((l) => `/about/${l.slug}`)

  const all = Array.from(new Set([...staticRoutes, ...departmentRoutes, ...leadershipRoutes])).sort()

  return all.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: changeFrequencyFor(path),
    priority: priorityFor(path),
  }))
}
