import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'news';
const MEDIA_FIELD = 'imageUrl';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(category?: string) {
    return this.prisma.news.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(category && { category }),
      },
      orderBy: [{ isFeatured: 'desc' }, { date: 'desc' }],
    });
  }

  // Admin listing intentionally includes drafts (isPublished: false) -
  // findAllPublic never did, which meant there was previously no way for an
  // editor to see/edit an unpublished article at all.
  async findAllAdmin(includeDeleted = false) {
    return this.prisma.news.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { date: 'desc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.news.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`News article ${id} not found`);
    }
    return record;
  }

  async findOne(id: number) {
    return this.findActiveOrThrow(id);
  }

  async create(dto: CreateNewsDto, admin: RequestAdmin, requestId?: string) {
    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    const created = await this.prisma.news.create({
      data: {
        ...dto,
        imageUrl: resolvedUrl ?? dto.imageUrl,
        date: new Date(dto.date),
      },
    });

    await this.mediaLink.syncUsage(
      MEDIA_MODULE,
      created.id,
      MEDIA_FIELD,
      dto.mediaId,
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'news',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateNewsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, date, ...rest } = dto;
    assertVersionMatch(existing, version, `News article ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { imageUrl: resolvedUrl }),
        ...(date && { date: new Date(date) }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'news',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.news.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'news',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  /**
   * Permanent removal of an ALREADY soft-deleted record.
   *
   * Until now the recycle view offered only "Restore": once something was
   * deleted there was no way to get rid of it, so deleted rows accumulated
   * forever and an admin who deleted something by mistake could not tidy up.
   *
   * Two deliberate safety properties:
   *  - it refuses anything that is not already soft-deleted, so this can never
   *    be a one-click destroy on live content - a record must be deleted first,
   *    which makes permanent removal a two-step, two-decision action;
   *  - the full row is written into the audit log before it goes, since after
   *    this there is nothing left to inspect.
   */
  async purge(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.news.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(
        `News article ${id} is not in the deleted items - only already-deleted records can be permanently removed`,
      );
    }

    await this.prisma.news.delete({ where: { id } });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'PURGE',
      module: MEDIA_MODULE,
      targetId: id,
      details: { before: existing, permanent: true },
      requestId,
    });

    return existing;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.news.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted news article ${id} not found`);
    }

    const restored = await this.prisma.news.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(
        MEDIA_MODULE,
        id,
        MEDIA_FIELD,
        restored.mediaId,
      );
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'news',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
