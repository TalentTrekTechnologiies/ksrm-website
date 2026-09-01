/**
 * Refuses to let a specimen ship with anything real left in it.
 *
 * Exits non-zero on the first sign of the college, so it can sit in a hosting
 * provider's build command and fail the deploy rather than publish. That
 * matters more than it sounds: the specimen is built from the same repository
 * as the live site, and the difference between the two is one environment
 * variable. Forget it and the build that goes up is the client's real site
 * wearing someone else's logo.
 *
 * Every rule here exists because that exact thing was found in a build:
 * the name glued inside filenames, the domain half-replaced, links to their
 * media server, a head of department in a CMS text entry, the admissions
 * numbers and the Dean hardcoded in the top bar, their social accounts, real
 * PDFs sitting unreferenced in the bundle, their name in a filename.
 *
 *   node scripts/demo/verify-demo.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const TEXT = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".webmanifest"]);

/**
 * `ksrm-intro-*` is the intro splash's CSS class and keyframe naming, and
 * `slot:"...-ksrmce-..."` are CMS lookup keys the snapshot is keyed on.
 * is shown to anyone, and renaming either breaks the page - so they are the
 * only two things allowed through.
 */
const ALLOWED = [
  /ksrm-intro/i,                 // intro splash CSS classes and keyframes
  // CMS lookup keys, plain ("slot":"x") and backslash-escaped (\"slot\":\"x\"),
  // which is how they appear in Next's inlined flight data.
  /slot[\\]*"?\s*:/i,
  /\bid:"[^"]*"/i,                // CMS text slot identifiers inside the bundle
  /90000[ -]?00000/,             // the placeholder this tool substitutes in itself
];

const RULES = [
  ["college name", /ksrmce?/i],
  ["college domain", /ksrmce\.ac\.in/i],
  ["city", /kadapa/i],
  ["trust name", /kandula/i],
  ["university", /jntua/i],
  ["student roll number", /\b\d{2}9Y\d[A-Z]\d{2}[A-Z0-9]{2}\b/i],
  ["link to their media server", /\/api\/media\/file\//i],
  ["Indian mobile number", /(?<!\d)(?:\+?91[- ]?)?[6-9]\d{4}[- ]?\d{5}(?!\d)/],
  ["their email", /ksrmcengg@|@ksrmce/i],
  // The campus coordinates. Identify the institution as surely as its name
  // does, and sit inside a maps embed where no name-based rule looks.
  ["campus coordinates", /14[.]477[0-9]*|78[.]764[0-9]*/],
  ["named person from the college", /rajeswari|madan\s*mohan|chandra\s*obul|nageswara|prathap\s+reddy/i],
];

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}

if (!fs.existsSync(OUT)) {
  console.error("verify-demo: no out/ directory - nothing to check.");
  process.exit(1);
}

/**
 * Every person named in the source tree, gathered the same way the rebrand
 * gathers them. Hardcoded as a list this would go stale the first time the
 * college added a committee member; derived, it cannot.
 *
 * This exists because the specimen shipped with the Controller of
 * Examinations, the IQAC committee, the librarian and 122 hardcoded faculty
 * still named in it - the rebrand read one file and the check only knew about
 * five people.
 */
// An honorific is required, deliberately - the same rule the rebrand uses, so
// the two cannot disagree about who is a person.
//
// The looser heuristic (two to five capitalised words, no digits) read "NTT
// Data", "Birla Soft" and "GND Solutions" as people. Company names and
// personal names are the same shape, so shape cannot separate them; the title
// in front can. A staff member listed without one survives this check, which
// is a smaller failure than relabelling every recruiter with an invented name.
function looksLikePerson(v) {
  return /^(dr|prof|sri|smt|mr|mrs|ms)[.]?[ ]/i.test(v.trim());
}

const realPeople = new Set();
for (const dir of ["app", "components", "data"]) {
  const root = path.join(process.cwd(), dir);
  if (!fs.existsSync(root)) continue;
  walk(root, (file) => {
    if (![".ts", ".tsx"].includes(path.extname(file))) return;
    const text = fs.readFileSync(file, "utf-8");
    for (const m of text.matchAll(/name:\s*"([^"]{4,60})"/g)) {
      if (looksLikePerson(m[1])) realPeople.add(m[1]);
    }
  });
}
// Escaping built from a runtime backslash - a literal one in this position has
// been eaten by an editing shell repeatedly in these files.
const BS = String.fromCharCode(92);
const escapeRe = (t) => [...t].map((c) => (/[A-Za-z0-9 ]/.test(c) ? c : BS + c)).join("");
for (const person of realPeople) {
  RULES.push([`real person: ${person}`, new RegExp(escapeRe(person), "i")]);
}

const failures = [];

// 1. Contents of everything shipped as text.
walk(OUT, (file) => {
  if (!TEXT.has(path.extname(file))) return;
  const text = fs.readFileSync(file, "utf-8");
  for (const [label, pattern] of RULES) {
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    let m;
    while ((m = re.exec(text)) !== null) {
      const around = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60);
      if (ALLOWED.some((ok) => ok.test(around))) continue;
      failures.push({ label, file: path.relative(OUT, file), sample: around.replace(/\s+/g, " ").slice(0, 100) });
      break;
    }
  }
});

// 2. Filenames, which no content scan ever looks at.
walk(OUT, (file) => {
  const base = path.basename(file);
  if (/ksrm|kadapa|kandula/i.test(base)) {
    failures.push({ label: "identifying filename", file: path.relative(OUT, file), sample: base });
  }
});

// 3. Real documents. Every download in the specimen points at /demo/sample.pdf,
//    so any other document in the bundle is the college's, shipped by accident.
walk(OUT, (file) => {
  if (!/\.(pdf|docx?|xlsx?|pptx?)$/i.test(file)) return;
  if (file.includes(`${path.sep}demo${path.sep}`)) return;
  failures.push({ label: "real document in bundle", file: path.relative(OUT, file), sample: path.basename(file) });
});

// 4. The two protections that make it safe to host at all.
if (!fs.existsSync(path.join(OUT, "robots.txt")) ||
    !fs.readFileSync(path.join(OUT, "robots.txt"), "utf-8").includes("Disallow: /")) {
  failures.push({ label: "robots.txt does not disallow crawling", file: "robots.txt", sample: "" });
}
const home = path.join(OUT, "index.html");
if (fs.existsSync(home) && !fs.readFileSync(home, "utf-8").includes("noindex")) {
  failures.push({ label: "pages are not noindexed", file: "index.html", sample: "" });
}

if (failures.length === 0) {
  console.log("verify-demo: PASSED - no trace of the college in the specimen.");
  process.exit(0);
}

console.error(`\nverify-demo: FAILED - ${failures.length} problem(s). This must not be published.\n`);
const byLabel = new Map();
for (const f of failures) {
  if (!byLabel.has(f.label)) byLabel.set(f.label, []);
  byLabel.get(f.label).push(f);
}
for (const [label, list] of byLabel) {
  console.error(`  ${label} (${list.length}):`);
  for (const f of list.slice(0, 3)) console.error(`      ${f.file}  ${f.sample}`);
  if (list.length > 3) console.error(`      ...and ${list.length - 3} more`);
}
console.error("\nRun the demo build and rebrand again, or fix the rule that let this through.\n");
process.exit(1);
