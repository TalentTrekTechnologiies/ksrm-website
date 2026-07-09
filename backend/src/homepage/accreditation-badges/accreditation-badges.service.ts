import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { CreateAccreditationBadgeDto } from './dto/create-accreditation-badge.dto';
import { UpdateAccreditationBadgeDto } from './dto/update-accreditation-badge.dto';
import { ReorderAccreditationBadgesDto } from './dto/reorder-accreditation-badges.dto';
import { assertVersionMatch } from '../optimistic-lock.util';
import { RequestAdmin } from '../types';

@Injectable()
export class AccreditationBadgesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic() {
    return this.prisma.accreditationBadge.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can actually offer a restore action - excluded by default
  // since most callers (including reorder's own re-fetch) want the live
  // working set only.
  async findAllAdmin(includeDeleted = false) {
    return this.prisma.accreditationBadge.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.accreditationBadge.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Accreditation badge ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateAccreditationBadgeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.accreditationBadge.count({
        where: { deletedAt: null },
      }));

    const created = await this.prisma.accreditationBadge.create({
      data: { ...dto, sortOrder },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'homepage_accreditation_badges',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateAccreditationBadgeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Accreditation badge ${id}`);

    const updated = await this.prisma.accreditationBadge.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'homepage_accreditation_badges',
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

    const deleted = await this.prisma.accreditationBadge.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'homepage_accreditation_badges',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.accreditationBadge.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(
        `Deleted accreditation badge ${id} not found`,
      );
    }

    const restored = await this.prisma.accreditationBadge.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'homepage_accreditation_badges',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderAccreditationBadgesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException(
        'Duplicate sortOrder values in reorder payload',
      );
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.accreditationBadge.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException(
        'One or more accreditation badges do not exist',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.accreditationBadge.update({
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
      module: 'homepage_accreditation_badges',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
