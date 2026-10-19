/**
 * Puts the IQAC / NAAC / AQAR documents back into the folders they had on the
 * old site, using the Download.folderPath field (shown as nested, expandable
 * folders on the public pages).
 *
 * The migration filed each document by its FIRST folder only - "AQAR/2023-24/
 * Criterion1/CSP/EEE.pdf" became title "EEE" in group "2023-24" - so ~2,400
 * documents sat in a few long, flat lists. The full original path of every
 * imported file was recorded at import time (scripts/data/iqac-old-site-
 * paths.json, in import order); this matches each document back to its path by
 * the same title and group the import gave it, and fills in the folders below
 * the top one ("2023-24/Criterion1/CSP").
 *
 * How a document is matched:
 *   - its group + title occur once among the old paths          -> that folder
 *   - several copies, all from the same folder                  -> that folder
 *   - several copies from different folders, same count as live -> paired by
 *     order. Which way round is measured, not assumed: production received the
 *     documents newest-first, so its ids run in REVERSE import order (checked:
 *     1,773 of 1,774 steps), while a local copy runs forwards. The script reads
 *     the direction off its unique matches before pairing anything.
 *   - anything else (renamed, added later, counts differ)       -> left alone
 *
 * Safety - nothing is deleted or overwritten:
 *   - only documents whose folderPath is EMPTY are touched; a folder an admin
 *     has set is never changed
 *   - titles, files, groups and sections are not touched
 *   - every change is written to scripts/output/ and can be reversed exactly
 *     with --undo
 *
 *   cd backend
 *   npx ts-node scripts/apply-iqac-folders.ts --dry-run       # report only
 *   npx ts-node scripts/apply-iqac-folders.ts                 # apply
 *   npx ts-node scripts/apply-iqac-folders.ts --undo scripts/output/iqac-folders-<time>.json
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

/** The import's own rule (scratchpad import-to-cms.mjs), so titles line up. */
function titleFromFilename(base: string): string {
  const stem = base.replace(/\.[^.]+$/, '');
  const title = /^[\d.()_-]+$/.test(stem) ? stem : stem.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return title.slice(0, 250);
}

interface OldPath {
  folderPath: string | null;
  /** Position in import order. */
  index: number;
}

async function undo(file: string) {
  const changes = JSON.parse(fs.readFileSync(file, 'utf8')) as { id: number; folderPath: string }[];
  let reverted = 0;
  for (const c of changes) {
    // Only reverts a document still holding the folder this script set; one an
    // admin has re-filed since is left as the admin left it.
    const r = await prisma.download.updateMany({
      where: { id: c.id, folderPath: c.folderPath },
      data: { folderPath: null, version: { increment: 1 } },
    });
    reverted += r.count;
  }
  console.log(`Reverted ${reverted} of ${changes.length} documents.`);
}

async function apply() {
  const paths = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'iqac-old-site-paths.json'), 'utf8'),
  ) as string[];

  const byKey = new Map<string, OldPath[]>();
  for (const [index, rel] of paths.entries()) {
    const parts = rel.split('/');
    if (parts.length < 2) continue;
    const groupLabel = (parts[1] || parts[0]).slice(0, 80);
    const title = titleFromFilename(parts[parts.length - 1]);
    const folder = parts.slice(1, -1).join('/');
    const key = `${groupLabel}\u0000${title}`;
    (byKey.get(key) ?? byKey.set(key, []).get(key)!).push({ folderPath: folder || null, index });
  }

  const docs = await prisma.download.findMany({
    where: {
      deletedAt: null,
      OR: [
        { pageSection: { in: ['naac', 'iqac'] } },
        { pageSection: { startsWith: 'naac.' } },
        { pageSection: { startsWith: 'iqac.' } },
      ],
    },
    select: { id: true, title: true, groupLabel: true, folderPath: true },
    orderBy: { id: 'desc' },
  });

  const docsByKey = new Map<string, typeof docs>();
  for (const d of docs) {
    const key = `${d.groupLabel}\u0000${d.title}`;
    (docsByKey.get(key) ?? docsByKey.set(key, []).get(key)!).push(d);
  }

  // Do ids follow import order or run against it? Read it off the unique
  // matches, which need no ordering to place.
  const unique = [...docsByKey.entries()]
    .filter(([key, g]) => g.length === 1 && byKey.get(key)?.length === 1)
    .map(([key, g]) => [g[0].id, byKey.get(key)![0].index] as const)
    .sort((a, b) => a[0] - b[0]);
  let rises = 0;
  let falls = 0;
  for (let i = 1; i < unique.length; i++) (unique[i][1] > unique[i - 1][1] ? rises++ : falls++);
  const idsFollowImport = rises >= falls;
  console.log(
    `Order check on ${unique.length} unique matches: ids run ${idsFollowImport ? 'WITH' : 'AGAINST'} import order (${rises} rise, ${falls} fall).`,
  );
  const decisive = Math.max(rises, falls) >= 0.9 * Math.max(1, rises + falls);
  if (!decisive) console.log('  Not decisive - documents that would need ordering are left alone.');

  const changes: { id: number; title: string; folderPath: string }[] = [];
  let alreadyFiled = 0;
  let noMatch = 0;
  let noFolder = 0;
  for (const [key, group] of docsByKey) {
    const old = byKey.get(key);
    if (!old) {
      noMatch += group.length;
      continue;
    }
    const folders = [...new Set(old.map((o) => o.folderPath))];
    group.forEach((d, i) => {
      let folderPath: string | null | undefined;
      if (old.length === 1 || folders.length === 1) folderPath = folders[0];
      else if (old.length === group.length && decisive) {
        // group is newest id first; old is in import order.
        folderPath = (idsFollowImport ? old[old.length - 1 - i] : old[i]).folderPath;
      }
      else {
        noMatch++;
        return;
      }
      if (!folderPath) {
        noFolder++;
        return;
      }
      if (d.folderPath) {
        alreadyFiled++;
        return;
      }
      changes.push({ id: d.id, title: d.title, folderPath });
    });
  }

  console.log(`IQAC/NAAC documents: ${docs.length}`);
  console.log(`  will be filed into their old folder: ${changes.length}`);
  console.log(`  already in a folder (left alone):     ${alreadyFiled}`);
  console.log(`  no sub-folder on the old site:        ${noFolder}`);
  console.log(`  no confident match (left alone):      ${noMatch}`);
  const tops = new Map<string, number>();
  for (const c of changes) {
    const t = c.folderPath.split('/').slice(0, 2).join('/');
    tops.set(t, (tops.get(t) ?? 0) + 1);
  }
  console.log(
    '  largest folders: ' +
      [...tops.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t, n]) => `${t} (${n})`).join(', '),
  );
  if (dryRun || changes.length === 0) return;

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const logFile = path.join(outDir, `iqac-folders-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(logFile, JSON.stringify(changes, null, 1));

  let done = 0;
  for (const c of changes) {
    // folderPath: null in the where - if an admin filed it while this ran, theirs stands.
    const r = await prisma.download.updateMany({
      where: { id: c.id, folderPath: null },
      data: { folderPath: c.folderPath, version: { increment: 1 } },
    });
    done += r.count;
  }
  console.log(`Filed ${done} documents. Record of every change: ${logFile}`);
  console.log(`To reverse: npx ts-node scripts/apply-iqac-folders.ts --undo "${logFile}"`);
}

(undoIndex >= 0 ? undo(args[undoIndex + 1]) : apply())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
