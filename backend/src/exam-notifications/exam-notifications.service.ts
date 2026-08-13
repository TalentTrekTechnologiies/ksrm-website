import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamNotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateExamNotificationDto } from './dto/create-exam-notification.dto';
import { UpdateExamNotificationDto } from './dto/update-exam-notification.dto';
import { ReorderExamNotificationsDto } from './dto/reorder-exam-notifications.dto';
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
  // `type` narrows to one list on the Examinations page (results, timetables,
  // question papers...). Omitted returns everything, which is what the
  // homepage ticker and the notifications block want.
  async findAllPublic(type?: ExamNotificationType) {
    const now = new Date();
    return this.prisma.examNotification.findMany({
      where: {
        isPublished: true,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        ...(type && { type }),
      },
      // Manual order first, date second. Every row defaults to sortOrder 0, so
      // until someone drags something the whole list is tied and this behaves
      // exactly as the previous date-only ordering did.
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    });
  }

  async findAllAdmin(type?: ExamNotificationType) {
    return this.prisma.examNotification.findMany({
      where: { ...(type && { type }) },
      // Must match findAllPublic, or the order an admin arranges by dragging
      // would not be the order visitors see.
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  private async findOrThrow(id: number) {
    const record = await this.prisma.examNotification.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Exam notification ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateExamNotificationDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
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
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
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
        changedFields: Object.keys(dto),
      },
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
      // Carry the title so the entry names the notification, not just its id.
      details: {
        title: existing.title,
        before: { isPublished: existing.isPublished },
        after: { isPublished },
      },
      requestId,
    });

    return updated;
  }

  async delete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    const deleted = await this.prisma.examNotification.delete({
      where: { id },
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

  /**
   * Drag-to-reorder. Mirrors FacultyService.reorder so both behave identically:
   * the whole list arrives in its new order, is validated as a set, and is
   * written in one transaction so a partial failure cannot leave the list half
   * reordered.
   */
  async reorder(
    dto: ReorderExamNotificationsDto,
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
    const existingRows = await this.prisma.examNotification.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException(
        'One or more exam notifications do not exist',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.examNotification.update({
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
