import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Generic, decoupled usage-tracking pointer - deliberately NOT an FK into
 * any consumer table (Media can't polymorphically reference 15 different
 * content models). Same loose module/targetId string-keyed shape
 * `AuditLogService.log()` already uses in this codebase.
 *
 * Ships with zero call sites this pass - every future module (Gallery,
 * News, Faculty, ...) calls `track()`/`untrack()` itself from its own
 * create/update/delete once it migrates off its string URL field onto a
 * `mediaId` reference. This service and the delete-protection it enables
 * are ready and waiting.
 */
@Injectable()
export class MediaUsageService {
  constructor(private prisma: PrismaService) {}

  async track(
    mediaId: number,
    module: string,
    recordId: number,
    field: string,
  ): Promise<void> {
    await this.prisma.mediaUsage.upsert({
      where: {
        mediaId_module_recordId_field: { mediaId, module, recordId, field },
      },
      update: {},
      create: { mediaId, module, recordId, field },
    });
  }

  async untrack(
    module: string,
    recordId: number,
    field: string,
  ): Promise<void> {
    await this.prisma.mediaUsage.deleteMany({
      where: { module, recordId, field },
    });
  }

  async untrackAll(module: string, recordId: number): Promise<void> {
    await this.prisma.mediaUsage.deleteMany({ where: { module, recordId } });
  }

  async getUsagesForMedia(mediaId: number) {
    return this.prisma.mediaUsage.findMany({
      where: { mediaId },
      orderBy: [{ module: 'asc' }, { recordId: 'asc' }],
    });
  }

  async isReferenced(mediaId: number): Promise<boolean> {
    const count = await this.prisma.mediaUsage.count({ where: { mediaId } });
    return count > 0;
  }
}
