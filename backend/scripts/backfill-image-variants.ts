/**
 * Creates the smaller WebP copies (HERO, LARGE, MEDIUM, SMALL, THUMBNAIL) for
 * images that never had them.
 *
 * Images uploaded through the CMS get these on upload. The ones imported from
 * the old site did not - only their original was registered - so every grid
 * that shows them (Gallery, Campus Life, department galleries) downloaded the
 * full-size original of every photo: 0.5-1.8 MB each, ~70 MB for the Gallery
 * page. The site now asks for MEDIUM/WEBP and falls back to the original when
 * it is missing, so running this makes those pages light without any further
 * deploy.
 *
 * Safe to run more than once: an image that already has a size is skipped, and
 * the original and its existing variant row are never touched. Runs one image
 * at a time so a small server stays responsive while it works.
 *
 *   cd backend
 *   npx ts-node scripts/backfill-image-variants.ts --dry-run   # count only
 *   npx ts-node scripts/backfill-image-variants.ts             # do it
 *
 * Run it from the backend folder, the same place the API runs from, so
 * MEDIA_STORAGE_ROOT resolves to the same directory.
 */
import { PrismaClient, MediaVariantSize } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const backendRoot = path.resolve(__dirname, '..');
const envPath = path.join(backendRoot, '.env');

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }
}
loadEnv();

// Same sizes and quality as MediaImageProcessingService, WebP only - the site
// asks for WebP, and skipping the SOURCE-format copies halves the work.
const TARGETS: { size: MediaVariantSize; maxDimension: number }[] = [
  { size: 'HERO', maxDimension: 1920 },
  { size: 'LARGE', maxDimension: 1200 },
  { size: 'MEDIUM', maxDimension: 800 },
  { size: 'SMALL', maxDimension: 400 },
  { size: 'THUMBNAIL', maxDimension: 200 },
];

// Resolved like LocalDiskStorageAdapter: relative to where the process runs.
const storageRoot = path.resolve(process.env.MEDIA_STORAGE_ROOT ?? './storage/media');
const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

function resolveKey(key: string): string {
  const resolved = path.resolve(storageRoot, key);
  if (!resolved.startsWith(storageRoot)) throw new Error(`Invalid storage key: ${key}`);
  return resolved;
}

function allocateKey(): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return path.posix.join(yyyy, mm, `${randomUUID()}.webp`);
}

async function main() {
  const images = await prisma.media.findMany({
    where: { type: 'IMAGE', deletedAt: null, NOT: { extension: 'svg' } },
    select: { id: true, storageKey: true, variants: { select: { variant: true, format: true, cropPreset: true, storageKey: true } } },
    orderBy: { id: 'asc' },
  });

  const todo = images
    .map((m) => ({
      media: m,
      missing: TARGETS.filter(
        (t) => !m.variants.some((v) => v.variant === t.size && v.format === 'WEBP' && v.cropPreset === null),
      ),
    }))
    .filter((x) => x.missing.length > 0);

  console.log(`storage: ${storageRoot}`);
  console.log(`${images.length} images; ${todo.length} need smaller copies (${todo.reduce((n, x) => n + x.missing.length, 0)} files).`);
  if (dryRun || todo.length === 0) return;

  let done = 0;
  let failed = 0;
  for (const { media, missing } of todo) {
    const sourceKey =
      media.variants.find((v) => v.variant === 'ORIGINAL' && v.format === 'SOURCE' && v.cropPreset === null)?.storageKey ??
      media.storageKey;
    const source = resolveKey(sourceKey);
    if (!fs.existsSync(source)) {
      failed++;
      console.warn(`media ${media.id}: original file not found (${sourceKey}), skipped`);
      continue;
    }
    for (const target of missing) {
      try {
        const key = allocateKey();
        const dest = resolveKey(key);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const info = await sharp(source)
          .rotate()
          .resize(target.maxDimension, target.maxDimension, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(dest);
        await prisma.mediaVariant.create({
          data: {
            mediaId: media.id,
            variant: target.size,
            format: 'WEBP',
            storageKey: key,
            width: info.width,
            height: info.height,
            sizeBytes: BigInt(info.size),
          },
        });
      } catch (err) {
        failed++;
        console.warn(`media ${media.id} ${target.size}: ${(err as Error).message}`);
      }
    }
    done++;
    if (done % 25 === 0) console.log(`${done}/${todo.length} images done`);
  }
  console.log(`Finished: ${done} images processed, ${failed} problems (listed above, if any).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
