import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SectionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { assertVersionMatch } from '../optimistic-lock.util';
import { RequestAdmin } from '../types';

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Public site: null if the section has never been configured or is still a Draft. */
  async findPublicByKey(key: string) {
    return this.prisma.homepageSection.findFirst({
      where: { key, status: SectionStatus.PUBLISHED, deletedAt: null },
    });
  }

  async findAllAdmin() {
    return this.prisma.homepageSection.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAdminByKey(key: string) {
    const record = await this.prisma.homepageSection.findFirst({
      where: { key, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Homepage section "${key}" not found`);
    }
    return record;
  }

  async update(
    key: string,
    content: unknown,
    status: SectionStatus,
    version: number,
    admin: RequestAdmin,
    requestId: string | undefined,
  ) {
    const existing = await this.findAdminByKey(key);
    assertVersionMatch(existing, version, `Homepage section "${key}"`);

    const updated = await this.prisma.homepageSection.update({
      where: { id: existing.id },
      data: { content: toJsonInput(content), status, version: { increment: 1 } },
    });

    // A status transition is logged as PUBLISH/UNPUBLISH (clearer audit
    // trail than a generic UPDATE hiding the fact that the public site's
    // visible content just changed); a content-only save with the same
    // status logs as a plain UPDATE.
    const action =
      existing.status !== status
        ? status === SectionStatus.PUBLISHED
          ? 'PUBLISH'
          : 'UNPUBLISH'
        : 'UPDATE';

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action,
      module: `homepage_section_${key}`,
      targetId: existing.id,
      details: { before: existing, after: updated },
      requestId,
    });

    return updated;
  }
}
