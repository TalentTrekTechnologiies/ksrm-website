/**
 * Rewrites every absolute media/file URL stored in the database from one
 * origin to another. Run this ONCE at deployment (and again any time the
 * backend's public origin changes), because historical rows store absolute
 * URL snapshots (e.g. http://localhost:4000/media/file/...) that would 404
 * on the production domain.
 *
 * Usage (from backend/, with DATABASE_URL set):
 *   node scripts/rebase-media-urls.js --from http://localhost:4000 --to https://api.ksrmce.ac.in
 *   node scripts/rebase-media-urls.js --from http://localhost:4000 --to https://api.ksrmce.ac.in --dry-run
 *
 * Safe to re-run: rows already on the new origin are untouched.
 */
const { PrismaClient } = require('@prisma/client');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const FROM = (arg('from') || '').replace(/\/$/, '');
const TO = (arg('to') || '').replace(/\/$/, '');
const DRY = process.argv.includes('--dry-run');

if (!FROM || !TO || !/^https?:\/\//.test(FROM) || !/^https?:\/\//.test(TO)) {
  console.error('Usage: node scripts/rebase-media-urls.js --from <old-origin> --to <new-origin> [--dry-run]');
  process.exit(1);
}

// Every (table, url-column) pair that stores absolute media URLs. Extend this
// list if a new module gains a mediaId-backed URL column.
const TARGETS = [
  ['Faculty', 'photoUrl'],
  ['Download', 'fileUrl'],
  ['GalleryImage', 'imageUrl'],
  ['News', 'imageUrl'],
  ['Event', 'imageUrl'],
  ['HomepageHero', 'videoUrl'],
  ['CareerApplication', 'resumeUrl'],
  ['PageBanner', 'imageUrl'],
  ['Testimonial', 'photoUrl'],
  ['Recruiter', 'logoUrl'],
  ['AccreditationBadge', 'imageUrl'],
  ['ContentCard', 'imageUrl'],
  ['Department', 'heroImageUrl'],
  ['Placement', 'photoUrl'],
  ['Research', 'documentUrl'],
  ['Lab', 'imageUrl'],
  ['SiteSetting', 'value'],
];

(async () => {
  const prisma = new PrismaClient();
  let total = 0;
  console.log(`${DRY ? '[DRY RUN] ' : ''}Rebasing media URLs: ${FROM} -> ${TO}\n`);
  for (const [table, column] of TARGETS) {
    try {
      const countRows = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS n FROM "${table}" WHERE "${column}" LIKE $1`,
        `${FROM}/%`,
      );
      const n = countRows[0]?.n ?? 0;
      if (n === 0) continue;
      if (!DRY) {
        await prisma.$executeRawUnsafe(
          `UPDATE "${table}" SET "${column}" = REPLACE("${column}", $1, $2) WHERE "${column}" LIKE $3`,
          FROM,
          TO,
          `${FROM}/%`,
        );
      }
      console.log(`${table}.${column}: ${n} row(s) ${DRY ? 'would be' : ''} updated`);
      total += n;
    } catch (e) {
      // Table/column may not exist in older schemas - report and continue.
      console.warn(`${table}.${column}: skipped (${e.message.split('\n')[0].slice(0, 80)})`);
    }
  }
  console.log(`\n${DRY ? '[DRY RUN] ' : ''}Total: ${total} row(s)`);
  await prisma.$disconnect();
})();
