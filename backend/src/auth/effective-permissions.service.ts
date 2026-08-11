import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PermissionSubjectAdmin {
  id: number;
  isSuperAdmin: boolean;
  /** Set for a department-scoped account; the dashboard narrows its counts to it. */
  departmentId?: number | null;
}

/**
 * Resolves an admin's actual, current permission set from the RBAC tables
 * (AdminRole -> Role -> RolePermission -> Permission), NOT from the legacy
 * Admin.permissions string array (which predates the Role/Permission
 * schema and is never populated for role-based grants).
 *
 * isSuperAdmin remains a hard bypass, independent of any role - a super
 * admin has every permission regardless of which roles they've been
 * assigned, consistent with how PermissionsGuard already treats it.
 *
 * This is deliberately its own small service, not buried inside
 * DashboardService, so any future module can reuse the same permission
 * resolution instead of re-deriving it.
 */
@Injectable()
export class EffectivePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEffectivePermissions(
    admin: PermissionSubjectAdmin,
  ): Promise<Set<string>> {
    if (admin.isSuperAdmin) {
      const allPermissions = await this.prisma.permission.findMany({
        select: { key: true },
      });
      return new Set(allPermissions.map((p) => p.key));
    }

    const adminRoles = await this.prisma.adminRole.findMany({
      where: { adminId: admin.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const keys = new Set<string>();
    for (const adminRole of adminRoles) {
      for (const rolePermission of adminRole.role.permissions) {
        keys.add(rolePermission.permission.key);
      }
    }
    return keys;
  }

  async hasPermission(
    admin: PermissionSubjectAdmin,
    key: string,
  ): Promise<boolean> {
    if (admin.isSuperAdmin) {
      return true;
    }
    const permissions = await this.getEffectivePermissions(admin);
    return permissions.has(key);
  }
}
