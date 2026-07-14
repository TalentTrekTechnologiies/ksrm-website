import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DownloadCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';
import { ReorderDownloadsDto } from './dto/reorder-downloads.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'downloads';
const MEDIA_FIELD = 'fileUrl';

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(
    category?: DownloadCategory,
    departmentId?: number,
    pageSection?: string,
  ) {
    return this.prisma.download.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(category && { category }),
        ...(departmentId !== undefined && { departmentId }),
        ...(pageSection && { pageSection }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can offer a restore action - excluded by default since most
  // callers want the live working set only.
  async findAllAdmin(includeDeleted = false, departmentId?: number, mediaId?: number) {
    return this.prisma.download.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(departmentId !== undefined && { departmentId }),
        ...(mediaId !== undefined && { mediaId }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.download.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Download ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateDownloadDto, admin: RequestAdmin, requestId?: string) {
    const sortOrder =
      dto.sortOrder ??
      ((await this.prisma.download.count({ where: { deletedAt: null } })) as number);

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'DOCUMENT');

    const created = await this.prisma.download.create({
      data: { ...dto, fileUrl: resolvedUrl ?? dto.fileUrl, sortOrder },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, created.id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'downloads',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(id: number, dto: UpdateDownloadDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Download ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'DOCUMENT');

    const updated = await this.prisma.download.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { fileUrl: resolvedUrl }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'downloads',
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.download.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'downloads',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.download.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted download ${id} not found`);
    }

    const restored = await this.prisma.download.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, restored.mediaId);
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'downloads',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(dto: ReorderDownloadsDto, admin: RequestAdmin, requestId?: string) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException('Duplicate sortOrder values in reorder payload');
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.download.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more downloads do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.download.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, version: { increment: 1 } },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: 'downloads',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
