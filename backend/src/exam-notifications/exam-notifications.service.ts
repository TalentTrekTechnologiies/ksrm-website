import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateExamNotificationDto } from './dto/create-exam-notification.dto';
import { UpdateExamNotificationDto } from './dto/update-exam-notification.dto';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'exam_notifications';

@Injectable()
export class ExamNotificationsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // "Active" on the public site means published, enabled, and currently
  // inside its [startDate, endDate] window - endDate is optional (an
  // open-ended notice, e.g. "Results" with no known end).
  async findAllPublic() {
    const now = new Date();
    return this.prisma.examNotification.findMany({
      where: {
        isPublished: true,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.examNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOrThrow(id: number) {
    const record = await this.prisma.examNotification.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Exam notification ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateExamNotificationDto, admin: RequestAdmin, requestId?: string) {
    const { startDate, endDate, ...rest } = dto;
    const created = await this.prisma.examNotification.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      },
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
    dto: UpdateExamNotificationDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);
    const { startDate, endDate, ...rest } = dto;

    const updated = await this.prisma.examNotification.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(dto) },
      requestId,
    });

    return updated;
  }

  async setPublished(
    id: number,
    isPublished: boolean,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);

    const updated = await this.prisma.examNotification.update({
      where: { id },
      data: { isPublished },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: isPublished ? 'PUBLISH' : 'UNPUBLISH',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: { isPublished: existing.isPublished }, after: { isPublished } },
      requestId,
    });

    return updated;
  }

  async delete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    const deleted = await this.prisma.examNotification.delete({ where: { id } });

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
}
