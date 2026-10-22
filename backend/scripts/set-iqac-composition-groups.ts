/**
 * Sets the seven category headings on the IQAC committee's members, so the
 * IQAC page - which now reads the roster from Admin -> Committees instead of a
 * list in the code - keeps the grouped layout it had.
 *
 * The headings are the ones the page used to hard-code, at the same member
 * positions. Before writing anything the script checks the roster still has
 * that shape (Chairperson first, Management second, the HoDs at 13-19, the
 * Coordinator at 28); if staff have reordered it since, it writes nothing and
 * says so - set the headings in Admin -> Committees instead.
 *
 * Only empty headings are filled; every change is logged and --undo reverses it.
 *
 *   cd backend
 *   npx ts-node scripts/set-iqac-composition-groups.ts --dry-run
 *   npx ts-node scripts/set-iqac-composition-groups.ts
 *   npx ts-node scripts/set-iqac-composition-groups.ts --undo scripts/output/iqac-groups-<time>.json
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

/** Position in the roster (0-based) -> the heading that starts there. */
const GROUPS: [number, string][] = [
  [0, 'Chairperson: Head of the Institution'],
  [1, 'Management Members'],
  [2, 'Senior Administrative Officers'],
  [12, 'Senior Teachers'],
  [19, 'Employer / Industry / Stake holder / Members'],
  [22, 'Alumni / Local Society / Student'],
  [27, 'IQAC Core Team'],
];

async function undo(file: string) {
  const changes = JSON.parse(fs.readFileSync(file, 'utf8')) as { id: number; groupLabel: string }[];
  let n = 0;
  for (const c of changes) {
    const r = await prisma.committeeMember.updateMany({
      where: { id: c.id, groupLabel: c.groupLabel },
      data: { groupLabel: null, version: { increment: 1 } },
    });
    n += r.count;
  }
  console.log(`Reverted ${n} of ${changes.length}.`);
}

async function apply() {
  const committees = await prisma.committee.findMany({
    where: { type: 'IQAC', deletedAt: null },
    select: { id: true, name: true },
  });
  // "Finance Committee" also carries type IQAC on production; the roster this
  // is for is the one named IQAC.
  const iqac = committees.find((c) => /^\s*iqac\s*$/i.test(c.name)) ?? committees.find((c) => /iqac/i.test(c.name));
  if (!iqac) {
    console.log(`No IQAC committee found (type IQAC committees: ${committees.map((c) => c.name).join(', ') || 'none'}).`);
    return;
  }
  const members = await prisma.committeeMember.findMany({
    where: { committeeId: iqac.id, deletedAt: null, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true, designation: true, role: true, groupLabel: true },
  });
  console.log(`Committee "${iqac.name}" (#${iqac.id}): ${members.length} members.`);

  const shapeOk =
    members.length >= 28 &&
    /chair/i.test(members[0].role) &&
    /manage/i.test(members[1].role) &&
    /^hod/i.test(members[12].designation) &&
    /^hod/i.test(members[18].designation) &&
    !/^hod/i.test(members[19].designation) &&
    /coordinator/i.test(members[27].role);
  if (!shapeOk) {
    console.log('The roster no longer has the expected order, so nothing was written.');
    console.log('Set the group headings in Admin -> Committees -> IQAC instead.');
    return;
  }

  const changes = GROUPS.filter(([i]) => !members[i].groupLabel).map(([i, label]) => ({
    id: members[i].id,
    name: members[i].name,
    groupLabel: label,
  }));
  for (const c of changes) console.log(`  ${c.groupLabel.padEnd(46)} starts at ${c.name}`);
  if (changes.length === 0) console.log('All headings are already set.');
  if (dryRun || changes.length === 0) return;

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const logFile = path.join(outDir, `iqac-groups-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(logFile, JSON.stringify(changes, null, 1));
  for (const c of changes) {
    await prisma.committeeMember.updateMany({
      where: { id: c.id, groupLabel: null },
      data: { groupLabel: c.groupLabel, version: { increment: 1 } },
    });
  }
  console.log(`Set ${changes.length} headings. Record: ${logFile}`);
  console.log(`To reverse: npx ts-node scripts/set-iqac-composition-groups.ts --undo "${logFile}"`);
}

(undoIndex >= 0 ? undo(args[undoIndex + 1]) : apply())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
