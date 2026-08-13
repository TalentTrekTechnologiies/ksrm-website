import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { CreateStatisticDto, StatisticGroup } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { ReorderStatisticsDto } from './dto/reorder-statistics.dto';
import { assertVersionMatch } from '../optimistic-lock.util';
import { RequestAdmin } from '../types';

@Injectable()
export class StatisticsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic(scope: StatisticGroup, departmentId?: number) {
    return this.prisma.siteStatistic.findMany({
      where: {
        scope,
        isActive: true,
        deletedAt: null,
        ...(scope === 'department' && { departmentId }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can actually offer a restore action - excluded by default
  // since most callers (including reorder's own re-fetch) want the live
  // working set only.
  async findAllAdmin(
    scope?: StatisticGroup,
    departmentId?: number,
    includeDeleted = false,
  ) {
    return this.prisma.siteStatistic.findMany({
      where: {
        ...(scope && { scope }),
        ...(departmentId !== undefined && { departmentId }),
        ...(!includeDeleted && { deletedAt: null }),
      },
      orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.siteStatistic.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Statistic ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateStatisticDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.siteStatistic.count({
        where: {
          scope: dto.scope,
          ...(dto.scope === 'department' && { departmentId: dto.departmentId }),
          deletedAt: null,
        },
      }));

    const created = await this.prisma.siteStatistic.create({
      data: { ...dto, sortOrder },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'homepage_statistics',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateStatisticDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Statistic ${id}`);

    const updated = await this.prisma.siteStatistic.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'homepage_statistics',
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

    const deleted = await this.prisma.siteStatistic.update({
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
      module: 'homepage_statistics',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.siteStatistic.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted statistic ${id} not found`);
    }

    const restored = await this.prisma.siteStatistic.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'homepage_statistics',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderStatisticsDto,
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
    const existingRows = await this.prisma.siteStatistic.findMany({
      where: {
        id: { in: ids },
        scope: dto.scope,
        ...(dto.scope === 'department' && { departmentId: dto.departmentId }),
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException(
        'One or more statistics do not exist or do not belong to the given scope',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.siteStatistic.update({
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
      module: 'homepage_statistics',
      details: { scope: dto.scope, items: dto.items },
      requestId,
    });

    return this.findAllAdmin(dto.scope);
  }
}
