import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { MediaResolverService } from './media-resolver.service';
import { MediaUsageService } from './media-usage.service';

/**
 * The reusable "wire a mediaId-bearing field into a consumer module"
 * pattern, extracted after Homepage Hero proved it out - every module
 * integration (Gallery, News, Events, Faculty, Departments, Placements,
 * Committees, Downloads, Site Settings, Research, Admissions, Testimonials,
 * Recruiters, Campus Videos, ...) calls this instead of re-deriving the
 * same validate/resolve/track/untrack sequence Hero originally hand-wrote.
 *
 * Two-phase because a consumer's create()/update() needs to resolve the
 * URL to persist BEFORE the row is saved, but can only sync MediaUsage
 * tracking AFTER the row exists (or already exists, for update()).
 */
@Injectable()
export class MediaLinkService {
  constructor(
    private mediaResolver: MediaResolverService,
    private mediaUsage: MediaUsageService,
  ) {}

  /**
   * Call before saving. Returns the Media Library's current URL for
   * `mediaId` to persist into the consumer's own legacy URL column (so
   * everything downstream - the public API, a future Replace - keeps
   * working unchanged), or `undefined` when no mediaId was given (the
   * caller's own DTO value, if any, should be used as-is).
   *
   * Throws BadRequestException (via MediaResolverService.assertUsable) if
   * mediaId doesn't exist, isn't active, or isn't the expected type.
   *
   * Uses buildFileUrl(), not resolveUrl() - a consumer's create() almost
   * always runs moments after MediaService.upload() returns, before the
   * processing queue has created the ORIGINAL/SOURCE MediaVariant row.
   * resolveUrl() requires that row to already exist and would lose this
   * race every time, silently persisting a null URL despite a valid
   * mediaId (see career-applications.service.ts, which already worked
   * around this the same way for resumes). buildFileUrl() constructs the
   * same deterministic URL the queue is guaranteed to make servable within
   * moments, so this is safe for every media type, not just documents.
   */
  async prepareLink(
    mediaId: number | null | undefined,
    expectedType: MediaType,
  ): Promise<string | undefined> {
    if (mediaId === undefined || mediaId === null) return undefined;
    await this.mediaResolver.assertUsable(mediaId, expectedType);
    return this.mediaResolver.buildFileUrl(mediaId, 'ORIGINAL', 'SOURCE');
  }

  /**
   * Call after saving, once the consumer row's id is known. Synchronizes
   * `MediaUsage` for one mediaId-bearing field: tracks a new link, untracks
   * an explicit unlink (`mediaId: null`), or does nothing when `mediaId`
   * wasn't part of this request (`undefined` - the field wasn't touched).
   */
  async syncUsage(
    module: string,
    recordId: number,
    field: string,
    mediaId: number | null | undefined,
  ): Promise<void> {
    if (mediaId === undefined) return;
    if (mediaId === null) {
      await this.mediaUsage.untrack(module, recordId, field);
    } else {
      await this.mediaUsage.track(mediaId, module, recordId, field);
    }
  }

  /** Call when a consumer record is permanently removed (or soft-deleted,
   * per this project's convention of still freeing up delete-protection on
   * soft-delete) so its media usage rows don't outlive it. */
  async untrackAll(module: string, recordId: number): Promise<void> {
    await this.mediaUsage.untrackAll(module, recordId);
  }
}
