import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { MediaImageProcessingService } from './media-image-processing.service';

const CONCURRENCY = 3;

/**
 * Small in-process, bounded-concurrency job queue - deliberately NOT
 * Redis/BullMQ. This backend runs as a single instance; a future
 * horizontally-scaled deployment would need to move this to a real job
 * queue, but that's unbuilt infrastructure this pass doesn't need.
 *
 * Every upload (single file or bulk) writes its `Media` row with
 * `processingStatus: PENDING` and returns immediately - this queue is what
 * actually generates image variants (and, later, transcodes video) in the
 * background, so a 300-image bulk upload or one large single upload never
 * blocks the HTTP response.
 */
@Injectable()
export class MediaProcessingQueueService {
  private readonly logger = new Logger(MediaProcessingQueueService.name);
  private queue: number[] = [];
  private activeCount = 0;

  constructor(
    private prisma: PrismaService,
    private storage: LocalDiskStorageAdapter,
    private imageProcessing: MediaImageProcessingService,
  ) {}

  enqueue(mediaId: number): void {
    this.queue.push(mediaId);
    this.pump();
  }

  private pump(): void {
    while (this.activeCount < CONCURRENCY && this.queue.length > 0) {
      const mediaId = this.queue.shift();
      if (mediaId === undefined) continue;
      this.activeCount++;
      this.processJob(mediaId)
        .catch((err) => {
          this.logger.error(
            `Unhandled error processing media ${mediaId}: ${(err as Error).message}`,
          );
        })
        .finally(() => {
          this.activeCount--;
          this.pump();
        });
    }
  }

  private async processJob(mediaId: number): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null },
    });
    if (!media) return;

    await this.prisma.media.update({
      where: { id: mediaId },
      data: { processingStatus: 'PROCESSING' },
    });

    try {
      const originalPath = this.storage.resolveKey(media.storageKey);
      let width: number | undefined;
      let height: number | undefined;

      if (media.type === 'IMAGE') {
        try {
          const metadata = await sharp(originalPath).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch {
          // Dimension probing is best-effort - a source sharp can't read
          // metadata for (rare, malformed-but-passed-validation input)
          // shouldn't block the rest of processing.
        }

        if (media.extension === 'svg') {
          await this.imageProcessing.registerSourceOnlyVariant(
            mediaId,
            media.storageKey,
            Number(media.sizeBytes),
            width,
            height,
          );
        } else {
          const { succeeded, failed } =
            await this.imageProcessing.generateVariants(
              originalPath,
              mediaId,
              media.extension,
            );
          if (succeeded === 0 && failed > 0) {
            throw new Error(
              `All ${failed} image variant(s) failed to generate`,
            );
          }
        }
      } else {
        // VIDEO/DOCUMENT this pass: register the original as the sole
        // servable variant. No transcoding/thumbnailing yet - see the
        // Media Library plan's "Explicitly deferred" section.
        await this.imageProcessing.registerSourceOnlyVariant(
          mediaId,
          media.storageKey,
          Number(media.sizeBytes),
        );
      }

      await this.prisma.media.update({
        where: { id: mediaId },
        data: {
          processingStatus: 'COMPLETED',
          processingError: null,
          ...(width && { width }),
          ...(height && { height }),
        },
      });
    } catch (err) {
      this.logger.warn(
        `Processing failed for media ${mediaId}: ${(err as Error).message}`,
      );
      await this.prisma.media.update({
        where: { id: mediaId },
        data: {
          processingStatus: 'FAILED',
          processingError: (err as Error).message,
        },
      });
    }
  }
}
