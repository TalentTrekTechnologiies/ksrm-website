import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RequestAdmin } from '../homepage/types';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const AUDIT_MODULE = 'roles';

interface RequestAdminWithSuper extends RequestAdmin {
  isSuperAdmin?: boolean;
}

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // Role/RBAC self-management (creating roles, changing what a role grants)
  // is deliberately restricted to real super admins - see prisma/seed.ts's
  // ROLES comment. A permission-holder for `roles.update` who isn't
  // actually a super admin could otherwise grant themselves any permission
  // by editing a role they hold.
  private assertSuperAdmin(actor: RequestAdminWithSuper) {
    if (!actor.isSuperAdmin) {
      throw new ForbiddenException('Only a super admin can manage roles.');
    }
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: { select: { key: true } } } },
        _count: { select: { admins: true } },
      },
      orderBy: { name: 'asc' },
    });
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      adminCount: role._count.admins,
      permissionKeys: role.permissions.map((p) => p.permission.key),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
    });
  }

  private async findOrThrow(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role ${id} not found`);
    }
    return role;
  }

  private async resolvePermissionIds(keys: string[]) {
    if (keys.length === 0) return [];
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: keys } },
    });
    if (permissions.length !== keys.length) {
      throw new BadRequestException('One or more permission keys do not exist');
    }
    return permissions.map((p) => p.id);
  }

  async create(dto: CreateRoleDto, actor: RequestAdminWithSuper, requestId?: string) {
    this.assertSuperAdmin(actor);
    const permissionIds = await this.resolvePermissionIds(dto.permissionKeys);

    let created;
    try {
      created = await this.prisma.role.create({
        data: {
          name: dto.name,
          description: dto.description,
          isSystemRole: false,
          permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Role name '${dto.name}' is already in use`);
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
      details: { after: { ...created, permissionKeys: dto.permissionKeys } },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateRoleDto,
    actor: RequestAdminWithSuper,
    requestId?: string,
  ) {
    this.assertSuperAdmin(actor);
    const existing = await this.findOrThrow(id);
    if (existing.isSystemRole) {
      throw new BadRequestException('System roles cannot be edited.');
    }

    const permissionIds = dto.permissionKeys
      ? await this.resolvePermissionIds(dto.permissionKeys)
      : undefined;

    let updated;
    try {
      updated = await this.prisma.role.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(permissionIds !== undefined && {
            permissions: {
              deleteMany: {},
              create: permissionIds.map((permissionId) => ({ permissionId })),
            },
          }),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Role name '${dto.name}' is already in use`);
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
      details: { before: existing, after: updated, changedFields: Object.keys(dto) },
      requestId,
    });

    return updated;
  }

  async delete(id: number, actor: RequestAdminWithSuper, requestId?: string) {
    this.assertSuperAdmin(actor);
    const existing = await this.findOrThrow(id);
    if (existing.isSystemRole) {
      throw new BadRequestException('System roles cannot be deleted.');
    }

    const assignedCount = await this.prisma.adminRole.count({ where: { roleId: id } });
    if (assignedCount > 0) {
      throw new BadRequestException(
        `Cannot delete role '${existing.name}' - ${assignedCount} admin(s) still assigned. Reassign them first.`,
      );
    }

    await this.prisma.role.delete({ where: { id } });

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

    return { success: true };
  }
}
