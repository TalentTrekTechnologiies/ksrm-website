import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

@Injectable()
export class FacultyService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(department?: string) {
    const where = department
      ? { department, isActive: true, deletedAt: null }
      : { isActive: true, deletedAt: null };
    return this.prisma.faculty.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findAllAdmin(includeDeleted = false) {
    return this.prisma.faculty.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.faculty.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Faculty ${id} not found`);
    }
    return record;
  }

  async findHodByDepartment(department: string) {
    const hod = await this.prisma.faculty.findFirst({
      where: {
        department,
        isHod: true,
        isActive: true,
      },
    });
    if (!hod) {
      throw new NotFoundException(`HOD for ${department} not found`);
    }
    return hod;
  }

  async create(createFacultyDto: CreateFacultyDto, admin: RequestAdmin, requestId?: string) {
    const newFaculty = await this.prisma.faculty.create({
      data: createFacultyDto,
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'faculty',
      targetId: newFaculty.id,
      details: { after: newFaculty },
      requestId,
    });

    return newFaculty;
  }

  async update(id: number, dto: UpdateFacultyDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Faculty ${id}`);

    const updated = await this.prisma.faculty.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'faculty',
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.faculty.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'faculty',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.faculty.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted faculty ${id} not found`);
    }

    const restored = await this.prisma.faculty.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'faculty',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
