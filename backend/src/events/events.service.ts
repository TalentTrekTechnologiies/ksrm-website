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

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // Upcoming events first - the public listing's whole purpose is "what's
  // coming up", so ascending eventDate (not sortOrder) drives the order.
  async findAllPublic() {
    return this.prisma.event.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { eventDate: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can actually offer a restore action - excluded by default
  // since most callers (including reorder's own re-fetch) want the live
  // working set only.
  async findAllAdmin(includeDeleted = false) {
    return this.prisma.event.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
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
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.event.count({ where: { deletedAt: null } }));

    const created = await this.prisma.event.create({
      data: { ...dto, sortOrder },
    });

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
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Event ${id}`);

    const updated = await this.prisma.event.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

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
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more events do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.event.update({
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
      module: 'events',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
