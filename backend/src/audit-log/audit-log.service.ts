import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditLogData {
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  module: string;
  targetId?: number;
  details?: object;
  ipAddress?: string;
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
}
