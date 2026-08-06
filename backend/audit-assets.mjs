/**
 * Every string column of every table, checked for /public paths that no longer
 * exist on disk.
 *
 * The earlier check looked at eight tables I happened to think of and missed
 * the rest - which is how the department card images stayed broken after I
 * reported it fixed. This one asks Prisma for the model list rather than
 * trusting a list I wrote by hand.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const PUB = 'D:/ksrm-website/frontend/public';

const broken = new Map(); // path -> [ "model.field #id", ... ]

for (const model of Prisma.dmmf.datamodel.models) {
  const stringFields = model.fields
    .filter((f) => f.kind === 'scalar' && (f.type === 'String') && !f.isList)
    .map((f) => f.name);
  if (stringFields.length === 0) continue;

  const delegate = prisma[model.name.charAt(0).toLowerCase() + model.name.slice(1)];
  if (!delegate?.findMany) continue;

  let rows = [];
  try {
    rows = await delegate.findMany({ select: Object.fromEntries([['id', true], ...stringFields.map((f) => [f, true])]) });
  } catch {
    try { rows = await delegate.findMany(); } catch { continue; }
  }

  for (const row of rows) {
    for (const f of stringFields) {
      const v = row[f];
      if (typeof v !== 'string') continue;
      if (!v.startsWith('/') || v.startsWith('/api/')) continue;
      if (!/\.(png|jpe?g|webp|gif|svg|mp4|pdf|docx?|xlsx?)$/i.test(v)) continue;
      const rel = decodeURIComponent(v.split('?')[0]);
      if (fs.existsSync(PUB + rel)) continue;
      const where = `${model.name}.${f} #${row.id}`;
      broken.set(rel, [...(broken.get(rel) ?? []), where]);
    }
  }
}

const recoverable = [];
const neverExisted = [];
for (const [rel, uses] of broken) {
  const webp = rel.replace(/\.(png|jpe?g)$/i, '.webp');
  (webp !== rel && fs.existsSync(PUB + webp) ? recoverable : neverExisted).push([rel, uses]);
}

console.log(`Tables scanned: ${Prisma.dmmf.datamodel.models.length}\n`);
console.log(`=== BROKEN BY THE WEBP CONVERSION (${recoverable.length}) - restorable ===`);
for (const [rel, uses] of recoverable.sort()) console.log(`   ${rel}\n      used by: ${uses.join(', ')}`);
console.log(`\n=== MISSING FOR OTHER REASONS (${neverExisted.length}) ===`);
for (const [rel, uses] of neverExisted.sort()) console.log(`   ${rel}  (${uses.length} row${uses.length > 1 ? 's' : ''})`);

await prisma.$disconnect();
