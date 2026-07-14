import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { IMAGE_VARIANT_TARGETS } from './constants/media-type-map';
import { CROP_PRESETS } from './constants/crop-presets';

type SharpFormat = 'jpeg' | 'png' | 'webp';

function sharpFormatFor(extension: string): SharpFormat {
  if (extension === 'png') return 'png';
  if (extension === 'webp') return 'webp';
  return 'jpeg'; // jpg/jpeg
}

/**
 * Generates the automatic image derivative pyramid on upload (6 sizes x
 * SOURCE/WEBP = up to 12 `MediaVariant` rows) and on-demand named crops.
 * SVG sources are deliberately NOT rasterized into this pyramid - they're
 * already infinitely scalable vectors, so only a single ORIGINAL/SOURCE
 * variant (the sanitized SVG itself) is registered for them. Never
 * upscales past a source image's native resolution (`withoutEnlargement`).
 */
@Injectable()
export class MediaImageProcessingService {
  private readonly logger = new Logger(MediaImageProcessingService.name);

  constructor(
    private prisma: PrismaService,
    private storage: LocalDiskStorageAdapter,
  ) {}

  async generateVariants(
    originalPath: string,
    mediaId: number,
    extension: string,
  ): Promise<{ succeeded: number; failed: number }> {
    if (extension === 'svg') {
      return { succeeded: 0, failed: 0 };
    }

    const format = sharpFormatFor(extension);
    let succeeded = 0;
    let failed = 0;

    for (const target of IMAGE_VARIANT_TARGETS) {
      for (const outputFormat of ['SOURCE', 'WEBP'] as const) {
        try {
          const outExt =
            outputFormat === 'WEBP'
              ? 'webp'
              : extension === 'jpg'
                ? 'jpg'
                : extension;
          const storageKey = this.storage.allocateKey(outExt);
          await this.storage.ensureParentDir(storageKey);
          const destPath = this.storage.resolveKey(storageKey);

          const pipeline = sharp(originalPath)
            .rotate() // auto-orient from EXIF, then strip it on output
            .resize(target.maxDimension, target.maxDimension, {
              fit: 'inside',
              withoutEnlargement: true,
            });

          if (outputFormat === 'WEBP') {
            pipeline.webp({ quality: 78 });
          } else if (format === 'jpeg') {
            pipeline.jpeg({ quality: 82 });
          } else if (format === 'png') {
            pipeline.png({ compressionLevel: 9 });
          } else {
            pipeline.webp({ quality: 82 });
          }

          const info = await pipeline.toFile(destPath);

          await this.prisma.mediaVariant.create({
            data: {
              mediaId,
              variant: target.size as never,
              format: outputFormat,
              storageKey,
              width: info.width,
              height: info.height,
              sizeBytes: BigInt(info.size),
            },
          });
          succeeded++;
        } catch (err) {
          failed++;
          this.logger.warn(
            `Variant generation failed for media ${mediaId} (${target.size}/${outputFormat}): ${(err as Error).message}`,
          );
        }
      }
    }

    return { succeeded, failed };
  }

  /** Registers a single ORIGINAL/SOURCE variant pointing at the same
   * storage key as the archival original - used for non-image types
   * (VIDEO/DOCUMENT this pass) and for SVGs, neither of which get a
   * resized derivative pyramid. */
  async registerSourceOnlyVariant(
    mediaId: number,
    storageKey: string,
    sizeBytes: number,
    width?: number,
    height?: number,
  ): Promise<void> {
    await this.prisma.mediaVariant.create({
      data: {
        mediaId,
        variant: 'ORIGINAL',
        format: 'SOURCE',
        storageKey,
        width,
        height,
        sizeBytes: BigInt(sizeBytes),
      },
    });
  }

  async generateCrop(
    mediaId: number,
    cropPresetKey: string,
    rect: { x: number; y: number; width: number; height: number },
  ) {
    const preset = CROP_PRESETS[cropPresetKey];

    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null },
    });
    if (!media) {
      throw new Error(`Media ${mediaId} not found`);
    }

    const sourcePath = this.storage.resolveKey(media.storageKey);
    const storageKey = this.storage.allocateKey('webp');
    await this.storage.ensureParentDir(storageKey);
    const destPath = this.storage.resolveKey(storageKey);

    const info = await sharp(sourcePath)
      .rotate()
      .extract({
        left: Math.round(rect.x),
        top: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
      .resize(preset.targetWidth, preset.targetHeight, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(destPath);

    return this.prisma.mediaVariant.upsert({
      where: {
        mediaId_variant_format_cropPreset: {
          mediaId,
          variant: 'CROP',
          format: 'WEBP',
          cropPreset: cropPresetKey,
        },
      },
      update: {
        storageKey,
        width: info.width,
        height: info.height,
        sizeBytes: BigInt(info.size),
        sourceCropX: Math.round(rect.x),
        sourceCropY: Math.round(rect.y),
        sourceCropW: Math.round(rect.width),
        sourceCropH: Math.round(rect.height),
      },
      create: {
        mediaId,
        variant: 'CROP',
        format: 'WEBP',
        cropPreset: cropPresetKey,
        storageKey,
        width: info.width,
        height: info.height,
        sizeBytes: BigInt(info.size),
        sourceCropX: Math.round(rect.x),
        sourceCropY: Math.round(rect.y),
        sourceCropW: Math.round(rect.width),
        sourceCropH: Math.round(rect.height),
      },
    });
  }

  /**
   * `protectStorageKey` MUST be passed as the media's current (pre-change)
   * archival storageKey whenever this runs as part of a Replace/Rollback -
   * for VIDEO/DOCUMENT/SVG media (which get no resized derivative pyramid,
   * see `registerSourceOnlyVariant`), the sole ORIGINAL/SOURCE variant's
   * storageKey IS the archival original's storageKey, not a separate
   * derived copy. Deleting it here would delete the very file the
   * `MediaVersion` snapshot just taken still points to, silently
   * corrupting version history (and crashing the file-serving route the
   * next time anything tries to read it). Only genuinely-derived variant
   * files (always a different storageKey) are safe to delete unconditionally.
   */
  async deleteVariantsForMedia(mediaId: number, protectStorageKey?: string): Promise<void> {
    const variants = await this.prisma.mediaVariant.findMany({
      where: { mediaId },
    });
    for (const variant of variants) {
      if (variant.storageKey === protectStorageKey) continue;
      await this.storage.delete(variant.storageKey).catch(() => undefined);
    }
    await this.prisma.mediaVariant.deleteMany({ where: { mediaId } });
  }
}
