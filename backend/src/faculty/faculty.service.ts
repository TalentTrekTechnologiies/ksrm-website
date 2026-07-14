import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'faculty';
const MEDIA_FIELD = 'photoUrl';

@Injectable()
export class FacultyService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAll(department?: string, departmentId?: number) {
    return this.prisma.faculty.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(department && { department }),
        ...(departmentId !== undefined && { departmentId }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllAdmin(includeDeleted = false, departmentId?: number) {
    return this.prisma.faculty.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(departmentId !== undefined && { departmentId }),
      },
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
    const resolvedUrl = await this.mediaLink.prepareLink(createFacultyDto.mediaId, 'IMAGE');

    const newFaculty = await this.prisma.faculty.create({
      data: {
        ...createFacultyDto,
        photoUrl: resolvedUrl ?? createFacultyDto.photoUrl,
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, newFaculty.id, MEDIA_FIELD, createFacultyDto.mediaId);

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

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.faculty.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { photoUrl: resolvedUrl }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

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

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

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

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, restored.mediaId);
    }

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
