// Shape of req.user attached by JwtStrategy - just the fields the homepage
// sub-services need for audit logging, not the full admin record.
export interface RequestAdmin {
  id: number;
  name: string;
  email: string;
  isSuperAdmin?: boolean;
  departmentId?: number | null;
  /**
   * Role-resolved permission keys, as attached by JwtStrategy. Needed by the
   * bulk-reorder ownership check, which cannot use PageSectionOwnershipGuard:
   * that guard authorizes one target per request, and a reorder payload
   * carries many.
   */
  permissions?: string[];
}
