import fs from 'fs';
import path from 'path';

const ROOT = 'D:/ksrm-website/frontend';
const SKIP = ['node_modules', '.next', 'out', '.git'];

const srcs = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.some((s) => e.name === s)) continue;
    const p = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) srcs.push(p);
  }
})(ROOT);

const blob = new Map(srcs.map((p) => [p, fs.readFileSync(p, 'utf8')]));

/** Is this module imported by anything other than itself? */
function imported(p) {
  const rel = p.slice(ROOT.length + 1).replace(/\.tsx?$/, ''); // data/academics/feeStructure
  const base = path.basename(rel);
  for (const [k, t] of blob) {
    if (k === p) continue;
    if (t.includes('@/' + rel)) return true;
    // relative imports ending in the basename
    if (new RegExp(`from ["'][^"']*/${base}["']`).test(t)) return true;
  }
  return false;
}

const groups = { data: [], components: [], lib: [] };
for (const p of srcs) {
  const rel = p.slice(ROOT.length + 1);
  const top = rel.split('/')[0];
  if (!(top in groups)) continue;
  if (/index\.tsx?$/.test(rel)) continue;
  if (!imported(p)) groups[top].push(rel);
}

for (const [g, list] of Object.entries(groups)) {
  console.log(`\n${g}/ - ${list.length} file(s) nothing imports:`);
  for (const f of list.sort()) {
    const bytes = fs.statSync(ROOT + '/' + f).size;
    console.log(`   ${String(bytes).padStart(6)}  ${f}`);
  }
}
