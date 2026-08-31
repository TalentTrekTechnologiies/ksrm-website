/**
 * Re-scrubs the raw recording into the specimen's snapshot, without crawling
 * the site again. Run after changing a rule in scrub.mjs, then re-run the
 * audit - that loop is seconds rather than the recorder's several minutes.
 *
 *   node scripts/demo/scrub-snapshot.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { DEMO_NAME, DEMO_SHORT, scrubValue, scrubRecord, isDroppable } from "./scrub.mjs";

const RAW = path.join(process.cwd(), "..", "scratchpad", "demo-raw.json");
const TARGET = path.join(process.cwd(), "public", "demo", "api-snapshot.json");

if (!fs.existsSync(RAW)) {
  console.error(`No raw recording at ${RAW} - run scripts/demo/record-api.mjs first.`);
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(RAW, "utf-8"));
const clean = {};
let dropped = 0;

for (const [key, value] of Object.entries(snapshot)) {
  clean[key] = Array.isArray(value)
    ? value.map(scrubRecord).filter((r) => {
        if (isDroppable(r)) { dropped++; return false; }
        return true;
      })
    : scrubValue(scrubRecord(value));
}

fs.mkdirSync(path.dirname(TARGET), { recursive: true });
fs.writeFileSync(TARGET, JSON.stringify(clean));
const mb = (fs.statSync(TARGET).size / 1024 / 1024).toFixed(2);

console.log(`Dropped ${dropped} records that identified a person or were never catalogued.`);
console.log(`Wrote ${TARGET} (${mb} MB, ${Object.keys(clean).length} endpoints)`);
console.log(`Institution renamed to "${DEMO_NAME}" (${DEMO_SHORT}).`);
