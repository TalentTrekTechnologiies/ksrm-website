import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Shared helper every consuming module's service calls when wiring a
 * `mediaId` field - resolves it to a servable URL (so the module can keep
 * writing its own legacy string column in sync, meaning nothing downstream
 * has to change) and validates the referenced Media is the expected type
 * before a save is allowed to proceed. Built once here rather than
 * duplicated in every one of the ~15 future module integrations.
 */
@Injectable()
export class MediaResolverService {
  private readonly baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.baseUrl = (
      this.configService.get<string>('MEDIA_BASE_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? 4000}`
    ).replace(/\/$/, '');
  }

  /** Throws BadRequestException if the media doesn't exist, is soft-deleted/
   * inactive, or isn't the expected type - call this before saving a new
   * mediaId onto a consumer row. */
  async assertUsable(mediaId: number, expectedType: MediaType): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null, isActive: true },
    });
    if (!media) {
      throw new BadRequestException(
        `Media ${mediaId} does not exist or is not active.`,
      );
    }
    if (media.type !== expectedType) {
      throw new BadRequestException(
        `Media ${mediaId} is a ${media.type.toLowerCase()}, not a ${expectedType.toLowerCase()}.`,
      );
    }
  }

  /**
   * Resolves a mediaId to a servable URL for the given preferred variant/
   * format, falling back to any other available variant of the same media
   * if the exact one isn't ready yet (still processing), and to `null` if
   * the media doesn't exist/isn't active - callers should keep their own
   * legacy string field as the fallback in that case, not crash.
   */
  async resolveUrl(
    mediaId: number,
    preferredVariant: string,
    preferredFormat: 'SOURCE' | 'WEBP' = 'SOURCE',
  ): Promise<string | null> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null, isActive: true },
    });
    if (!media) return null;

    const exact = await this.prisma.mediaVariant.findFirst({
      where: {
        mediaId,
        variant: preferredVariant as never,
        format: preferredFormat,
      },
    });
    if (exact) return this.buildUrl(mediaId, exact.variant, exact.format);

    const fallback = await this.prisma.mediaVariant.findFirst({
      where: { mediaId },
    });
    if (fallback)
      return this.buildUrl(mediaId, fallback.variant, fallback.format);

    return null;
  }

  /**
   * Builds a file URL without checking whether the MediaVariant row exists
   * yet - use only when the caller knows the variant will exist by the
   * time anyone actually requests it (e.g. immediately after upload, for a
   * VIDEO/DOCUMENT whose sole ORIGINAL/SOURCE variant the processing
   * queue creates within moments, asynchronously - resolveUrl() would lose
   * that race and return null since the queued job hasn't run yet).
   */
  buildFileUrl(mediaId: number, variant: string, format: string): string {
    return this.buildUrl(mediaId, variant, format);
  }

  private buildUrl(mediaId: number, variant: string, format: string): string {
    return `${this.baseUrl}/media/file/${mediaId}/${variant}/${format}`;
  }
}
