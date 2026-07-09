import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'departments';

@Injectable()
export class DepartmentsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic() {
    return this.prisma.department.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too so the admin UI can offer
  // a restore action - excluded by default.
  async findAllAdmin(includeDeleted = false) {
    return this.prisma.department.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { name: 'asc' },
    });
  }

  // Cheap to add now even though no public page consumes it tonight - the
  // full department detail pages will need slug-based lookup eventually.
  async findBySlug(slug: string) {
    const record = await this.prisma.department.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Department '${slug}' not found`);
    }
    return record;
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Department ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateDepartmentDto, admin: RequestAdmin, requestId?: string) {
    let created;
    try {
      created = await this.prisma.department.create({ data: { ...dto } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Department slug '${dto.slug}' is already in use`);
      }
      throw err;
    }

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

  async update(id: number, dto: UpdateDepartmentDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Department ${id}`);

    let updated;
    try {
      updated = await this.prisma.department.update({
        where: { id },
        data: { ...rest, version: { increment: 1 } },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Department slug '${rest.slug}' is already in use`);
      }
      throw err;
    }

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

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.department.update({
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
    const existing = await this.prisma.department.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted department ${id} not found`);
    }

    const restored = await this.prisma.department.update({
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
