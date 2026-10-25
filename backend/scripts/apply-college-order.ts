/**
 * Puts the two admin-ordered lists into the college's order (2026-10):
 *
 *   Homepage department cards  CE, CSE, EEE, ECE, ME, H&S, CA, MS, Polytechnic,
 *                              then anything else, then "All Departments"
 *   Syllabus page headings     B.Tech., BCA, M.Tech., MBA, Diploma
 *
 * Both lists are ordered by admins (drag and drop in Admin -> Homepage ->
 * Departments and Admin -> Academics -> Syllabus), so this sets their stored
 * order once rather than overriding it in code - staff can still reorder.
 *
 * Only rows whose position changes are written; each old value is logged and
 * --undo puts it back (unless someone has reordered that row since).
 *
 *   cd backend
 *   npx ts-node scripts/apply-college-order.ts --dry-run
 *   npx ts-node scripts/apply-college-order.ts
 *   npx ts-node scripts/apply-college-order.ts --undo scripts/output/college-order-<time>.json
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const backendRoot = path.resolve(__dirname, '..');
function loadEnv() {
  const envPath = path.join(backendRoot, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }
}
loadEnv();

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const undoIndex = args.indexOf('--undo');

type Table = 'contentCard' | 'syllabusProgramme';
interface Change {
  table: Table;
  id: number;
  label: string;
  from: number;
  to: number;
}

/** Same order as frontend/lib/department-order.ts. */
const DEPARTMENT_ORDER = ['civil', 'cse', 'eee', 'ece', 'mech', 'hs', 'bca', 'mba', 'polytechnic'];
const DEPARTMENT_ALIASES: Record<string, string> = {
  ce: 'civil',
  me: 'mech',
  mechanical: 'mech',
  'humanities-sciences': 'hs',
  ca: 'bca',
  mca: 'bca',
  ms: 'mba',
  diploma: 'polytechnic',
};

function cardRank(linkUrl: string | null): number {
  const url = (linkUrl ?? '').trim().toLowerCase().replace(/\/+$/, '');
  if (url === '/departments') return 1000; // "All Departments" closes the row
  const slug = url.split('/').pop() ?? '';
  const i = DEPARTMENT_ORDER.indexOf(DEPARTMENT_ALIASES[slug] ?? slug);
  return i < 0 ? DEPARTMENT_ORDER.length : i;
}

const SYLLABUS_ORDER: RegExp[] = [/\bb\.?\s*tech/i, /\bbca\b/i, /\bm\.?\s*tech/i, /\bmba\b/i, /diploma|polytechnic/i];
function syllabusRank(name: string): number {
  const i = SYLLABUS_ORDER.findIndex((re) => re.test(name));
  return i < 0 ? SYLLABUS_ORDER.length : i;
}

/** New positions 0..n-1 by rank, ties keeping their current order. */
function plan<T extends { id: number; sortOrder: number }>(
  table: Table,
  rows: T[],
  rank: (r: T) => number,
  label: (r: T) => string,
): Change[] {
  const current = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const wanted = current
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i)
    .map((x) => x.r);
  wanted.forEach((r, i) => console.log(`  ${String(i).padStart(2)}  ${label(r)}${r.sortOrder === i ? '' : `   (was ${r.sortOrder})`}`));
  return wanted
    .map((r, i) => ({ table, id: r.id, label: label(r), from: r.sortOrder, to: i }))
    .filter((c) => c.from !== c.to);
}

async function write(c: Change, from: number, to: number) {
  const where = { id: c.id, sortOrder: from };
  const data = { sortOrder: to, version: { increment: 1 } };
  const r =
    c.table === 'contentCard'
      ? await prisma.contentCard.updateMany({ where, data })
      : await prisma.syllabusProgramme.updateMany({ where, data });
  return r.count;
}

async function undo(file: string) {
  const changes = JSON.parse(fs.readFileSync(file, 'utf8')) as Change[];
  let n = 0;
  for (const c of changes) n += await write(c, c.to, c.from);
  console.log(`Put back ${n} of ${changes.length}.`);
}

async function apply() {
  console.log('Homepage department cards:');
  const cards = await prisma.contentCard.findMany({
    where: { section: 'homepage_departments', deletedAt: null },
    select: { id: true, sortOrder: true, title: true, linkUrl: true },
  });
  const cardChanges = plan('contentCard', cards, (c) => cardRank(c.linkUrl), (c) => `${c.title ?? '(untitled)'} -> ${c.linkUrl ?? ''}`);

  console.log('\nSyllabus page headings:');
  const programmes = await prisma.syllabusProgramme.findMany({
    where: { deletedAt: null },
    select: { id: true, sortOrder: true, name: true },
  });
  const syllabusChanges = plan('syllabusProgramme', programmes, (p) => syllabusRank(p.name), (p) => p.name);

  const changes = [...cardChanges, ...syllabusChanges];
  console.log(`\n${changes.length} row${changes.length === 1 ? '' : 's'} to move.`);
  if (dryRun || changes.length === 0) return;

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const logFile = path.join(outDir, `college-order-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(logFile, JSON.stringify(changes, null, 1));
  let n = 0;
  for (const c of changes) n += await write(c, c.from, c.to);
  console.log(`Moved ${n}. Record: ${logFile}`);
  console.log(`To reverse: npx ts-node scripts/apply-college-order.ts --undo "${logFile}"`);
}

(undoIndex >= 0 ? undo(args[undoIndex + 1]) : apply())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
