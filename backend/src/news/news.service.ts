import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic(category?: string) {
    return this.prisma.news.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(category && { category }),
      },
      orderBy: [{ isFeatured: 'desc' }, { date: 'desc' }],
    });
  }

  // Admin listing intentionally includes drafts (isPublished: false) -
  // findAllPublic never did, which meant there was previously no way for an
  // editor to see/edit an unpublished article at all.
  async findAllAdmin(includeDeleted = false) {
    return this.prisma.news.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { date: 'desc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.news.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`News article ${id} not found`);
    }
    return record;
  }

  async findOne(id: number) {
    return this.findActiveOrThrow(id);
  }

  async create(dto: CreateNewsDto, admin: RequestAdmin, requestId?: string) {
    const created = await this.prisma.news.create({
      data: { ...dto, date: new Date(dto.date) },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'news',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateNewsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, date, ...rest } = dto;
    assertVersionMatch(existing, version, `News article ${id}`);

    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'news',
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

    const deleted = await this.prisma.news.update({
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
      module: 'news',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.news.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted news article ${id} not found`);
    }

    const restored = await this.prisma.news.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'news',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
