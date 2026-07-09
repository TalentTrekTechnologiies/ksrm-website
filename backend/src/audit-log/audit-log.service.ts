import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditLogData {
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "REORDER" | "PUBLISH" | "UNPUBLISH";
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
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  }

  async getAll(filters?: {
    module?: string;
    adminId?: number;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(filters?.module && { module: filters.module }),
        ...(filters?.adminId && { adminId: filters.adminId }),
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    });
  }

  async getByAdminId(adminId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getByModule(module: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { module },
      orderBy: { createdAt: "desc" },
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
      orderBy: { createdAt: "desc" },
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
        where: { module, targetId, action: "CREATE" },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.auditLog.findFirst({
        where: { module, targetId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      createdBy: createEntry
        ? { adminId: createEntry.adminId, adminName: createEntry.adminName, createdAt: createEntry.createdAt }
        : null,
      updatedBy: latestEntry
        ? { adminId: latestEntry.adminId, adminName: latestEntry.adminName, createdAt: latestEntry.createdAt }
        : null,
    };
  }
}
