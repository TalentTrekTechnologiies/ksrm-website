import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';

/**
 * The ONE public route this module exposes - deliberately isolated from
 * `media.controller.ts` (which is entirely admin-only). There is no public
 * browsing/list endpoint; the public site only ever reaches a file through
 * a URL a consuming module already stored (future, module-by-module work -
 * nothing calls this yet).
 *
 * URLs are always mediaId+variant keyed, never storage-key keyed, so a
 * future Replace can swap the underlying file and every previously-copied
 * URL keeps resolving correctly.
 */
// Exempt from the global rate limit: a single gallery page burst-loads
// dozens of images at once, and browsers/CDNs re-validate aggressively -
// throttling static asset serving only breaks image grids for legit users.
@SkipThrottle()
@ApiTags('media-file')
@Controller('media/file')
export class MediaFileController {
  constructor(
    private prisma: PrismaService,
    private storage: LocalDiskStorageAdapter,
  ) {}

  @Get(':mediaId/:variant/:format')
  async serve(
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Param('variant') variant: string,
    @Param('format') format: string,
    @Query('cropPreset') cropPreset: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // isPrivate is the important one here. Resumes live in this same table,
    // and this route has no auth guard - so without it, every resume ever
    // submitted was downloadable by anyone who walked the id sequence. A 404
    // rather than a 403: whether a given id exists is itself not public.
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null, isActive: true, isPrivate: false },
    });
    if (!media) throw new NotFoundException();

    const variantRow = await this.prisma.mediaVariant.findFirst({
      where: {
        mediaId,
        variant: variant as never,
        format: format as never,
        cropPreset: cropPreset ?? null,
      },
    });
    if (!variantRow) throw new NotFoundException();

    // The URL is mediaId+variant keyed, not storage-key keyed, so a Replace
    // reuses the same URL for new bytes (see class doc comment) - this row's
    // own id changes on every Replace (old variant rows are deleted and
    // recreated, never updated in place), so it doubles as a correct ETag
    // without needing to hash file contents on every request.
    const etag = `"media-${variantRow.id}"`;
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    const contentType = format === 'WEBP' ? 'image/webp' : media.mimeType;
    res.setHeader('Content-Type', contentType);
    // Defense-in-depth for the SVG stored-XSS concern documented in
    // MediaValidationService - even a sanitized SVG shouldn't be sniffable
    // as anything other than what Content-Type declares.
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // NOT `immutable` - the same URL's bytes change on Replace (see above),
    // so a browser/CDN must revalidate rather than trusting a stale copy for
    // a year. `must-revalidate` + ETag keeps repeat loads cheap (a 304 with
    // no body) while guaranteeing a Replace is visible on the next request
    // instead of only after the cache entry happens to expire.
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');

    const stream = this.storage.createReadStream(variantRow.storageKey);
    // A ReadStream's 'error' event has no default handler - if the
    // underlying file is missing (or any other read failure), Node
    // rethrows it as an uncaught exception and crashes the whole process
    // unless something is listening. Respond with a clean error instead.
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).end();
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  }
}
