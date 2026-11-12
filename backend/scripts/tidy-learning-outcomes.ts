/**
 * Tidies department PEO / PO / PSO records that show wrongly on the site.
 *
 * 1. A whole sentence typed into Code. Mechanical's PSO 1 had "PSO 1- Apply
 *    their knowledge ..." as its code, its title AND its text, so the card
 *    printed the sentence twice. The code becomes "PSO1", a title that only
 *    repeats it is cleared, and the "PSO 1- " prefix comes off the text.
 *    Where Code held a DIFFERENT sentence from Text (Mechanical's PEOs: new
 *    wording in Code, old in Text), the Code sentence becomes the text.
 *
 * 2. A department whose PEOs are not in the CMS at all. The page then showed
 *    its built-in PEOs, which the CMS could neither edit nor remove. If the
 *    department's PEOs were deleted in the CMS, they are reported and left
 *    alone (restore them from the list); if none were ever entered, the
 *    built-in ones are copied in so they can be edited.
 *
 * Only changes; nothing is deleted. Every change is logged, --undo reverses it.
 *
 *   cd backend
 *   npx ts-node scripts/tidy-learning-outcomes.ts --dry-run
 *   npx ts-node scripts/tidy-learning-outcomes.ts
 *   npx ts-node scripts/tidy-learning-outcomes.ts --undo scripts/output/outcomes-tidy-<time>.json
 */
import { OutcomeType, PrismaClient } from '@prisma/client';
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

/**
 * The built-in PEOs the site falls back to, per department slug - copied from
 * frontend/data/departments/*.ts. Only used for a department with none in
 * the CMS (and none deleted there).
 */
const BUILT_IN_PEOS: Record<string, { code: string; text: string }[]> = {
  mechanical: [
    {
      code: 'PEO1',
      text: 'To excel in their career as competent professionals in Mechanical Engineering and related organizations.',
    },
    {
      code: 'PEO2',
      text: 'To pursue higher education and conduct research for solving complex engineering challenges.',
    },
    {
      code: 'PEO3',
      text: 'To contribute to societal development through ethical practice and professional responsibility.',
    },
  ],
};

type Change =
  | {
      kind: 'tidy';
      id: number;
      before: { code: string; title: string | null; text: string };
      after: { code: string; title: string | null; text: string };
    }
  | { kind: 'created'; id: number }
  /** A deleted record's code moved aside so the tidied one can use it. */
  | { kind: 'released'; id: number; from: string; to: string };

/** "PSO 1- Apply ..." -> "PSO1"; null when the code does not start that way. */
function shortCode(type: OutcomeType, code: string): string | null {
  const m = code.trim().match(/^(PEO|PSO|PO)\s*-?\s*(\d+)/i);
  if (!m || m[1].toUpperCase() !== type) return null;
  return `${type}${m[2]}`;
}
const stripPrefix = (s: string) =>
  s.replace(/^\s*(PEO|PSO|PO)\s*-?\s*\d+\s*[-:.–]\s*/i, '').trim();

async function undo(file: string) {
  const changes = JSON.parse(fs.readFileSync(file, 'utf8')) as Change[];
  let n = 0;
  for (const c of changes) {
    if (c.kind === 'tidy') {
      const r = await prisma.learningOutcome.updateMany({
        where: { id: c.id, code: c.after.code, text: c.after.text },
        data: { ...c.before, version: { increment: 1 } },
      });
      n += r.count;
    } else if (c.kind === 'released') {
      const r = await prisma.learningOutcome.updateMany({
        where: { id: c.id, code: c.to },
        data: { code: c.from, version: { increment: 1 } },
      });
      n += r.count;
    } else {
      const r = await prisma.learningOutcome.updateMany({
        where: { id: c.id, deletedAt: null },
        data: { deletedAt: new Date(), version: { increment: 1 } },
      });
      n += r.count;
    }
  }
  console.log(`Reverted ${n} of ${changes.length}.`);
}

async function apply() {
  const changes: Change[] = [];

  // 1. Sentences in the Code field.
  const all = await prisma.learningOutcome.findMany({
    where: { deletedAt: null },
  });
  for (const o of all) {
    if (o.code.trim().length <= 8) continue;
    const code = shortCode(o.type, o.code);
    if (!code) {
      console.log(
        `  ? #${o.id} ${o.type} code "${o.code.slice(0, 50)}" - not of the form ${o.type}<n>, left alone`,
      );
      continue;
    }
    const sentence = stripPrefix(o.code);
    const title =
      o.title &&
      (stripPrefix(o.title) === '' || sentence.startsWith(stripPrefix(o.title)))
        ? null
        : o.title;
    // When Code holds a different sentence from Text, Code is the newer
    // wording: Mechanical's PEOs were "edited" by typing the new objective
    // into Code, leaving the old one in Text, and the card showed both. The
    // Code sentence becomes the text; the old text is kept in the log.
    const norm = (x: string) =>
      x
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const oldText = stripPrefix(o.text) || o.text;
    const replaced = sentence !== '' && norm(sentence) !== norm(oldText);
    const text = replaced ? sentence : oldText;
    console.log(
      `  #${o.id} ${o.type}: code "${o.code.slice(0, 40)}..." -> "${code}"${title !== o.title ? ', title cleared' : ''}${
        replaced
          ? `
      text now the wording typed into Code: "${sentence.slice(0, 60)}..."
      (old text kept in the log: "${o.text.slice(0, 60)}...")`
          : text !== o.text
            ? ', "' + o.text.slice(0, 8) + '" prefix removed from text'
            : ''
      }`,
    );
    changes.push({
      kind: 'tidy',
      id: o.id,
      before: { code: o.code, title: o.title, text: o.text },
      after: { code, title, text },
    });
  }

  // 2. Departments with no PEOs in the CMS.
  for (const [slug, peos] of Object.entries(BUILT_IN_PEOS)) {
    const dept = await prisma.department.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!dept) continue;
    const existing = await prisma.learningOutcome.findMany({
      where: { departmentId: dept.id, type: 'PEO' },
    });
    const live = existing.filter((o) => !o.deletedAt);
    if (live.length > 0) continue;
    if (existing.length > 0) {
      console.log(
        `  ${dept.name}: no PEOs on the page, but ${existing.length} were DELETED in the CMS - not re-created.`,
      );
      console.log(
        `    Restore them in Admin -> Departments -> ${dept.name} -> PEO / PO / PSO (deleted rows have a Restore button),`,
      );
      console.log(
        '    or add new ones there. Once the page is fixed, a department with no PEOs shows no PEO section.',
      );
      continue;
    }
    console.log(
      `  ${dept.name}: no PEOs in the CMS - will copy in the ${peos.length} the page shows now.`,
    );
    if (!dryRun) {
      for (const [i, p] of peos.entries()) {
        const row = await prisma.learningOutcome.create({
          data: {
            departmentId: dept.id,
            type: 'PEO',
            code: p.code,
            text: p.text,
            sortOrder: i,
          },
        });
        changes.push({ kind: 'created', id: row.id });
      }
    }
  }

  const tidies = changes.filter((c) => c.kind === 'tidy');
  console.log(`\n${tidies.length} record(s) to tidy.`);
  if (dryRun || changes.length === 0) return;

  for (const c of tidies) {
    if (c.kind !== 'tidy') continue;
    // The unique key covers deleted rows: a deleted "PSO1" would block the
    // rename. Its code moves aside (the record is kept), as the CMS now does.
    const row = await prisma.learningOutcome.findUnique({
      where: { id: c.id },
    });
    if (!row) continue;
    const holders = await prisma.learningOutcome.findMany({
      where: {
        departmentId: row.departmentId,
        type: row.type,
        code: c.after.code,
        id: { not: c.id },
      },
    });
    if (holders.some((h) => !h.deletedAt)) {
      console.log(
        `  #${c.id}: ${c.after.code} is used by another live record - left as it is.`,
      );
      continue;
    }
    for (const h of holders) {
      const to = `${c.after.code} (deleted #${h.id})`;
      await prisma.learningOutcome.update({
        where: { id: h.id },
        data: { code: to, version: { increment: 1 } },
      });
      changes.push({ kind: 'released', id: h.id, from: c.after.code, to });
    }
    await prisma.learningOutcome.updateMany({
      where: { id: c.id, code: c.before.code },
      data: { ...c.after, version: { increment: 1 } },
    });
  }
  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const logFile = path.join(
    outDir,
    `outcomes-tidy-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  fs.writeFileSync(logFile, JSON.stringify(changes, null, 1));
  console.log(`Done. Record: ${logFile}`);
  console.log(
    `To reverse: npx ts-node scripts/tidy-learning-outcomes.ts --undo "${logFile}"`,
  );
}

(undoIndex >= 0 ? undo(args[undoIndex + 1]) : apply())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
