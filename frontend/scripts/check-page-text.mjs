/**
 * Fails if any <CmsText> on a page points at a slot the registry does not know.
 *
 * An unregistered slot does not error. CmsText looks its default up in the
 * registry, finds nothing, and renders nothing - so the heading is simply
 * missing from the page, in the build, in review, and in production, with no
 * warning anywhere. The NBA page shipped exactly like that: no title, no
 * subtitle, no intro, no section headings, because "nba" was never added to
 * the registry.
 *
 * So it is checked directly, the same way check-control-chars checks for the
 * other bug that is invisible until someone looks at the page.
 *
 *   node scripts/check-page-text.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { createJiti } from "jiti"

const root = process.cwd()
const jiti = createJiti(import.meta.url, { alias: { "@": root } })
const { PAGE_TEXT } = await jiti.import(path.join(root, "lib/page-text-registry.ts"))

const known = new Map()
for (const [section, page] of Object.entries(PAGE_TEXT)) {
  const ids = new Set()
  for (const group of page.groups ?? []) for (const slot of group.slots ?? []) ids.add(slot.id)
  known.set(section, ids)
}

// Only literal section and slot strings can be checked statically. A slot
// built from a template (`criteria.${i}.title`) is skipped rather than guessed.
const USE = /<CmsText\s+section="([^"]+)"\s+slot="([^"]+)"/g

const problems = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue
    const full = path.join(dir, entry)
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (full.endsWith(".tsx")) {
      // Comments blanked out (keeping newlines, so line numbers still hold):
      // a usage example in a doc comment is not a page rendering a blank slot.
      const text = fs
        .readFileSync(full, "utf-8")
        .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
        .replace(/(^|[^:])\/\/.*$/gm, (c, lead) => lead + " ".repeat(c.length - lead.length))
      for (const m of text.matchAll(USE)) {
        const [, section, slot] = m
        const line = text.slice(0, m.index).split("\n").length
        const where = `${path.relative(root, full)}:${line}`
        if (!known.has(section)) problems.push({ where, section, slot, why: "section not registered" })
        else if (!known.get(section).has(slot)) problems.push({ where, section, slot, why: "slot not registered" })
      }
    }
  }
}
for (const dir of ["app", "components"]) if (fs.existsSync(dir)) walk(dir)

if (problems.length === 0) {
  console.log("check-page-text: every CmsText slot is registered")
  process.exit(0)
}

console.error(`\ncheck-page-text: ${problems.length} CmsText slot(s) will render blank.\n`)
const bySection = new Map()
for (const p of problems) {
  const list = bySection.get(p.section) ?? []
  list.push(p)
  bySection.set(p.section, list)
}
for (const [section, list] of bySection) {
  console.error(`  [${section}] ${list[0].why === "section not registered" ? "whole section missing" : ""}`)
  for (const p of list.slice(0, 8)) console.error(`      ${p.slot.padEnd(40)} ${p.where}`)
  if (list.length > 8) console.error(`      ... and ${list.length - 8} more`)
}
console.error(
  "\nAdd the section and its slots to lib/page-text-registry.ts, with the wording\n" +
    "the page should show. Until then these render as nothing, silently.\n",
)
process.exit(1)
