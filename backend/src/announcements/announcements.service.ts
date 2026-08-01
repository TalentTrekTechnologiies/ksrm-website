import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementLocation, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { QueryAnnouncementsAdminDto } from './dto/query-announcements.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'announcements';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private adminNotifications: AdminNotificationsService,
  ) {}

  // Priority sorts CRITICAL-first for free - Postgres native enums compare
  // by declaration order, and AnnouncementPriority was declared
  // CRITICAL/HIGH/NORMAL/LOW in that exact order (see the migration).
  async findAllPublic(location: AnnouncementLocation, departmentId?: number) {
    const now = new Date();
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        isPublished: true,
        deletedAt: null,
        // Auto-expiry: an unset startDate/endDate means "no lower/upper
        // bound", not "never show" - each is its own independent OR.
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
        placements: {
          some: {
            location,
            ...(location === 'DEPARTMENT_PAGE' && departmentId !== undefined
              ? { OR: [{ departmentId: null }, { departmentId }] }
              : {}),
          },
        },
      },
      orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findAllAdmin(query: QueryAnnouncementsAdminDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.AnnouncementWhereInput = {
      ...(!query.includeDeleted && { deletedAt: null }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.location && { placements: { some: { location: query.location } } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: { placements: { include: { department: { select: { id: true, name: true } } } } },
        orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { placements: { include: { department: { select: { id: true, name: true } } } } },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement ${id} not found`);
    }
    return announcement;
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.announcement.findFirst({ where: { id, deletedAt: null } });
    if (!record) {
      throw new NotFoundException(`Announcement ${id} not found`);
    }
    return record;
  }

  private dedupePlacements(placements: CreateAnnouncementDto['placements']) {
    const seen = new Set<string>();
    const result: { location: AnnouncementLocation; departmentId: number | null }[] = [];
    for (const p of placements ?? []) {
      const key = `${p.location}:${p.departmentId ?? 'null'}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ location: p.location, departmentId: p.departmentId ?? null });
    }
    return result;
  }

  async create(dto: CreateAnnouncementDto, admin: RequestAdmin, requestId?: string) {
    const { placements, startDate, endDate, ...rest } = dto;
    const dedupedPlacements = this.dedupePlacements(placements);

    if (dedupedPlacements.length === 0) {
      throw new BadRequestException('At least one display location is required.');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          ...rest,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          placements: { create: dedupedPlacements },
        },
        include: { placements: true },
      });
      return announcement;
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(id: number, dto: UpdateAnnouncementDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, placements, startDate, endDate, ...rest } = dto;
    assertVersionMatch(existing, version, `Announcement ${id}`);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (placements !== undefined) {
        const dedupedPlacements = this.dedupePlacements(placements);
        if (dedupedPlacements.length === 0) {
          throw new BadRequestException('At least one display location is required.');
        }
        await tx.announcementPlacement.deleteMany({ where: { announcementId: id } });
        await tx.announcementPlacement.createMany({
          data: dedupedPlacements.map((p) => ({ ...p, announcementId: id })),
        });
      }

      return tx.announcement.update({
        where: { id },
        data: {
          ...rest,
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          version: { increment: 1 },
        },
        include: { placements: true },
      });
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async setPublished(id: number, isPublished: boolean, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: { isPublished, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: isPublished ? 'PUBLISH' : 'UNPUBLISH',
      module: AUDIT_MODULE,
      targetId: id,
      // Carry the title: a log line reading "Published #14" tells a reviewer
      // nothing, and the record may have been renamed or removed by the time
      // anyone reads it back.
      details: {
        title: existing.title,
        before: { isPublished: existing.isPublished },
        after: { isPublished },
      },
      requestId,
    });

    if (isPublished && !existing.isPublished) {
      await this.adminNotifications.notifyByPermission('announcements.view', {
        type: 'ANNOUNCEMENT_PUBLISHED',
        title: 'Announcement published',
        message: existing.title,
        link: '/admin/announcements',
      });
    }

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.announcement.findFirst({ where: { id, NOT: { deletedAt: null } } });
    if (!existing) {
      throw new NotFoundException(`Deleted announcement ${id} not found`);
    }

    const restored = await this.prisma.announcement.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
