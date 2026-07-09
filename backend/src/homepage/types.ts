// Shape of req.user attached by JwtStrategy - just the fields the homepage
// sub-services need for audit logging, not the full admin record.
export interface RequestAdmin {
  id: number;
  name: string;
  email: string;
}
