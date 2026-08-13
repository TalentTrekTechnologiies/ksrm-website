#!/usr/bin/env node
/**
 * Measures the SEO health of the built static export in out/.
 *
 * Run after `npm run build`:
 *     node scripts/seo-audit.mjs
 *
 * Exists because the SEO pass of 2026-08 fixed a set of problems that are
 * invisible in source and only observable in the emitted HTML - duplicate
 * titles inherited from a parent layout, canonicals that disagree with the
 * sitemap's trailing slashes, counters that server-render as 0. Each of those
 * shipped silently once already. This script re-checks all of them in a second
 * and prints a pass/fail summary, so a regression is caught at build time
 * rather than in Search Console three weeks later.
 *
 * Exit code is non-zero if any CRITICAL check fails, so it can gate a deploy.
 */

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = join(process.cwd(), "out")

if (!existsSync(OUT)) {
  console.error("out/ not found - run `npm run build` first.")
  process.exit(1)
}

// ---------------------------------------------------------------- collect

/** Routes that are intentionally not indexable, so they are exempt from checks. */
const EXEMPT = [
  "/admin",
  "/dashboard",
  "/404",
  "/_not-found",
  "/careers/apply",
  "/academics/admissions",
  "/academics/diploma",
  "/campus-life/edc",
]

const isExempt = (route) => EXEMPT.some((e) => route === e || route.startsWith(`${e}/`))

function findPages(dir, pages = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (name === "_next") continue
      findPages(full, pages)
    } else if (name === "index.html") {
      const route = "/" + relative(OUT, dir).split("\\").join("/")
      pages.push({ route: route === "/." ? "/" : route, file: full })
    }
  }
  return pages
}

const pages = findPages(OUT).filter((p) => !p.route.startsWith("/admin"))

const tag = (html, re) => {
  const m = html.match(re)
  return m ? m[1] : null
}

const parsed = pages.map((p) => {
  const html = readFileSync(p.file, "utf8")
  return {
    ...p,
    title: tag(html, /<title>([^<]*)<\/title>/),
    description: tag(html, /<meta name="description" content="([^"]*)"/),
    canonical: tag(html, /<link rel="canonical" href="([^"]*)"/),
    robots: tag(html, /<meta name="robots" content="([^"]*)"/),
    h1Count: (html.match(/<h1[\s>]/g) || []).length,
    ogImage: tag(html, /<meta property="og:image" content="([^"]*)"/),
    jsonLdTypes: [...html.matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1]),
    html,
  }
})

const indexableParsed = parsed.filter((p) => !isExempt(p.route))

// ---------------------------------------------------------------- checks

const results = []
const check = (level, name, failures, detail = "") =>
  results.push({ level, name, failures, detail, pass: failures.length === 0 })

// Duplicate titles
const byTitle = new Map()
for (const p of indexableParsed) {
  if (!p.title) continue
  if (!byTitle.has(p.title)) byTitle.set(p.title, [])
  byTitle.get(p.title).push(p.route)
}
const dupTitles = [...byTitle.entries()].filter(([, routes]) => routes.length > 1)
check(
  "CRITICAL",
  "Unique <title> per indexable page",
  dupTitles.map(([t, routes]) => `"${t}" x${routes.length}: ${routes.slice(0, 4).join(", ")}`)
)

// Duplicate descriptions
const byDesc = new Map()
for (const p of indexableParsed) {
  if (!p.description) continue
  if (!byDesc.has(p.description)) byDesc.set(p.description, [])
  byDesc.get(p.description).push(p.route)
}
check(
  "HIGH",
  "Unique meta description per indexable page",
  [...byDesc.entries()]
    .filter(([, r]) => r.length > 1)
    .map(([d, r]) => `"${d.slice(0, 50)}..." x${r.length}: ${r.slice(0, 3).join(", ")}`)
)

// Missing metadata
check("CRITICAL", "Every indexable page has a <title>", indexableParsed.filter((p) => !p.title).map((p) => p.route))
check("HIGH", "Every indexable page has a description", indexableParsed.filter((p) => !p.description).map((p) => p.route))
check("CRITICAL", "Every indexable page has a canonical", indexableParsed.filter((p) => !p.canonical).map((p) => p.route))

// Canonical correctness: trailing slash + expected host + self-referencing
const SITE = "https://ksrmce.ac.in"
check(
  "CRITICAL",
  "Canonicals use the canonical host",
  indexableParsed.filter((p) => p.canonical && !p.canonical.startsWith(SITE)).map((p) => `${p.route} -> ${p.canonical}`)
)
check(
  "CRITICAL",
  "Canonicals end in a trailing slash (matches trailingSlash: true)",
  indexableParsed.filter((p) => p.canonical && !p.canonical.endsWith("/")).map((p) => `${p.route} -> ${p.canonical}`)
)
check(
  "CRITICAL",
  "Canonical points at the page's own URL",
  indexableParsed
    .filter((p) => {
      if (!p.canonical) return false
      const expected = p.route === "/" ? `${SITE}/` : `${SITE}${p.route}/`
      return p.canonical !== expected
    })
    .map((p) => `${p.route} -> ${p.canonical}`)
)

// Headings
check("CRITICAL", "Every indexable page has exactly one <h1>", indexableParsed.filter((p) => p.h1Count !== 1).map((p) => `${p.route} (h1 count: ${p.h1Count})`))

// Sitemap consistency
const sitemapPath = join(OUT, "sitemap.xml")
if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, "utf8")
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  check("CRITICAL", "Sitemap URLs all use a trailing slash", urls.filter((u) => !u.endsWith("/")))
  check("CRITICAL", "Sitemap URLs all use the canonical host", urls.filter((u) => !u.startsWith(SITE)))
  check(
    "CRITICAL",
    "Sitemap excludes noindex/admin routes",
    urls.filter((u) => {
      const path = u.replace(SITE, "").replace(/\/$/, "") || "/"
      return isExempt(path)
    })
  )
  const sitemapPaths = new Set(urls.map((u) => (u.replace(SITE, "").replace(/\/$/, "") || "/")))
  check(
    "HIGH",
    "Every indexable page appears in the sitemap",
    indexableParsed.filter((p) => !sitemapPaths.has(p.route)).map((p) => p.route)
  )
  results.push({ level: "INFO", name: `Sitemap contains ${urls.length} URLs`, failures: [], pass: true })
} else {
  check("CRITICAL", "sitemap.xml emitted", ["missing"])
}

// robots.txt
const robotsPath = join(OUT, "robots.txt")
if (existsSync(robotsPath)) {
  const txt = readFileSync(robotsPath, "utf8")
  check("CRITICAL", "robots.txt does not block /_next (would break rendering)", /Disallow:\s*\/_next/.test(txt) ? ["blocks /_next"] : [])
  check("HIGH", "robots.txt declares a sitemap", /Sitemap:/i.test(txt) ? [] : ["no Sitemap line"])
  check("HIGH", "robots.txt blocks /admin", /Disallow:\s*\/admin/.test(txt) ? [] : ["/admin not blocked"])
} else {
  check("CRITICAL", "robots.txt emitted", ["missing"])
}

// OG image must exist on disk
const ogMissing = []
for (const p of indexableParsed) {
  if (!p.ogImage) {
    ogMissing.push(`${p.route} (no og:image)`)
    continue
  }
  const rel = p.ogImage.replace(SITE, "")
  if (rel.startsWith("/") && !existsSync(join(OUT, rel))) ogMissing.push(`${p.route} -> ${rel} (file not found)`)
}
check("HIGH", "og:image is present and the file exists", ogMissing)

// Structured data
const home = parsed.find((p) => p.route === "/")
check(
  "HIGH",
  "Homepage declares Organization + WebSite structured data",
  home && home.jsonLdTypes.some((t) => /College|Organization/.test(t)) && home.jsonLdTypes.includes("WebSite")
    ? []
    : ["missing on homepage"]
)
const noFakeSchema = parsed.filter((p) => p.jsonLdTypes.some((t) => ["Review", "AggregateRating", "FAQPage"].includes(t)))
check("HIGH", "No Review/AggregateRating/FAQ schema (none is backed by page content)", noFakeSchema.map((p) => p.route))
check(
  "MEDIUM",
  "Breadcrumb pages emit BreadcrumbList",
  indexableParsed
    .filter((p) => /class="[^"]*breadcrumb/i.test(p.html) && !p.jsonLdTypes.includes("BreadcrumbList"))
    .map((p) => p.route)
)

// Homepage counters must not server-render as zero
if (home) {
  const zeros = [...home.html.matchAll(/class="stat-number">([^<]*)</g)].map((m) => m[1]).filter((v) => /^0(\.0+)?$/.test(v))
  check("CRITICAL", "Homepage statistics render real values, not 0", zeros.length ? [`${zeros.length} counters render as 0`] : [])
}

// ---------------------------------------------------------------- report

const pad = (s, n) => String(s).padEnd(n)
let criticalFails = 0

console.log(`\nSEO AUDIT - ${indexableParsed.length} indexable pages (${pages.length} built, ${pages.length - indexableParsed.length} exempt)\n`)
console.log(pad("", 4) + pad("LEVEL", 10) + "CHECK")
console.log("-".repeat(96))

for (const r of results) {
  if (r.level === "INFO") {
    console.log(`    ${pad(r.level, 10)}${r.name}`)
    continue
  }
  const mark = r.pass ? "PASS" : "FAIL"
  if (!r.pass && r.level === "CRITICAL") criticalFails++
  console.log(`${pad(mark, 4)}${pad(r.level, 10)}${r.name}${r.pass ? "" : `  (${r.failures.length})`}`)
  if (!r.pass) for (const f of r.failures.slice(0, 8)) console.log(`      - ${f}`)
  if (!r.pass && r.failures.length > 8) console.log(`      ... and ${r.failures.length - 8} more`)
}

const passed = results.filter((r) => r.level !== "INFO" && r.pass).length
const total = results.filter((r) => r.level !== "INFO").length
console.log("-".repeat(96))
console.log(`\n${passed}/${total} checks passed. ${criticalFails} critical failure(s).\n`)

process.exit(criticalFails > 0 ? 1 : 0)
