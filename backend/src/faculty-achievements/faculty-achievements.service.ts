import { Injectable, NotFoundException } from '@nestjs/common';
import { FacultyAchievementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  CreateFacultyAchievementDto,
  UpdateFacultyAchievementDto,
  ReorderFacultyAchievementsDto,
} from './dto/faculty-achievement.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'faculty_achievements';

/**
 * Publications, patents, books, awards and certifications belonging to a
 * faculty member.
 *
 * These arrive continuously - a few papers and a patent every year - so they
 * are rows against an existing Faculty record, never new Faculty records.
 * Adding this year's work is one more row, and the person's profile stays a
 * single entry.
 */
@Injectable()
export class FacultyAchievementsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Newest first. Dated records lead, in reverse chronological order, because
   * a profile is read as "what have they done lately"; undated ones (an older
   * paper remembered only by name, a patent still pending) fall to the end in
   * their manual order rather than being hidden.
   */
  private readonly order = [
    { date: 'desc' as const },
    { sortOrder: 'asc' as const },
    { id: 'desc' as const },
  ];

  findAllPublic(facultyId?: number, type?: FacultyAchievementType) {
    return this.prisma.facultyAchievement.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(facultyId !== undefined && { facultyId }),
        ...(type && { type }),
      },
      orderBy: this.order,
    });
  }

  findAllAdmin(facultyId?: number, includeDeleted = false) {
    return this.prisma.facultyAchievement.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(facultyId !== undefined && { facultyId }),
      },
      orderBy: this.order,
    });
  }

  private async findActiveOrThrow(id: number) {
    const row = await this.prisma.facultyAchievement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException(`Achievement ${id} not found`);
    return row;
  }

  async create(
    dto: CreateFacultyAchievementDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    // Fail loudly rather than orphaning a row against a faculty id that has
    // been removed.
    const faculty = await this.prisma.faculty.findFirst({
      where: { id: dto.facultyId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty ${dto.facultyId} not found`);
    }

    const created = await this.prisma.facultyAchievement.create({
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : null,
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      // Name the faculty member too - an audit entry reading "added
      // PUBLICATION #12" would say nothing about whose record changed.
      details: { after: { ...created, facultyName: faculty.name } },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateFacultyAchievementDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, date, ...rest } = dto;
    assertVersionMatch(existing, version, `Achievement ${id}`);

    const updated = await this.prisma.facultyAchievement.update({
      where: { id },
      data: {
        ...rest,
        // `undefined` leaves it alone; an explicit null clears it.
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated },
      requestId,
    });

    return updated;
  }

  async remove(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.facultyAchievement.update({
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
    const restored = await this.prisma.facultyAchievement.update({
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

  async reorder(
    dto: ReorderFacultyAchievementsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.facultyAchievement.update({
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
