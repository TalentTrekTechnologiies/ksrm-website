import { PrismaClient, MediaProcessingStatus, MediaType } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const envPath = path.join(backendRoot, '.env');

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^"(.*)"$/, '$1');
  }
}

loadEnv();

const prisma = new PrismaClient();

const publicRoot = path.join(repoRoot, 'frontend', 'public');
const galleryPagePath = path.join(repoRoot, 'frontend', 'app', 'gallery', 'page.tsx');
const storageRoot = path.resolve(
  backendRoot,
  process.env.MEDIA_STORAGE_ROOT ?? './storage/media',
);
const mediaBaseUrl = (process.env.MEDIA_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '');

type GalleryFallback = {
  src: string;
  alt: string;
  cat: string;
};

const mimeByExt: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function readFallbacks(): GalleryFallback[] {
  const source = fs.readFileSync(galleryPagePath, 'utf8');
  const matches = source.matchAll(
    /\{\s*src:\s*"([^"]+)",\s*alt:\s*"([^"]+)",\s*cat:\s*"([^"]+)"\s*\}/g,
  );
  const bySrc = new Map<string, GalleryFallback>();
  for (const match of matches) {
    const item = { src: match[1], alt: match[2], cat: match[3] };
    if (!bySrc.has(item.src)) bySrc.set(item.src, item);
  }
  return [...bySrc.values()];
}

async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function allocateStorageKey(extension: string): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return path.posix.join(yyyy, mm, `${randomUUID()}.${extension}`);
}

async function copyIntoStorage(sourcePath: string, extension: string) {
  const storageKey = allocateStorageKey(extension);
  const destination = path.join(storageRoot, storageKey);
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.copyFile(sourcePath, destination);
  const stats = await fsp.stat(destination);
  return { storageKey, sizeBytes: stats.size };
}

async function ensureOriginalVariant(
  mediaId: number,
  storageKey: string,
  sourcePath: string,
  sizeBytes: number,
) {
  const existing = await prisma.mediaVariant.findFirst({
    where: { mediaId, variant: 'ORIGINAL', format: 'SOURCE' },
  });
  if (existing) return;

  let width: number | undefined;
  let height: number | undefined;
  try {
    const metadata = await sharp(sourcePath).metadata();
    width = metadata.width;
    height = metadata.height;
  } catch {
    // Best-effort metadata only. The source variant can still serve.
  }

  await prisma.mediaVariant.create({
    data: {
      mediaId,
      variant: 'ORIGINAL',
      format: 'SOURCE',
      storageKey,
      width,
      height,
      sizeBytes,
    },
  });

  await prisma.media.update({
    where: { id: mediaId },
    data: {
      processingStatus: MediaProcessingStatus.COMPLETED,
      processingError: null,
      ...(width && { width }),
      ...(height && { height }),
    },
  });
}

async function main() {
  const fallbacks = readFallbacks();
  let imported = 0;
  let linkedExisting = 0;
  let skippedExistingGallery = 0;
  let skippedMissingFile = 0;

  const currentMaxSort = await prisma.galleryImage.aggregate({
    where: { deletedAt: null },
    _max: { sortOrder: true },
  });
  let sortOrder = (currentMaxSort._max.sortOrder ?? -1) + 1;

  for (const item of fallbacks) {
    const relativeSrc = item.src.replace(/^\//, '');
    const sourcePath = path.join(publicRoot, relativeSrc);
    if (!fs.existsSync(sourcePath)) {
      skippedMissingFile++;
      console.warn(`Missing file, skipped: ${item.src}`);
      continue;
    }

    const alreadyImported = await prisma.galleryImage.findFirst({
      where: {
        OR: [
          { imageUrl: item.src },
          {
            title: item.alt,
            category: item.cat,
            deletedAt: null,
          },
        ],
      },
    });
    if (alreadyImported?.mediaId) {
      skippedExistingGallery++;
      continue;
    }

    const extension = path.extname(sourcePath).slice(1).toLowerCase();
    const mimeType = mimeByExt[extension];
    if (!mimeType) {
      skippedMissingFile++;
      console.warn(`Unsupported gallery image type, skipped: ${item.src}`);
      continue;
    }

    const checksumSha256 = await hashFile(sourcePath);
    let media = await prisma.media.findUnique({ where: { checksumSha256 } });
    if (!media) {
      const { storageKey, sizeBytes } = await copyIntoStorage(sourcePath, extension);
      media = await prisma.media.create({
        data: {
          type: MediaType.IMAGE,
          originalFilename: path.basename(sourcePath),
          storageKey,
          mimeType,
          extension,
          sizeBytes: BigInt(sizeBytes),
          checksumSha256,
          title: item.alt,
          altText: item.alt,
          category: 'Gallery',
          tags: ['gallery', item.cat.toLowerCase()],
          processingStatus: MediaProcessingStatus.COMPLETED,
        },
      });
      await ensureOriginalVariant(media.id, storageKey, sourcePath, sizeBytes);
      imported++;
    } else {
      const mediaPath = path.join(storageRoot, media.storageKey);
      await ensureOriginalVariant(
        media.id,
        media.storageKey,
        fs.existsSync(mediaPath) ? mediaPath : sourcePath,
        Number(media.sizeBytes),
      );
      linkedExisting++;
    }

    const imageUrl = `${mediaBaseUrl}/media/file/${media.id}/ORIGINAL/SOURCE`;
    const gallery = alreadyImported
      ? await prisma.galleryImage.update({
          where: { id: alreadyImported.id },
          data: {
            title: alreadyImported.title || item.alt,
            imageUrl,
            mediaId: media.id,
            category: alreadyImported.category || item.cat,
            sortOrder: alreadyImported.sortOrder ?? sortOrder++,
          },
        })
      : await prisma.galleryImage.create({
          data: {
            title: item.alt,
            imageUrl,
            mediaId: media.id,
            category: item.cat,
            sortOrder: sortOrder++,
            isActive: true,
          },
        });

    await prisma.mediaUsage.upsert({
      where: {
        mediaId_module_recordId_field: {
          mediaId: media.id,
          module: 'gallery',
          recordId: gallery.id,
          field: 'imageUrl',
        },
      },
      update: {},
      create: {
        mediaId: media.id,
        module: 'gallery',
        recordId: gallery.id,
        field: 'imageUrl',
      },
    });
  }

  const totalGalleryRows = await prisma.galleryImage.count({
    where: { deletedAt: null },
  });

  console.log(
    JSON.stringify(
      {
        fallbackImagesFound: fallbacks.length,
        importedNewMedia: imported,
        linkedExistingMedia: linkedExisting,
        skippedExistingGallery,
        skippedMissingFile,
        totalActiveGalleryRows: totalGalleryRows,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
