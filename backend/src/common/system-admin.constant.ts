// Service-account identity for actions triggered by the public (no real
// admin session) that still need an Admin FK - e.g. a resume uploaded to
// the Media Library by an anonymous job applicant, or the audit log entry
// for that upload. Seeded once in prisma/seed.ts with isActive: false, so
// it can never authenticate through the normal login flow.
export const SYSTEM_ADMIN_EMAIL = 'system@ksrm.internal';
