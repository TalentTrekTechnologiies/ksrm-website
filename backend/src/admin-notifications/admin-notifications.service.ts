import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminNotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';

export interface NotifyPayload {
  type: AdminNotificationType;
  title: string;
  message?: string;
  link?: string;
}

/**
 * Materialized fan-out: a broadcast event creates one AdminNotification row
 * per eligible admin at creation time (rather than a shared row with a
 * nullable adminId), so each admin's isRead/readAt is genuinely independent.
 * Correct-and-simple at this project's scale (a handful of admins).
 */
@Injectable()
export class AdminNotificationsService {
  constructor(
    private prisma: PrismaService,
    private effectivePermissions: EffectivePermissionsService,
  ) {}

  async notifyAdmins(adminIds: number[], payload: NotifyPayload) {
    if (adminIds.length === 0) return;
    await this.prisma.adminNotification.createMany({
      data: adminIds.map((adminId) => ({ adminId, ...payload })),
    });
  }

  // Fans a notification out to every active admin who currently holds
  // `permission` (super admins always qualify - see EffectivePermissionsService).
  async notifyByPermission(permission: string, payload: NotifyPayload) {
    const admins = await this.prisma.admin.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, isSuperAdmin: true },
    });

    const eligibleIds: number[] = [];
    for (const admin of admins) {
      if (await this.effectivePermissions.hasPermission(admin, permission)) {
        eligibleIds.push(admin.id);
      }
    }

    await this.notifyAdmins(eligibleIds, payload);
  }

  async findForAdmin(
    adminId: number,
    options?: { unreadOnly?: boolean; limit?: number },
  ) {
    return this.prisma.adminNotification.findMany({
      where: {
        adminId,
        ...(options?.unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
    });
  }

  async getUnreadCount(adminId: number) {
    const count = await this.prisma.adminNotification.count({
      where: { adminId, isRead: false },
    });
    return { count };
  }

  async markRead(id: number, adminId: number) {
    const existing = await this.prisma.adminNotification.findFirst({
      where: { id, adminId },
    });
    if (!existing) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    if (existing.isRead) return existing;

    return this.prisma.adminNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(adminId: number) {
    await this.prisma.adminNotification.updateMany({
      where: { adminId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }
}
