/**
 * Fails if any source file contains a control character.
 *
 * This exists because the same bug shipped four times in one week, and every
 * time it was invisible in a diff, in review, and in the editor.
 *
 * Writing `\b` inside a regex through a shell heredoc turns it into a literal
 * 0x08 backspace byte, because that is what `\b` means to a string escape.
 * `/<0x08>MBA<0x08>/` and `/<0x08>AY.../` are perfectly valid regexes - they
 * just match a backspace character, which no title contains - so nothing
 * errors, nothing warns, and the code silently matches nothing:
 *
 *   - the MBA table vanished from Courses & Intake and MBA was filed under
 *     M.Tech
 *   - IQAC's minutes matched nothing and the section stayed empty
 *   - the academic year was read from the admission batch, filing this year's
 *     calendars four years back
 *
 * A build that passes every other check can still be wrong in this way, so it
 * is checked directly.
 *
 *   node scripts/check-control-chars.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components", "lib", "data", "scripts"];
const EXTS = new Set([".ts", ".tsx", ".mjs", ".js", ".json", ".css"]);

/** Tab, newline and carriage return are ordinary whitespace, not mistakes. */
const ALLOWED = new Set([0x09, 0x0a, 0x0d]);

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (EXTS.has(path.extname(full))) check(full);
  }
}

function check(file) {
  const text = fs.readFileSync(file, "utf-8");
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x1f || ALLOWED.has(code)) continue;
    const line = text.slice(0, i).split("\n").length;
    const context = text.slice(Math.max(0, i - 40), i + 40).replace(/[\x00-\x1f]/g, "<?>");
    findings.push({ file, line, code, context });
  }
}

for (const root of ROOTS) {
  if (fs.existsSync(root)) walk(root);
}

if (findings.length === 0) {
  console.log("check-control-chars: clean");
  process.exit(0);
}

console.error(`\ncheck-control-chars: ${findings.length} control character(s) in source.\n`);
for (const f of findings.slice(0, 20)) {
  const name = `0x${f.code.toString(16).padStart(2, "0")}`;
  console.error(`  ${f.file}:${f.line}  ${name}`);
  console.error(`      ...${f.context}...`);
}
console.error(
  "\nA regex written through a shell heredoc is the usual cause: \\b becomes a\n" +
    "backspace byte, and the regex then matches nothing without erroring.\n",
);
process.exit(1);
