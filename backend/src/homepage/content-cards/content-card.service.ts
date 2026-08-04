import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { assertVersionMatch } from '../optimistic-lock.util';
import { RequestAdmin } from '../types';
import { MediaLinkService } from '../../media/media-link.service';

const MEDIA_FIELD = 'imageUrl';

export interface ContentCardInput {
  section: string;
  icon?: string;
  imageUrl: string;
  mediaId?: number;
  title: string;
  description?: string;
  tags?: string[];
  linkUrl: string;
  linkText?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ContentCardUpdateInput extends Partial<Omit<ContentCardInput, 'mediaId'>> {
  version: number;
  // Widened beyond ContentCardInput's `number | undefined` so callers can
  // send `mediaId: null` to explicitly unlink without touching imageUrl -
  // same contract as every other module's mediaId field.
  mediaId?: number | null;
}

export interface ReorderContentCardsInput {
  section: string;
  items: { id: number; sortOrder: number }[];
}

/**
 * Generic CRUD + reorder + soft-delete/restore over ContentCard, scoped by
 * `section`. Extracted from the Sprint 1A Quick Links implementation so a
 * second consumer (Admissions' program cards, Sprint 1B) - and every future
 * one (News/Gallery/Careers "featured card" style content) - reuses this
 * instead of a copy-pasted service. Callers (QuickLinksService,
 * AdmissionProgramsService, ...) are thin wrappers that fix `section` and
 * `auditModule`, keeping their own public routes/DTOs unchanged - this
 * class has no opinion on routing.
 */
@Injectable()
export class ContentCardService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(section: string) {
    return this.prisma.contentCard.findMany({
      where: { section, isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin(section: string | undefined, includeDeleted: boolean) {
    return this.prisma.contentCard.findMany({
      where: { ...(section && { section }), ...(!includeDeleted && { deletedAt: null }) },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number, entityLabel: string) {
    const record = await this.prisma.contentCard.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`${entityLabel} ${id} not found`);
    }
    return record;
  }

  async create(
    dto: ContentCardInput,
    admin: RequestAdmin,
    auditModule: string,
    entityLabel: string,
    requestId?: string,
  ) {
    const sortOrder =
      dto.sortOrder ??
      ((await this.prisma.contentCard.count({ where: { section: dto.section, deletedAt: null } })) as number);

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    const created = await this.prisma.contentCard.create({
      data: { ...dto, imageUrl: resolvedUrl ?? dto.imageUrl, sortOrder },
    });

    await this.mediaLink.syncUsage(auditModule, created.id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: auditModule,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: ContentCardUpdateInput,
    admin: RequestAdmin,
    auditModule: string,
    entityLabel: string,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id, entityLabel);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `${entityLabel} ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.contentCard.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { imageUrl: resolvedUrl }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(auditModule, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: auditModule,
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, auditModule: string, entityLabel: string, requestId?: string) {
    const existing = await this.findActiveOrThrow(id, entityLabel);

    const deleted = await this.prisma.contentCard.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

    await this.mediaLink.untrackAll(auditModule, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: auditModule,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, auditModule: string, entityLabel: string, requestId?: string) {
    const existing = await this.prisma.contentCard.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted ${entityLabel.toLowerCase()} ${id} not found`);
    }

    const restored = await this.prisma.contentCard.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(auditModule, id, MEDIA_FIELD, restored.mediaId);
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: auditModule,
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderContentCardsInput,
    admin: RequestAdmin,
    auditModule: string,
    entityLabel: string,
    requestId?: string,
  ) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException('Duplicate sortOrder values in reorder payload');
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.contentCard.findMany({
      where: { id: { in: ids }, section: dto.section, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException(
        `One or more ${entityLabel.toLowerCase()}s do not exist or do not belong to the given section`,
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.contentCard.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: auditModule,
      details: { section: dto.section, items: dto.items },
      requestId,
    });

    return this.findAllAdmin(dto.section, false);
  }
}
