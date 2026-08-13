import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProgrammeLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepartmentProgrammeDto } from './dto/create-department-programme.dto';
import { UpdateDepartmentProgrammeDto } from './dto/update-department-programme.dto';
import { ReorderDepartmentProgrammesDto } from './dto/reorder-department-programmes.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'department_programmes';

@Injectable()
export class DepartmentProgrammesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // Both filters optional: no departmentId = every department's programmes
  // (used by the college-wide Diploma listing), level narrows to UG/PG/PHD/
  // DIPLOMA. Includes the department's name so a college-wide list can show
  // which department each programme belongs to without a second round-trip.
  async findAllPublic(departmentId?: number, level?: ProgrammeLevel) {
    return this.prisma.departmentProgramme.findMany({
      where: {
        ...(departmentId !== undefined && { departmentId }),
        ...(level && { level }),
        isActive: true,
        deletedAt: null,
      },
      include: {
        department: { select: { name: true, shortName: true, slug: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin(departmentId?: number, includeDeleted = false) {
    return this.prisma.departmentProgramme.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(!includeDeleted && { deletedAt: null }),
      },
      orderBy: [{ departmentId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.departmentProgramme.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Department programme ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateDepartmentProgrammeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.departmentProgramme.count({
        where: { departmentId: dto.departmentId, deletedAt: null },
      }));

    const created = await this.prisma.departmentProgramme.create({
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
    dto: UpdateDepartmentProgrammeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Department programme ${id}`);

    const updated = await this.prisma.departmentProgramme.update({
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

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.departmentProgramme.update({
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
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.departmentProgramme.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(
        `Deleted department programme ${id} not found`,
      );
    }

    const restored = await this.prisma.departmentProgramme.update({
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

  async reorder(
    dto: ReorderDepartmentProgrammesDto,
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
    const existingRows = await this.prisma.departmentProgramme.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more programmes do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.departmentProgramme.update({
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
      module: AUDIT_MODULE,
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
