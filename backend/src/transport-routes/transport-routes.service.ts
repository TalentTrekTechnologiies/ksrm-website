import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  CreateTransportRouteDto,
  UpdateTransportRouteDto,
  ReorderTransportRoutesDto,
} from './dto/transport-route.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'transport_routes';

@Injectable()
export class TransportRoutesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  findAllPublic() {
    return this.prisma.transportRoute.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findAllAdmin(includeDeleted = false) {
    return this.prisma.transportRoute.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const row = await this.prisma.transportRoute.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException(`Transport route ${id} not found`);
    return row;
  }

  async findOne(id: number) {
    return this.findActiveOrThrow(id);
  }

  async create(
    dto: CreateTransportRouteDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    // A new route goes last unless told otherwise, so adding one never
    // silently reshuffles the published order.
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.transportRoute.count({ where: { deletedAt: null } }));

    const created = await this.prisma.transportRoute.create({
      data: { ...dto, sortOrder },
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

  async update(
    id: number,
    dto: UpdateTransportRouteDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Transport route ${id}`);

    const updated = await this.prisma.transportRoute.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
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

  async remove(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.transportRoute.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id },
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
    const existing = await this.prisma.transportRoute.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Transport route ${id} not found`);

    const restored = await this.prisma.transportRoute.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
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

  /**
   * Reorder by listing ids in their new order.
   *
   * Deliberately does NOT bump `version`: dragging a row is not an edit to its
   * content, and bumping it would make everyone else's open form fail its
   * optimistic-lock check for a change they cannot see.
   */
  async reorder(
    dto: ReorderTransportRoutesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.transportRoute.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: AUDIT_MODULE,
      details: { ids: dto.ids },
      requestId,
    });

    return this.findAllAdmin();
  }
}
