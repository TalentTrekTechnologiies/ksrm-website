import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaController } from './media.controller';
import { MediaFileController } from './media-file.controller';
import { MediaFoldersController } from './media-folders.controller';
import { MediaService } from './media.service';
import { MediaFoldersService } from './media-folders.service';
import { MediaValidationService } from './media-validation.service';
import { MediaImageProcessingService } from './media-image-processing.service';
import { MediaProcessingQueueService } from './media-processing-queue.service';
import { MediaUsageService } from './media-usage.service';
import { MediaSettingsService } from './media-settings.service';
import { MediaStatsService } from './media-stats.service';
import { MediaResolverService } from './media-resolver.service';
import { MediaLinkService } from './media-link.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { STORAGE_ADAPTER } from './storage/storage.constants';

@Module({
  imports: [AuditLogModule],
  // MediaFoldersController/MediaFileController MUST be registered before
  // MediaController - Nest resolves controllers in registration order, and
  // MediaController's `GET /media/:id` would otherwise greedily match
  // `/media/folders` and `/media/file/...` first (":id" matches any single
  // path segment, including "folders"), failing ParseIntPipe instead of
  // reaching the intended controller.
  controllers: [MediaFoldersController, MediaFileController, MediaController],
  providers: [
    MediaService,
    MediaFoldersService,
    MediaValidationService,
    MediaImageProcessingService,
    MediaProcessingQueueService,
    MediaUsageService,
    MediaSettingsService,
    MediaStatsService,
    MediaResolverService,
    MediaLinkService,
    LocalDiskStorageAdapter,
    // The rest of the module depends on the concrete LocalDiskStorageAdapter
    // directly (it's the only implementation and image processing needs its
    // local-path resolution) - this binding exists so a future StorageAdapter
    // consumer can inject the interface by token instead, per the swap-boundary
    // design (see storage-adapter.interface.ts).
    { provide: STORAGE_ADAPTER, useExisting: LocalDiskStorageAdapter },
  ],
  exports: [
    MediaService,
    MediaUsageService,
    MediaStatsService,
    MediaResolverService,
    MediaLinkService,
    LocalDiskStorageAdapter,
  ],
})
export class MediaModule {}
