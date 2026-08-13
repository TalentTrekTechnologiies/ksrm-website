#!/usr/bin/env node
/**
 * READ-ONLY dry run for two data clean-ups on the Examinations documents.
 *
 *     node scripts/exam-docs-dryrun.mjs                 # report only
 *     node scripts/exam-docs-dryrun.mjs --sql out.sql   # also write reviewable SQL
 *
 * This script NEVER writes to the database. It reads the public /downloads API
 * and prints what a migration WOULD do, plus optionally emits the SQL so it can
 * be reviewed line by line before anyone runs it.
 *
 * ---------------------------------------------------------------------------
 * 1. ABSOLUTE MEDIA URLs -> RELATIVE
 *
 * 7,186 of 7,214 documents store fileUrl as an absolute
 * "http://localhost:4000/api/media/..." - the machine the data was migrated on.
 * Those links only resolve on that machine; anywhere else they point at the
 * visitor's own computer. The same class of bug is documented in
 * fix-media-urls.sql, which fixed 301 rows carrying a bare VPS IP (and caused
 * mixed-content failures on https).
 *
 * The durable fix is the one that file already settled on: keep the PATH, drop
 * the origin. A relative "/api/media/file/415/ORIGINAL/SOURCE" inherits
 * whatever scheme and host served the page, so it survives every future move
 * and deploy/retarget-media-urls.sh never needs running again. The frontend
 * already resolves relative media paths through resolveFileUrl().
 *
 * ---------------------------------------------------------------------------
 * 2. SEGREGATING THE GENERIC "examinations" BUCKET
 *
 * 1,966 documents sit in the catch-all "examinations" section rather than a
 * specific sub-section, so the page has to guess where they belong by matching
 * their titles at render time. Classifying them once, in the data, means the
 * page can stop guessing.
 *
 * The patterns below are deliberately THE SAME ONES app/examinations/page.tsx
 * already uses, so this migration produces exactly the grouping the site
 * currently displays - it makes the existing behaviour explicit rather than
 * changing what anyone sees.
 */

import { writeFileSync } from "node:fs"

const API = process.env.API_URL ?? "http://localhost:4000/api"
const sqlArgIndex = process.argv.indexOf("--sql")
const SQL_OUT = sqlArgIndex !== -1 ? process.argv[sqlArgIndex + 1] : null

// Same sources as app/examinations/page.tsx. Order matters: a title like
// "Results of Time Table exam" is vanishingly rare, but first match wins and
// results are the highest-volume, most-specific case.
const RULES = [
  { section: "examinations.results", re: /result/i, label: "Exam Results" },
  { section: "examinations.timetables", re: /time\s*table|timetable/i, label: "Time Tables" },
  { section: "examinations.calendars", re: /calendar/i, label: "Academic Calendars" },
  { section: "examinations.notifications", re: /notification|notice|circular/i, label: "Notifications" },
]

const res = await fetch(`${API}/downloads`)
if (!res.ok) {
  console.error(`Could not read ${API}/downloads - is the backend running? (HTTP ${res.status})`)
  process.exit(1)
}
const body = await res.json()
const items = Array.isArray(body) ? body : body.items ?? body.data ?? []

console.log(`\nRead ${items.length} documents from ${API}/downloads (READ-ONLY)\n`)

// ---------------------------------------------------------------- 1. URLs
const absolute = items.filter((d) => /^https?:\/\//i.test(d.fileUrl ?? ""))
const byHost = {}
for (const d of absolute) {
  try {
    byHost[new URL(d.fileUrl).host] = (byHost[new URL(d.fileUrl).host] ?? 0) + 1
  } catch {
    byHost["(unparseable)"] = (byHost["(unparseable)"] ?? 0) + 1
  }
}

console.log("=".repeat(74))
console.log("1. ABSOLUTE URLs  ->  RELATIVE PATHS")
console.log("=".repeat(74))
console.log(`${absolute.length} of ${items.length} documents store an absolute URL.\n`)
console.log("  hosts currently baked into the data:")
for (const [h, n] of Object.entries(byHost).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(6)}  ${h}`)
}

// Only /api/media paths are safe to relativise - a genuinely external link
// (a JNTUA notice, say) must keep its host.
const relativisable = absolute.filter((d) => {
  try {
    return new URL(d.fileUrl).pathname.startsWith("/api/media/")
  } catch {
    return false
  }
})
const externalKept = absolute.length - relativisable.length

console.log(`\n  ${relativisable.length} point at this site's own media and WOULD become relative`)
console.log(`  ${externalKept} point somewhere else and WOULD BE LEFT ALONE`)
if (externalKept > 0) {
  console.log("\n  left alone (first 10) - check none of these should be self-hosted:")
  for (const d of absolute.filter((x) => !relativisable.includes(x)).slice(0, 10)) {
    console.log(`    ${d.fileUrl}`)
  }
}
if (relativisable.length) {
  const s = relativisable[0]
  try {
    console.log(`\n  example rewrite:\n    before: ${s.fileUrl}\n    after:  ${new URL(s.fileUrl).pathname}`)
  } catch {}
}

// ------------------------------------------------------- 2. Segregation
const generic = items.filter((d) => d.pageSection === "examinations")
const planned = new Map(RULES.map((r) => [r.section, []]))
const unmatched = []
for (const d of generic) {
  const rule = RULES.find((r) => r.re.test(d.title ?? ""))
  if (rule) planned.get(rule.section).push(d)
  else unmatched.push(d)
}

console.log(`\n${"=".repeat(74)}`)
console.log("2. SEGREGATING THE GENERIC \"examinations\" BUCKET")
console.log("=".repeat(74))
console.log(`${generic.length} documents currently sit in the catch-all section.\n`)
for (const r of RULES) {
  const list = planned.get(r.section)
  console.log(`  ${String(list.length).padStart(6)}  ->  ${r.section.padEnd(30)} (${r.label})`)
  for (const d of list.slice(0, 2)) console.log(`            e.g. "${(d.title ?? "").slice(0, 62)}"`)
}
console.log(`\n  ${String(unmatched.length).padStart(4)}  no rule matched - these STAY in "examinations" (Other Exam Documents)`)
for (const d of unmatched.slice(0, 8)) console.log(`        "${(d.title ?? "").slice(0, 66)}"`)
if (unmatched.length > 8) console.log(`        ... and ${unmatched.length - 8} more`)

// ---------------------------------------------------------------- SQL
if (SQL_OUT) {
  const esc = (s) => String(s).replace(/'/g, "''")
  const lines = [
    "-- GENERATED BY scripts/exam-docs-dryrun.mjs - REVIEW BEFORE RUNNING.",
    "-- Take a database backup first. Wrapped in a transaction so it is all-or-nothing.",
    "--",
    "-- 1. Absolute self-hosted media URLs -> relative paths (see fix-media-urls.sql",
    "--    for why relative is the durable form).",
    "-- 2. Classify the generic \"examinations\" documents into their sub-sections,",
    "--    using the same title patterns app/examinations/page.tsx already applies.",
    "",
    "BEGIN;",
    "",
    "-- 1. Strip the origin from this site's own media URLs.",
    `UPDATE "Download"`,
    `   SET "fileUrl" = regexp_replace("fileUrl", '^https?://[^/]+(/api/media/)', '\\1')`,
    ` WHERE "fileUrl" ~ '^https?://[^/]+/api/media/';`,
    "",
    "-- 2. Route the catch-all examinations documents.",
  ]
  for (const r of RULES) {
    const ids = planned.get(r.section).map((d) => d.id)
    if (!ids.length) continue
    lines.push(
      `-- ${ids.length} document(s) -> ${r.label}`,
      `UPDATE "Download" SET "pageSection" = '${esc(r.section)}' WHERE "id" IN (${ids.join(", ")});`,
      "",
    )
  }
  lines.push(
    "-- Verify before committing:",
    `--   SELECT "pageSection", count(*) FROM "Download" WHERE "pageSection" LIKE 'examinations%' GROUP BY 1 ORDER BY 2 DESC;`,
    `--   SELECT count(*) FROM "Download" WHERE "fileUrl" ~ '^https?://';`,
    "",
    "COMMIT;",
    "",
  )
  writeFileSync(SQL_OUT, lines.join("\n"), "utf8")
  console.log(`\nSQL written to ${SQL_OUT} - review it, back up, then run it yourself.`)
}

console.log("\nNothing was written to the database by this script.\n")
