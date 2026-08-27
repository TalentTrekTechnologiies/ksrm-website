/**
 * Sorts the legacy uploads that arrived from the old site with no page
 * section, so they appear on the page they belong to instead of nowhere.
 *
 * Background: ~1,792 documents came across from the old site's dump folders
 * (demo1, uploads, data1). The files themselves imported fine - every one
 * opens - but they carry no page section, and a document with no section
 * renders on no page at all. The migration manifest never had a section for
 * them either, so nothing was lost in the import; they were simply never
 * catalogued.
 *
 * WHAT THIS DOES NOT DO, deliberately:
 *
 *   - It never deletes anything.
 *   - It never guesses. A title like "asr", "B12", "6" or "2020" says nothing
 *     about which page it belongs on, and a wrong guess puts the wrong
 *     document on a public page - worse than leaving it uncatalogued. Those
 *     are counted and listed, and left exactly as they are.
 *   - It does not touch documents that already have a page section.
 *
 * PRIVACY: titles that are a student roll number, or nothing but a person's
 * name, are almost certainly student records and faculty CVs. They are
 * reported under "review" and never assigned to a page, because the question
 * they raise is whether they should be public at all - not which page they
 * go on. Decide those by hand.
 *
 * Usage:
 *   node reclassify-legacy.mjs                 # dry run against the API
 *   node reclassify-legacy.mjs --write         # apply
 *   node reclassify-legacy.mjs --file d.json   # dry run against a JSON dump
 *   node reclassify-legacy.mjs --report out.csv
 */

const API = process.env.API_URL || "http://localhost:4000/api";
const WRITE = process.argv.includes("--write");
const fileArg = argValue("--file");
const reportArg = argValue("--report");

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

/** Department ids as they exist in production. */
const DEPT = { civil: 7, cse: 5, eee: 6, ece: 1, hs: 10, mba: 9, mechanical: 8, bca: 18 };

/**
 * Titles that identify a PERSON rather than a document. Checked before every
 * classification rule, so a file called "Dr.V.Lokeswara Reddy" is never filed
 * onto a public page by a later rule that happens to match part of the name.
 */
const ROLL_NUMBER = /^\s*\d{2}9Y\d[A-Z]\d{2}[A-Z0-9]{2}\s*$/i;
const PERSON_NAME =
  /^\s*(?:(?:Dr|Mr|Mrs|Ms|Sri|Smt|Prof)\.?\s*)?[A-Z][a-zA-Z]*(?:[\s.]+[A-Z][a-zA-Z]*){1,3}\s*$/;

/** Too little signal to act on: "B12", "cir1", "6", "asr", "2020". */
const NO_SIGNAL = /^\s*[A-Za-z]{0,4}[\d\W]*\s*$|^\s*\d{4}\s*$/;

/** Names the Board of Studies, however it is abbreviated. */
const isBos = (t) => /\bj?bos\w*\b|board\s*of\s*stud/i.test(t);

/**
 * Department behind a run-together Board of Studies title ("BosPhy", "BosCh",
 * "BosMan"), read from the letters after "bos".
 *
 * Only unambiguous abbreviations are decoded. A single letter is not: "bosc"
 * could be Chemistry, Civil or CSE, and "bosm" could be Mechanical, Maths or
 * Management. Those go to review rather than being filed onto some
 * department's page on a coin flip.
 */
const BOS_SUFFIX = [
  [/^(chem|ch)$/i, DEPT.hs], [/^(phys?|phy)$/i, DEPT.hs], [/^(maths?|mat)$/i, DEPT.hs],
  [/^(eng|english)$/i, DEPT.hs], [/^(hum|humanities)$/i, DEPT.hs], [/^bio\w*$/i, DEPT.hs],
  [/^(man|mgmt|mba)$/i, DEPT.mba], [/^(mech\w*)$/i, DEPT.mechanical],
  [/^(civ\w*)$/i, DEPT.civil], [/^eee$/i, DEPT.eee], [/^ece$/i, DEPT.ece],
  [/^(cse|comp\w*)$/i, DEPT.cse],
];

function bosDeptFromSuffix(title) {
  const m = /^\s*j?bos[\s._-]*([a-z&]+)/i.exec(title || "");
  if (!m) return null;
  const suffix = m[1];
  if (suffix.length < 2) return null;
  for (const [rx, dept] of BOS_SUFFIX) if (rx.test(suffix)) return dept;
  return null;
}

/**
 * First match wins, so the order matters: the most specific pattern comes
 * before the general one it would otherwise be swallowed by.
 */
const RULES = [
  // --- Examinations, most specific first --------------------------------
  { name: "Exam - time tables", section: "examinations.timetables",
    test: (t) => /time\s*tab|timetable|\bTT[\s-]/i.test(t) },
  { name: "Exam - academic calendars", section: "examinations.calendars",
    test: (t) => /academic\s*calend|academic\s*schedule/i.test(t) },
  { name: "Exam - results", section: "examinations.results",
    test: (t) => /\bresults?\b|revaluation|recounting|\brevalu/i.test(t) },
  { name: "Exam - question papers", section: "examinations", category: "QUESTION_PAPER",
    test: (t) => /model\s*paper|question\s*paper|previous.*paper|\bQP\b/i.test(t) },
  { name: "Exam - notifications & circulars", section: "examinations.notifications",
    test: (t) => /\bnotification\b|\bcircular\b|\bsupple\w*|\bsupply\s*exam/i.test(t) &&
                 !/campus/i.test(t) },
  // Before the general examinations rule: a Doctoral Research Committee paper
  // is titled "Even Sem First DRC", so the word "Sem" would otherwise claim it
  // for Examinations.
  { name: "Research - doctoral committee", section: "research",
    test: (t) => /\bDRC\b/i.test(t) },
  { name: "Exam - general", section: "examinations",
    test: (t) => /\broll\s*list\b|\bmid\b|\bexam(ination)?s?\b|\bR\d{2}(UG|PG)\b|\bsem(ester)?\b/i.test(t) },

  // --- Academics ---------------------------------------------------------
  { name: "Syllabus", section: "syllabus", category: "SYLLABUS",
    test: (t) => /syllab/i.test(t) },
  { name: "Regulations", section: "academics.regulations",
    test: (t) => /regulation/i.test(t) },

  // --- Admissions --------------------------------------------------------
  // Split by the level the form is for - an "M TECH CATEGORY B APPLICATION"
  // belongs on the postgraduate page, not the B.Tech one.
  { name: "Admissions - category B / NRI (PG)", section: "admissions.pg",
    test: (t) => /category[\s-]*b\b|\bnri\b/i.test(t) && /\bm\.?\s*tech\b|\bmba\b|\bmca\b|\bpg\b/i.test(t) },
  { name: "Admissions - category B / NRI (UG)", section: "admissions.ug",
    test: (t) => /category[\s-]*b\b|\bnri\b/i.test(t) },

  // --- Board of Studies -------------------------------------------------
  //
  // BEFORE the IQAC minutes rule, not after. "BOS Minutes English 2019" is a
  // department's Board of Studies paper, not an IQAC minute - but it contains
  // the word "minutes", so with the other order all three BoS minute files
  // were filed onto the IQAC page. First match wins, so the more specific
  // subject has to be tested first.
  //
  // The department is read from anywhere in the title, because the branch is
  // as often at the end ("BOS Minutes English 2019") as next to "BOS".
  { name: "Board of Studies - Civil", section: "board-of-studies", dept: DEPT.civil,
    test: (t) => isBos(t) && /\b(ce|civil)\b/i.test(t) },
  // No special case for a bare "bosm". It sits in a family with bosc, bose,
  // bosh and bosp, and a single letter could be Mechanical, Maths or
  // Management - the family is far more likely to be the H&S subjects
  // (Chemistry, English, Humanities, Maths, Physics), but "more likely" is
  // not good enough to publish on, so the whole family goes to review
  // together rather than one of them being filed on a hunch.
  { name: "Board of Studies - Mechanical", section: "board-of-studies", dept: DEPT.mechanical,
    test: (t) => isBos(t) && /\b(me|mech\w*)\b/i.test(t) },
  { name: "Board of Studies - EEE", section: "board-of-studies", dept: DEPT.eee,
    test: (t) => isBos(t) && /\beee\b|electrical/i.test(t) },
  { name: "Board of Studies - ECE", section: "board-of-studies", dept: DEPT.ece,
    test: (t) => isBos(t) && /\bece\b|electronics/i.test(t) },
  { name: "Board of Studies - CSE", section: "board-of-studies", dept: DEPT.cse,
    test: (t) => isBos(t) && /\b(cse|cs)\b|computer/i.test(t) },
  { name: "Board of Studies - MBA", section: "board-of-studies", dept: DEPT.mba,
    test: (t) => isBos(t) && /\bmba\b|management/i.test(t) },
  // English, physics, chemistry and mathematics are taught by Humanities &
  // Sciences, so their Board of Studies papers belong to that department.
  { name: "Board of Studies - H&S", section: "board-of-studies", dept: DEPT.hs,
    test: (t) => isBos(t) &&
      /h&s|\bphy\w*|\bchem\w*|\bmaths?\b|mathematics|humanities|english|biology/i.test(t) },

  // --- Quality / accreditation ------------------------------------------
  // Excludes Board of Studies papers explicitly. "Minutes of BOS meeting 10
  // 01 2021" matches "minutes" but is a department's paper, and putting it on
  // the IQAC page would be filing it onto the wrong page rather than leaving
  // it unfiled - the worse of the two outcomes.
  { name: "IQAC - minutes & agenda", section: "iqac.minutes",
    test: (t) => /\bminutes\b|\bmom\b|\bagenda\b/i.test(t) &&
                 !/\bone\s*minute\b/i.test(t) && !isBos(t) },
  { name: "IQAC - AQAR", section: "iqac.aqar", test: (t) => /\baqar\b/i.test(t) },
  { name: "IQAC", section: "iqac", test: (t) => /\biqac\b/i.test(t) },
  { name: "NAAC", section: "naac",
    test: (t) => /\bnaac\b|\bssr\b|\bcriteri(a|on)\b|^\s*\d\.\d(\.\d)*/i.test(t) },
  { name: "Accreditation - NIRF / ARIIA / NBA", section: "accreditation",
    test: (t) => /\bnirf\b|\bariia\b|\bnba\b|accreditat/i.test(t) },

  // --- Placements & careers ---------------------------------------------
  // --- Placements & careers ---------------------------------------------
  { name: "Placements - MoUs", section: "placements.mous",
    test: (t) => /\bmou\b|memorandum of understanding/i.test(t) },
  { name: "Placements - internships", section: "placements.internships",
    test: (t) => /\bintern(ship)?s?\b/i.test(t) },
  { name: "Placements - training", section: "placements.trainings",
    test: (t) => /\btraining\b|\bworkshop\b|\bFDP\b|\bwebinar\b/i.test(t) },
  { name: "Placements", section: "placements",
    test: (t) => /placement|campus\s*drive|selected\s*student|\brecruit/i.test(t) },
  { name: "Careers", section: "careers",
    test: (t) => /faculty\s*advertisement|\brecruitment\b|\bvacanc/i.test(t) },

  // --- Everything else ---------------------------------------------------
  { name: "Research", section: "research",
    test: (t) => /\bresearch\b|\bpatent|\bpublication|\bjournal\b|\bDRC\b|\bPh\.?D\b/i.test(t) },
  { name: "Alumni", section: "alumni", test: (t) => /\balumni\b/i.test(t) },
  { name: "Startup / innovation", section: "startup-cell",
    test: (t) => /\bstartup\b|\bincubat|innovation/i.test(t) },
  { name: "Anti-ragging", section: "anti-ragging", test: (t) => /anti[\s-]*ragg/i.test(t) },
  { name: "Grievance", section: "grievance", test: (t) => /grievance/i.test(t) },
  { name: "Library", section: "library", test: (t) => /\blibrary\b/i.test(t) },
  { name: "Hostels", section: "hostels", test: (t) => /\bhostel\b/i.test(t) },
  { name: "Transport", section: "transport", test: (t) => /\btransport\b|\bbus\s*(route|fee)/i.test(t) },
  { name: "Sports", section: "sports", test: (t) => /\bsports?\b|\bgames\b|\bathletic/i.test(t) },
  { name: "NSS", section: "nss", test: (t) => /\bNSS\b/.test(t) },
];

function classify(rawTitle) {
  const t = (rawTitle || "").trim();
  if (!t) return { kind: "skip", why: "no title" };
  if (ROLL_NUMBER.test(t)) return { kind: "review", why: "student roll number" };

  // Board of Studies is checked before the "no signal" test below, because
  // those titles are short and cryptic by nature ("bosc", "BosPhy", "BOS 1")
  // and were being discarded as meaningless. We know what they are; what we
  // often do not know is whose they are.
  if (isBos(t)) {
    const dept = bosDeptFromSuffix(t);
    if (dept) {
      return { kind: "classify", rule: { name: "Board of Studies - by abbreviation", section: "board-of-studies", dept } };
    }
    const byRule = RULES.find((r) => r.test(t));
    if (byRule && byRule.section === "board-of-studies") return { kind: "classify", rule: byRule };
    return { kind: "review", why: "Board of Studies paper - title does not say which department" };
  }

  if (NO_SIGNAL.test(t)) return { kind: "skip", why: "title carries no subject" };
  const rule = RULES.find((r) => r.test(t));
  if (rule) return { kind: "classify", rule };
  // A Board of Studies paper whose title never says which department it
  // belongs to. Filing it under board-of-studies without a department would
  // look done but change nothing: the department page matches on department
  // id, so it would still appear nowhere. Better to say so.
  if (isBos(t)) {
    return { kind: "review", why: "Board of Studies paper - title does not say which department" };
  }
  if (PERSON_NAME.test(t)) return { kind: "review", why: "personal name (likely a CV or profile)" };
  return { kind: "skip", why: "no recognisable subject" };
}

async function login() {
  const email = process.env.ADMIN_EMAIL || "superadmin@ksrm.edu";
  const password = process.env.ADMIN_PASSWORD || "SuperAdmin@123";
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  const d = await res.json();
  const token = d.accessToken || d.token || d.access_token;
  if (!token) throw new Error("login returned no token");
  return token;
}

async function main() {
  let all;
  let token = null;

  if (fileArg) {
    const fs = await import("node:fs");
    all = JSON.parse(fs.readFileSync(fileArg, "utf-8"));
    console.log(`Reading ${all.length} documents from ${fileArg} (dry run, no API).\n`);
  } else {
    token = await login();
    const res = await fetch(`${API}/downloads/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    all = await res.json();
    console.log(`${all.length} documents from the API. ${WRITE ? "WRITE MODE" : "DRY RUN"}\n`);
  }

  const target = all.filter((d) => !d.pageSection && !d.deletedAt);
  console.log(`${target.length} of them have no page section - these are the ones in scope.\n`);

  const byRule = new Map();
  const review = new Map();
  const skipped = new Map();
  const rows = [];
  let applied = 0;
  let failed = 0;

  for (const item of target) {
    const verdict = classify(item.title);

    if (verdict.kind === "review") {
      review.set(verdict.why, (review.get(verdict.why) ?? 0) + 1);
      rows.push([item.id, item.title, "NEEDS REVIEW", verdict.why]);
      continue;
    }
    if (verdict.kind === "skip") {
      skipped.set(verdict.why, (skipped.get(verdict.why) ?? 0) + 1);
      rows.push([item.id, item.title, "LEFT ALONE", verdict.why]);
      continue;
    }

    const { rule } = verdict;
    byRule.set(rule.name, (byRule.get(rule.name) ?? 0) + 1);
    rows.push([item.id, item.title, rule.section, rule.dept ? `dept ${rule.dept}` : ""]);

    if (!WRITE || !token) continue;

    const patch = { pageSection: rule.section, version: item.version };
    if (rule.category) patch.category = rule.category;
    if (rule.dept) patch.departmentId = rule.dept;

    const r = await fetch(`${API}/downloads/${item.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) applied++;
    else {
      failed++;
      console.error(`  patch failed #${item.id} "${item.title}": ${await r.text()}`);
    }
    // Comfortably under the API's 600/min throttle.
    await new Promise((res) => setTimeout(res, 110));
  }

  const total = [...byRule.values()].reduce((a, b) => a + b, 0);
  console.log("=== WOULD BE FILED ===");
  for (const [n, c] of [...byRule].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(c).padStart(5)}  ${n}`);
  }
  console.log(`  ${String(total).padStart(5)}  TOTAL filed onto a page\n`);

  console.log("=== NEEDS A HUMAN DECISION (never auto-filed) ===");
  for (const [n, c] of [...review].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(c).padStart(5)}  ${n}`);
  }
  console.log("\n=== LEFT EXACTLY AS THEY ARE ===");
  for (const [n, c] of [...skipped].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(c).padStart(5)}  ${n}`);
  }

  if (reportArg) {
    const fs = await import("node:fs");
    const csv = ["id,title,destination,note"]
      .concat(rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")))
      .join("\n");
    fs.writeFileSync(reportArg, csv);
    console.log(`\nFull line-by-line report written to ${reportArg}`);
  }

  if (WRITE) console.log(`\nApplied: ${applied}, Failed: ${failed}`);
  else console.log(`\nDRY RUN - nothing was changed. Add --write to apply.`);
}

main().catch((err) => {
  console.error("FATAL", err);
  process.exit(1);
});
