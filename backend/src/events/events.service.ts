import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReorderEventsDto } from './dto/reorder-events.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { assertMayReorderAll } from '../auth/reorder-ownership.util';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'events';
const MEDIA_FIELD = 'imageUrl';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  // Upcoming events first - the public listing's whole purpose is "what's
  // coming up", so ascending eventDate (not sortOrder) drives the order.
  //
  // departmentId undefined (the default) returns every event regardless of
  // department, matching the public site-wide Events page. A Student
  // Chapter's own section passes its department's id to see only its events.
  async findAllPublic(departmentId?: number) {
    return this.prisma.event.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(departmentId !== undefined && { departmentId }),
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can actually offer a restore action - excluded by default
  // since most callers (including reorder's own re-fetch) want the live
  // working set only.
  async findAllAdmin(includeDeleted = false, departmentId?: number) {
    return this.prisma.event.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(departmentId !== undefined && { departmentId }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateEventDto, admin: RequestAdmin, requestId?: string) {
    const { eventDate, endDate, ...rest } = dto;
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.event.count({ where: { deletedAt: null } }));

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    const created = await this.prisma.event.create({
      data: {
        ...rest,
        imageUrl: resolvedUrl ?? rest.imageUrl,
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : undefined,
        sortOrder,
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, created.id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'events',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateEventDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, eventDate, endDate, ...rest } = dto;
    assertVersionMatch(existing, version, `Event ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { imageUrl: resolvedUrl }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'events',
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'events',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.event.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted event ${id} not found`);
    }

    const restored = await this.prisma.event.update({
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
      module: 'events',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(dto: ReorderEventsDto, admin: RequestAdmin, requestId?: string) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException('Duplicate sortOrder values in reorder payload');
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.event.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, departmentId: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more events do not exist');
    }

    // Same reasoning as downloads: the guards authorize one target, this
    // payload carries many. Event has no pageSection, so only the department
    // rule can bite here.
    assertMayReorderAll(existingRows, admin);

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.event.update({
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
      module: 'events',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
