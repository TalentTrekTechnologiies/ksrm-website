import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getRequestIpAddress } from '../common/request-context';

export interface AuditLogData {
  adminId: number;
  adminName: string;
  adminEmail: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'RESTORE'
    // Permanent removal of an already soft-deleted row. Distinct from DELETE
    // (which is reversible) because this one cannot be undone - the audit entry
    // carries the whole record, as it is the only remaining trace of it.
    | 'PURGE'
    | 'REORDER'
    | 'PUBLISH'
    | 'UNPUBLISH'
    // Media Library actions.
    | 'REPLACE'
    | 'ROLLBACK'
    | 'CROP'
    // Admin Management actions.
    | 'RESET_PASSWORD'
    | 'ASSIGN_ROLES'
    | 'ENABLE'
    | 'DISABLE';
  module: string;
  targetId?: number;
  details?: object;
  ipAddress?: string;
  requestId?: string;
}

export interface AuditActor {
  adminId: number;
  adminName: string;
  createdAt: Date;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        ipAddress: data.ipAddress ?? getRequestIpAddress(),
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  }

  private buildWhere(filters?: {
    module?: string;
    adminId?: number;
    action?: string;
    search?: string;
    from?: Date;
    to?: Date;
  }) {
    return {
      ...(filters?.module && { module: filters.module }),
      ...(filters?.adminId && { adminId: filters.adminId }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.search && {
        OR: [
          {
            adminName: {
              contains: filters.search,
              mode: 'insensitive' as const,
            },
          },
          {
            adminEmail: {
              contains: filters.search,
              mode: 'insensitive' as const,
            },
          },
          {
            requestId: {
              contains: filters.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...((filters?.from || filters?.to) && {
        createdAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
    };
  }

  async getAll(filters?: {
    module?: string;
    adminId?: number;
    action?: string;
    search?: string;
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50;
    const where = this.buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // Same filters as getAll but uncapped (up to a hard safety ceiling) and
  // unpaginated - the CSV export's whole point is "give me everything that
  // matches", not one page at a time.
  async exportCsv(filters?: {
    module?: string;
    adminId?: number;
    action?: string;
    search?: string;
    from?: Date;
    to?: Date;
  }): Promise<string> {
    const where = this.buildWhere(filters);
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const header = [
      'id',
      'createdAt',
      'action',
      'module',
      'targetId',
      'adminId',
      'adminName',
      'adminEmail',
      'ipAddress',
      'requestId',
    ];
    const csvEscape = (value: unknown) => {
      const str = value === null || value === undefined ? '' : String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = [header.join(',')];
    for (const row of rows) {
      lines.push(
        [
          row.id,
          row.createdAt.toISOString(),
          row.action,
          row.module,
          row.targetId ?? '',
          row.adminId,
          row.adminName,
          row.adminEmail,
          row.ipAddress ?? '',
          row.requestId ?? '',
        ]
          .map(csvEscape)
          .join(','),
      );
    }
    return lines.join('\n');
  }

  async getByAdminId(adminId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getByModule(module: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { module },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Full audit trail for one specific record - the "Audit History" drawer's
   * data source. Deliberately not gated to super-admins the way getAll()
   * is (see AuditLogController): the caller already needed `<module>.view`
   * to reach the page this drawer opens from, and a single record's history
   * is far less sensitive than the global cross-module log.
   */
  async getByTarget(module: string, targetId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { module, targetId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Derives Created By / Updated By for one record from its audit trail
   * instead of dedicated createdBy/updatedBy columns - no schema change,
   * no duplicated data. `createdBy` is the earliest CREATE entry;
   * `updatedBy` is the most recent entry of any kind (falls back to the
   * CREATE entry itself if nothing has happened since).
   */
  async getCreatorAndUpdater(
    module: string,
    targetId: number,
  ): Promise<{ createdBy: AuditActor | null; updatedBy: AuditActor | null }> {
    const [createEntry, latestEntry] = await Promise.all([
      this.prisma.auditLog.findFirst({
        where: { module, targetId, action: 'CREATE' },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.auditLog.findFirst({
        where: { module, targetId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      createdBy: createEntry
        ? {
            adminId: createEntry.adminId,
            adminName: createEntry.adminName,
            createdAt: createEntry.createdAt,
          }
        : null,
      updatedBy: latestEntry
        ? {
            adminId: latestEntry.adminId,
            adminName: latestEntry.adminName,
            createdAt: latestEntry.createdAt,
          }
        : null,
    };
  }
}
