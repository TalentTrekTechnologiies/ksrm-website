import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { DEPARTMENT_SCOPE_KEY, DepartmentScopeConfig } from './department-scope.decorator';

/**
 * Enforces department ownership on write endpoints marked with
 * `@DepartmentScoped(...)` - the RBAC extension for "a Department Admin can
 * only edit their own department's content" (Admin.departmentId, which
 * already existed in the schema but was never read out of the JWT or
 * enforced anywhere until this guard). Super admins and admins with no
 * departmentId set are always allowed through - this guard only ever
 * narrows access further, it never grants anything `PermissionsGuard`
 * wouldn't already have allowed.
 */
@Injectable()
export class DepartmentOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<DepartmentScopeConfig>(
      DEPARTMENT_SCOPE_KEY,
      context.getHandler(),
    );
    if (!config) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.isSuperAdmin) return true;
    if (user.departmentId == null) return true;

    const targetDepartmentId = await this.resolveTargetDepartmentId(config, req);

    // A department-scoped admin owns their department's rows and nothing
    // else. An unowned row (departmentId: null) is college-wide content -
    // exam documents, the general gallery - so it is NOT theirs to edit.
    // (This deliberately reverses the original rule, which let any scoped
    // admin edit unassigned records: with college-wide roles now holding
    // departmentId: null, unowned content has real owners and no longer
    // needs every department admin to be able to reach it.)
    if (targetDepartmentId == null) {
      throw new ForbiddenException(
        "You can only manage your own department's records.",
      );
    }

    if (targetDepartmentId !== user.departmentId) {
      throw new ForbiddenException(
        "You can only manage your own department's records.",
      );
    }

    // Ownership of the *existing* row is not enough on an update: a body
    // that carries a different departmentId would move the record into
    // another department, walking it straight out of this admin's scope.
    // Checked for every source, since 'lookup' resolves from the stored row
    // and would otherwise never see the incoming value at all.
    const incoming = req.body?.departmentId;
    if (incoming != null && Number(incoming) !== user.departmentId) {
      throw new ForbiddenException(
        'You cannot move a record into another department.',
      );
    }
    return true;
  }

  private async resolveTargetDepartmentId(
    config: DepartmentScopeConfig,
    req: { body?: { departmentId?: number }; params: Record<string, string> },
  ): Promise<number | null | undefined> {
    if (config.source === 'body') {
      return req.body?.departmentId;
    }
    if (config.source === 'self') {
      return Number(req.params.id);
    }
    const delegate = (this.prisma as unknown as Record<string, { findUnique: Function }>)[
      config.model
    ];
    const record = await delegate.findUnique({
      where: { id: Number(req.params.id) },
      select: { departmentId: true },
    });
    return record?.departmentId;
  }
}
