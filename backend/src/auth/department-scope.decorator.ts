import { SetMetadata } from '@nestjs/common';

export const DEPARTMENT_SCOPE_KEY = 'departmentScope';

export type DepartmentScopeConfig =
  // CREATE endpoints: the target department is `req.body.departmentId`.
  | { source: 'body' }
  // The Department entity's own PATCH/DELETE/restore: the target department
  // IS the record itself, so `req.params.id` is the department id directly.
  | { source: 'self' }
  // UPDATE/DELETE/restore endpoints on department-owned content: the target
  // department has to be looked up from the existing row (`req.params.id`)
  // since the request body may not repeat `departmentId`. `model` is the
  // PrismaService delegate name (e.g. 'faculty', 'lab', 'galleryImage').
  | { source: 'lookup'; model: string };

/**
 * Marks an endpoint as department-owned for `DepartmentOwnershipGuard`.
 * A super admin, or any admin with `Admin.departmentId` unset (null), is
 * never restricted by this - it only narrows write access for admins whose
 * account is scoped to one specific department (e.g. a "Department
 * Administrator" role assigned to ECE can create/edit/delete ECE's Faculty/
 * Labs/Gallery/etc. but gets a 403 touching another department's records).
 * Read access (`GET`) is intentionally never gated by this - only apply it
 * to mutating (POST/PATCH/DELETE) routes.
 */
export const DepartmentScoped = (config: DepartmentScopeConfig) =>
  SetMetadata(DEPARTMENT_SCOPE_KEY, config);
