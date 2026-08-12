import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RequestAdmin } from '../homepage/types';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { QueryAdminsDto } from './dto/query-admins.dto';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

const AUDIT_MODULE = 'admins';
const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

interface RequestAdminWithSuper extends RequestAdmin {
  isSuperAdmin?: boolean;
}

const ADMIN_LIST_SELECT = {
  id: true,
  email: true,
  name: true,
  isSuperAdmin: true,
  department: true,
  departmentId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  version: true,
  roles: { include: { role: { select: { id: true, name: true } } } },
} satisfies Prisma.AdminSelect;

@Injectable()
export class AdminsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private adminNotifications: AdminNotificationsService,
  ) {}

  async findAll(query: QueryAdminsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const status = query.status ?? 'active';

    const where: Prisma.AdminWhereInput = {
      ...(status === 'active' && { deletedAt: null, isActive: true }),
      ...(status === 'disabled' && { deletedAt: null, isActive: false }),
      ...(status === 'deleted' && { NOT: { deletedAt: null } }),
      // 'all' adds no deletedAt/isActive filter at all.
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.roleId && { roles: { some: { roleId: query.roleId } } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        select: ADMIN_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.admin.count({ where }),
    ]);

    return { items: items.map(this.toResponse), total, page, pageSize };
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: ADMIN_LIST_SELECT,
    });
    if (!admin) {
      throw new NotFoundException(`Admin ${id} not found`);
    }
    return this.toResponse(admin);
  }

  // Strips the password hash and flattens the roles join into a plain
  // {id, name}[] - the admin UI never needs the raw AdminRole join rows.
  private toResponse(admin: {
    roles: { role: { id: number; name: string } }[];
    [key: string]: unknown;
  }) {
    const { roles, ...rest } = admin;
    return { ...rest, roles: roles.map((r) => r.role) };
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.admin.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Admin ${id} not found`);
    }
    return record;
  }

  private async assertRoleIdsAssignable(
    roleIds: number[],
    actor: RequestAdminWithSuper,
  ) {
    if (roleIds.length === 0) return;
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles do not exist');
    }
    // Granting the Super Admin role hands out every permission in the
    // system - functionally equivalent to promoting someone to
    // Admin.isSuperAdmin, so it gets the same hard gate (see CreateAdminDto's
    // isSuperAdmin note) rather than being reachable via any admins.update
    // permission holder.
    const grantsSuperAdmin = roles.some((r) => r.name === SUPER_ADMIN_ROLE_NAME);
    if (grantsSuperAdmin && !actor.isSuperAdmin) {
      throw new ForbiddenException(
        'Only a super admin can assign the Super Admin role.',
      );
    }
  }

  async create(dto: CreateAdminDto, actor: RequestAdminWithSuper, requestId?: string) {
    if (dto.isSuperAdmin && !actor.isSuperAdmin) {
      throw new ForbiddenException('Only a super admin can create another super admin.');
    }
    if (dto.roleIds?.length) {
      await this.assertRoleIdsAssignable(dto.roleIds, actor);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { roleIds, password, ...rest } = dto;

    // Soft delete keeps the row, and Admin.email is unique - so a deleted
    // admin holds their address forever and re-creating them failed with a
    // bare "already in use" that never said a DELETED account was the blocker.
    // Recreating the same person is a normal thing to want, so the deleted row
    // is revived in place rather than orphaned beside a duplicate.
    const deletedSameEmail = await this.prisma.admin.findFirst({
      where: { email: dto.email, NOT: { deletedAt: null } },
      select: { id: true },
    });

    if (deletedSameEmail) {
      const revived = await this.prisma.$transaction(async (tx) => {
        // Roles are REPLACED, never merged: reusing an address must not
        // silently reinstate whatever the old account could do.
        await tx.adminRole.deleteMany({ where: { adminId: deletedSameEmail.id } });
        return tx.admin.update({
          where: { id: deletedSameEmail.id },
          data: {
            ...rest,
            password: hashedPassword,
            permissions: [],
            isActive: true,
            deletedAt: null,
            deletedBy: null,
            ...(roleIds?.length && {
              roles: { create: roleIds.map((roleId) => ({ roleId })) },
            }),
          },
          select: ADMIN_LIST_SELECT,
        });
      });

      await this.auditLog.log({
        adminId: actor.id,
        adminName: actor.name,
        adminEmail: actor.email,
        action: 'CREATE',
        module: 'admins',
        targetId: revived.id,
        details: { email: dto.email, revivedDeletedAccount: true },
        requestId,
      });
      return revived;
    }

    let created;
    try {
      created = await this.prisma.admin.create({
        data: {
          ...rest,
          password: hashedPassword,
          permissions: [],
          ...(roleIds?.length && {
            roles: { create: roleIds.map((roleId) => ({ roleId })) },
          }),
        },
        select: ADMIN_LIST_SELECT,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Email '${dto.email}' is already in use`);
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { after: this.toResponse(created) },
      requestId,
    });

    await this.adminNotifications.notifyByPermission('admins.view', {
      type: 'ADMIN_CREATED',
      title: 'New admin account created',
      message: `${created.name} (${created.email})`,
      link: '/admin/admins',
    });

    return this.toResponse(created);
  }

  async update(
    id: number,
    dto: UpdateAdminDto,
    actor: RequestAdminWithSuper,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Admin ${id}`);

    let updated;
    try {
      updated = await this.prisma.admin.update({
        where: { id },
        data: { ...rest, version: { increment: 1 } },
        select: ADMIN_LIST_SELECT,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Email '${rest.email}' is already in use`);
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: this.toResponse(updated), changedFields: Object.keys(rest) },
      requestId,
    });

    return this.toResponse(updated);
  }

  async resetPassword(
    id: number,
    dto: ResetPasswordDto,
    actor: RequestAdminWithSuper,
    requestId?: string,
  ) {
    await this.findActiveOrThrow(id);
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.admin.update({
      where: { id },
      data: { password: hashedPassword, version: { increment: 1 } },
    });

    // Never record the password itself, even hashed - the audit log is
    // readable by every super admin and this action's occurrence is what
    // matters, not the credential.
    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'RESET_PASSWORD',
      module: AUDIT_MODULE,
      targetId: id,
      details: {},
      requestId,
    });

    return { success: true };
  }

  async setStatus(
    id: number,
    isActive: boolean,
    actor: RequestAdminWithSuper,
    requestId?: string,
  ) {
    if (id === actor.id && !isActive) {
      throw new BadRequestException('You cannot disable your own account.');
    }
    const existing = await this.findActiveOrThrow(id);

    if (!isActive && existing.isSuperAdmin) {
      const activeSuperAdmins = await this.prisma.admin.count({
        where: { isSuperAdmin: true, isActive: true, deletedAt: null },
      });
      if (activeSuperAdmins <= 1) {
        throw new BadRequestException(
          'Cannot disable the last remaining active super admin.',
        );
      }
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: { isActive, version: { increment: 1 } },
      select: ADMIN_LIST_SELECT,
    });

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: isActive ? 'ENABLE' : 'DISABLE',
      module: AUDIT_MODULE,
      targetId: id,
      // Name the account being enabled/disabled - this is exactly the entry a
      // reviewer needs to read months later, and an id alone will not do.
      details: {
        name: existing.name,
        email: existing.email,
        before: { isActive: existing.isActive },
        after: { isActive },
      },
      requestId,
    });

    return this.toResponse(updated);
  }

  async assignRoles(
    id: number,
    dto: AssignRolesDto,
    actor: RequestAdminWithSuper,
    requestId?: string,
  ) {
    await this.findActiveOrThrow(id);
    await this.assertRoleIdsAssignable(dto.roleIds, actor);

    const before = await this.prisma.adminRole.findMany({
      where: { adminId: id },
      include: { role: { select: { id: true, name: true } } },
    });

    await this.prisma.$transaction([
      this.prisma.adminRole.deleteMany({ where: { adminId: id } }),
      ...dto.roleIds.map((roleId) =>
        this.prisma.adminRole.create({ data: { adminId: id, roleId } }),
      ),
      this.prisma.admin.update({
        where: { id },
        data: { version: { increment: 1 } },
      }),
    ]);

    const updated = await this.findOne(id);

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'ASSIGN_ROLES',
      module: AUDIT_MODULE,
      targetId: id,
      details: {
        before: before.map((r) => r.role),
        after: updated.roles,
      },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, actor: RequestAdminWithSuper, requestId?: string) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot delete your own account.');
    }
    const existing = await this.findActiveOrThrow(id);

    if (existing.isSuperAdmin) {
      const activeSuperAdmins = await this.prisma.admin.count({
        where: { isSuperAdmin: true, deletedAt: null },
      });
      if (activeSuperAdmins <= 1) {
        throw new BadRequestException('Cannot delete the last remaining super admin.');
      }
    }

    const deleted = await this.prisma.admin.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actor.id, version: { increment: 1 } },
      select: ADMIN_LIST_SELECT,
    });

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'DELETE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return this.toResponse(deleted);
  }

  async restore(id: number, actor: RequestAdminWithSuper, requestId?: string) {
    const existing = await this.prisma.admin.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted admin ${id} not found`);
    }

    const restored = await this.prisma.admin.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      select: ADMIN_LIST_SELECT,
    });

    await this.auditLog.log({
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      action: 'RESTORE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { after: this.toResponse(restored) },
      requestId,
    });

    return this.toResponse(restored);
  }
}
