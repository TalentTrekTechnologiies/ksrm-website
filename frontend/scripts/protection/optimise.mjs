/**
 * Protection parameter optimiser.
 *
 *   BASE=http://localhost:3000 node frontend/scripts/protection/optimise.mjs
 *
 * Needs the frontend running (it drives /camera-lab/sweep). Takes several
 * minutes: every candidate is ten OCR passes.
 *
 * Findings from the run recorded in docs/DOCUMENT-PROTECTION.md.
 */
/**
 * Searches the protection parameters for the best trade between an attacker
 * and a reader, scored by OCR - never by a detail metric.
 *
 * For each candidate:
 *   camera      one frame on its own: a short exposure, HDR off
 *   reader      sixteen frames averaged: what the eye integrates to
 *   camera HDR  identical to the reader by construction - HDR IS averaging
 *
 * Objective: maximise (reader recall - camera recall), subject to the reader
 * keeping at least 90% of the words AND 90% of the figures. Figures are held
 * to the bar separately because OCR recovers a damaged word from context and
 * cannot do that for a number, and an accreditation document is mostly numbers.
 *
 * Staged, because each candidate is two OCR passes: a grid over pattern,
 * period and strength, then the leaders refined with dithering and a second
 * spatial frequency.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// Run from anywhere: dependencies resolve from this repo, not the caller.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const fromFrontend = createRequire(path.join(repo, "frontend/package.json"));
const fromBackend = createRequire(path.join(repo, "backend/package.json"));
const require = fromFrontend;
const { chromium } = fromFrontend("playwright");
const sharp = fromBackend("sharp");
const { createWorker } = fromFrontend("tesseract.js");

const WORDS = `Criterion 3 Research Innovations and Extension
The institution provides incentives to teachers who receive state, national and international recognition for research contributions. Supporting documents for the assessment period are enclosed, including sanction letters, utilisation certificates and the audited statement of accounts for each financial year under review.
Figures are reconciled against the annual accounts certified by the statutory auditor. Amounts are stated in Indian rupees and rounded to the nearest thousand.
Sanctioned Utilised Balance Projects Patents Publications Year Projects Papers Grant`;
const FIGURES = `4820000 4617500 202500 37 12 284 2021-22 18 42 1260000 2022-23 24 61 1845000 2023-24 31 77 2410000 2024-25 37 84 2905000`;

const tokens = (t) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
function recall(reference, recognised) {
  const ref = tokens(reference);
  const counts = new Map();
  for (const w of tokens(recognised)) counts.set(w, (counts.get(w) ?? 0) + 1);
  let hit = 0;
  for (const w of ref) {
    const left = counts.get(w) ?? 0;
    if (left > 0) { hit++; counts.set(w, left - 1); }
  }
  return hit / ref.length;
}

const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 820 } });
const worker = await createWorker("eng");
// Set explicitly. The worker's default layout mode is not AUTO, and in that
// mode the clean table came back as noise ("[ver T procs pnprs..."). With AUTO
// and a 2x upscale the same crop reads 100%.
{
  const { PSM } = fromFrontend("tesseract.js");
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
}

async function average(buffers) {
  const raws = await Promise.all(buffers.map((b) => sharp(b).raw().toBuffer({ resolveWithObject: true })));
  const len = raws[0].data.length;
  const acc = new Float64Array(len);
  for (const r of raws) for (let i = 0; i < len; i++) acc[i] += r.data[i];
  const out = Buffer.alloc(len);
  for (let i = 0; i < len; i++) out[i] = Math.round(acc[i] / raws.length);
  return sharp(out, { raw: raws[0].info }).png().toBuffer();
}

// Scored per part, cropped to its own region. Scoring the whole panel in one
// OCR pass let the engine's layout detection mangle the table on a CLEAN page -
// the unprotected baseline "recovered" 27% of its figures - so every figures
// number measured the engine's page segmentation rather than the protection.
const PARTS = {
  heading: "Criterion 3 Research Innovations and Extension",
  paragraph: "The institution provides incentives to teachers who receive state, national and international recognition for research contributions. Supporting documents for the assessment period are enclosed, including sanction letters, utilisation certificates and the audited statement of accounts for each financial year under review.",
  small: "Figures are reconciled against the annual accounts certified by the statutory auditor. Amounts are stated in Indian rupees and rounded to the nearest thousand.",
  numbers: "Sanctioned 4820000 Utilised 4617500 Balance 202500 Projects 37 Patents 12 Publications 284",
  table: "Year Projects Papers Grant 2021-22 18 42 1260000 2022-23 24 61 1845000 2023-24 31 77 2410000 2024-25 37 84 2905000",
};
const WORD_PARTS = ["heading", "paragraph", "small"];
const FIGURE_PARTS = ["numbers", "table"];

let boxes = null;
async function partBoxes() {
  if (boxes) return boxes;
  boxes = await page.evaluate(() => {
    const panel = document.getElementById("panel").getBoundingClientRect();
    const out = {};
    for (const el of document.querySelectorAll("[data-part]")) {
      const r = el.getBoundingClientRect();
      out[el.dataset.part] = {
        left: Math.max(0, Math.round(r.left - panel.left) - 4),
        top: Math.max(0, Math.round(r.top - panel.top) - 4),
        width: Math.round(r.width) + 8,
        height: Math.round(r.height) + 8,
      };
    }
    return out;
  });
  return boxes;
}

async function score(image) {
  const b = await partBoxes();
  const meta = await sharp(image).metadata();
  const per = {};
  for (const [part, ref] of Object.entries(PARTS)) {
    const box = { ...b[part] };
    box.width = Math.min(box.width, meta.width - box.left);
    box.height = Math.min(box.height, meta.height - box.top);
    // Upscaled 2x before OCR, as a competent attacker would. At screen
    // resolution the engine could not read even the CLEAN table - its thin
    // grid lines broke line detection - so every table score measured the
    // engine rather than the protection. Upscaling makes the attacker
    // stronger, which makes this test harder for the protection, not easier.
    const crop = await sharp(image)
      .extract(box)
      .resize(box.width * 2, box.height * 2, { kernel: "lanczos3" })
      .png()
      .toBuffer();
    per[part] = recall(ref, (await worker.recognize(crop)).data.text);
  }
  const mean = (keys) => keys.reduce((n, k) => n + per[k], 0) / keys.length;
  return { words: mean(WORD_PARTS), figures: mean(FIGURE_PARTS), per };
}

const cache = new Map();
async function evaluate(p) {
  const key = JSON.stringify(p);
  if (cache.has(key)) return cache.get(key);
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]))).toString();
  await page.goto(`${base}/camera-lab/sweep/?${qs}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1200);
  const panel = await page.$("#panel");
  const frames = [];
  // Sixteen, not eight: screenshots are not guaranteed to land on
  // alternating frames, and an uneven count of each polarity leaves a
  // residue that makes the reader column look worse than the eye's view.
  for (let f = 0; f < 16; f++) {
    frames.push(await panel.screenshot());
    await page.waitForTimeout(17);
  }
  const camera = await score(frames[0]);
  const reader = await score(await average(frames));
  const r = { p, camera, reader, gap: reader.words - camera.words, frames };
  cache.set(key, r);
  return r;
}

// Relative to the unprotected page, not absolute. OCR misreads a few table
// cells on a perfectly clean page, so an absolute 90% bar is one the original
// document itself fails - and a bar the original fails selects nothing. "The
// reader keeps 90% of what the original gives" is the requirement as stated.
let baselineRef = null;
const feasible = (r) =>
  baselineRef !== null &&
  r.reader.words >= 0.9 * baselineRef.camera.words &&
  r.reader.figures >= 0.9 * baselineRef.camera.figures;
const fmt = (v) => `${Math.round(v * 100)}%`.padStart(5);
function line(r) {
  const p = r.p;
  return (
    `${String(p.pattern).padEnd(10)} f${String(p.freq).padEnd(2)} a${String(p.opacity).padEnd(5)}` +
    ` d${String(p.dither ?? 0).padEnd(4)} f2=${String(p.freq2 ?? 0).padEnd(2)}` +
    ` | camera w${fmt(r.camera.words)} n${fmt(r.camera.figures)}` +
    ` | reader w${fmt(r.reader.words)} n${fmt(r.reader.figures)}` +
    ` | gap ${fmt(r.gap)} ${feasible(r) ? "" : "(reader below bar)"}`
  );
}

console.log("Baseline, no protection:");
const baseline = await evaluate({ pattern: "none", freq: 0, speed: 0, opacity: 0 });
baselineRef = baseline;
console.log("  " + line(baseline));
console.log(
  `  (reader bar: ${Math.round(0.9 * baseline.camera.words * 100)}% words, ${Math.round(0.9 * baseline.camera.figures * 100)}% figures - 90% of the unprotected page)`,
);

console.log("\nStage 1 - pattern x period x strength:");
const stage1 = [];
for (const pattern of ["horizontal", "checker", "random"]) {
  for (const freq of [2, 3, 4]) {
    for (const opacity of [0.1, 0.2, 0.3, 0.4]) {
      const r = await evaluate({ pattern, freq, speed: 1, opacity, dither: 0, freq2: 0 });
      stage1.push(r);
      console.log("  " + line(r));
    }
  }
}

const leaders = stage1.filter(feasible).sort((a, b) => b.gap - a.gap).slice(0, 3);
console.log(`\nStage 2 - refining the ${leaders.length} best feasible settings with dither and a second frequency:`);
const stage2 = [];
for (const lead of leaders) {
  for (const dither of [0, 0.1, 0.2]) {
    for (const freq2 of [0, 5]) {
      const r = await evaluate({ ...lead.p, dither, freq2 });
      stage2.push(r);
      console.log("  " + line(r));
    }
  }
}

const all = [...stage1, ...stage2];
const best = all.filter(feasible).sort((a, b) => b.gap - a.gap)[0];

const dir = process.env.OUT ?? path.join(repo, "docs/protection-evidence/optimiser");
fs.mkdirSync(dir, { recursive: true });

console.log("\n==================== RESULT ====================");
console.log("Baseline:  " + line(baseline));
if (best) {
  console.log("Best:      " + line(best));
  fs.writeFileSync(`${dir}/best-camera.png`, best.frames[0]);
  fs.writeFileSync(`${dir}/best-reader.png`, await average(best.frames));
  fs.writeFileSync(`${dir}/best.json`, JSON.stringify({ params: best.p, camera: best.camera, reader: best.reader, gap: best.gap }, null, 2));
  const drop = baseline.camera.words - best.camera.words;
  console.log(
    `\nA single-frame capture loses ${Math.round(drop * 100)} points of word recall against no protection,`,
  );
  console.log(`while the reader keeps ${Math.round(best.reader.words * 100)}% of words and ${Math.round(best.reader.figures * 100)}% of figures.`);
  console.log("\nPer part (camera -> reader), with the unprotected page for reference:");
  for (const k of Object.keys(PARTS)) {
    console.log(`  ${k.padEnd(10)} ${fmt(best.camera.per[k])} -> ${fmt(best.reader.per[k])}   (unprotected ${fmt(baseline.camera.per[k])})`);
  }
} else {
  console.log("No setting kept the reader at 90% of words and figures while costing the camera anything.");
}
console.log(
  "\nCamera with HDR on is the reader column: HDR averages frames, which is the",
);
console.log("same operation the eye performs. No setting can separate those two.");

await worker.terminate();
await browser.close();
