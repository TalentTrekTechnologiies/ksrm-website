/**
 * Puts the Central Library Committee into the CMS.
 *
 * The Library page shows a committee table, but no committee in Admin ->
 * Committees is set to show on the Library page, so the page falls back to a
 * list written into its code - which staff can see on the site but cannot
 * find, edit or remove in the CMS. This creates that committee from exactly
 * the rows the page shows today, placed on the Library page; from then on the
 * table is whatever Admin -> Committees says.
 *
 * Nothing is created if a library committee already exists in the CMS - even
 * an inactive one, or one not placed on any page. It is reported instead, so
 * it can be fixed there (activate it, set "Show on page" to Central Library)
 * rather than duplicated.
 *
 *   cd backend
 *   npx ts-node scripts/seed-library-committee.ts --dry-run
 *   npx ts-node scripts/seed-library-committee.ts
 *   npx ts-node scripts/seed-library-committee.ts --undo scripts/output/library-committee-<time>.json
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

const NAME = 'Central Library Committee';

/** The table on frontend/app/campus-life/library/page.tsx, as it shows today. */
const MEMBERS = [
  { name: 'Dr. V.S.S. Murthy', department: 'ME', designation: 'Principal', role: 'Chairman' },
  { name: 'Smt. L. Sasikala', department: 'Library', designation: 'Librarian', role: 'Convener' },
  { name: 'Sri. P. Pavan Kumar', department: 'CE', designation: 'Assistant Professor', role: 'Member' },
  { name: 'Dr. C. Kumar Reddy', department: 'EEE', designation: 'Associate Professor', role: 'Member' },
  { name: 'Sri. D. Merwin Rajesh', department: 'Mechanical', designation: 'Assistant Professor', role: 'Member' },
  { name: 'Miss. S. Jabeen', department: 'ECE', designation: 'Assistant Professor', role: 'Member' },
  { name: 'Miss. T. Anitha', department: 'CSE', designation: 'Assistant Professor', role: 'Member' },
  { name: 'Sri. D. Mallikarjun Reddy', department: 'H&S', designation: 'Assistant Professor', role: 'Member' },
];

async function undo(file: string) {
  const { committeeId } = JSON.parse(fs.readFileSync(file, 'utf8')) as { committeeId: number };
  // A soft delete, like the CMS's own: the rows stay and can be restored.
  const now = new Date();
  const m = await prisma.committeeMember.updateMany({
    where: { committeeId, deletedAt: null },
    data: { deletedAt: now, version: { increment: 1 } },
  });
  const c = await prisma.committee.updateMany({
    where: { id: committeeId, deletedAt: null },
    data: { deletedAt: now, version: { increment: 1 } },
  });
  console.log(`Removed committee #${committeeId} (${c.count}) and ${m.count} members.`);
}

async function apply() {
  const existing = await prisma.committee.findMany({
    where: {
      deletedAt: null,
      OR: [{ placement: 'LIBRARY' }, { name: { contains: 'librar', mode: 'insensitive' } }],
    },
    include: { members: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
  });
  if (existing.length > 0) {
    console.log('A library committee already exists in the CMS - nothing created:');
    for (const c of existing) {
      console.log(
        `  #${c.id} "${c.name}" active=${c.isActive} showOnPage=${c.placement ?? '(none)'} members=${c.members.length}`,
      );
      for (const m of c.members) console.log(`      ${m.isActive ? ' ' : 'x'} ${m.name} - ${m.designation} - ${m.role}`);
    }
    console.log('The page shows it only when it is active and "Show on page" is Central Library (LIBRARY).');
    return;
  }

  console.log(`Will create "${NAME}" (shown on the Library page) with ${MEMBERS.length} members:`);
  MEMBERS.forEach((m, i) => console.log(`  ${i + 1}. ${m.name} - ${m.designation}, ${m.department} - ${m.role}`));
  if (dryRun) return;

  const committee = await prisma.committee.create({
    data: {
      name: NAME,
      type: 'OTHER',
      placement: 'LIBRARY',
      isActive: true,
      members: { create: MEMBERS.map((m, i) => ({ ...m, sortOrder: i, isActive: true })) },
    },
  });
  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const logFile = path.join(outDir, `library-committee-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(logFile, JSON.stringify({ committeeId: committee.id }, null, 1));
  console.log(`Created committee #${committee.id}. Record: ${logFile}`);
  console.log(`To reverse: npx ts-node scripts/seed-library-committee.ts --undo "${logFile}"`);
}

(undoIndex >= 0 ? undo(args[undoIndex + 1]) : apply())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
