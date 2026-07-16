-- Create "AuditLog". This table was missing from the migration history entirely:
-- no migration anywhere created it, yet 20260704083958_phase1_additive_cms_data_model
-- ALTERs it and 20260707120000_homepage_1a_hero_and_audit_request_id adds a column
-- to it. It had been created out-of-band (a `prisma db push` against a dev database
-- that was never captured as a migration), so every existing database has it and no
-- fresh database could ever be built -- `migrate deploy` died on a brand new Render
-- Postgres with: ERROR: relation "AuditLog" does not exist (42P01).
--
-- Shape below is the table as it must exist at THIS point in history, i.e. the
-- current model minus the two columns added later:
--   - "adminRefId" is added by 20260704083958 (with its FK to "Admin" and its index)
--   - "requestId"  is added by 20260707120000
-- Likewise the indexes here are only the three that 20260704083958 does NOT create;
-- it already creates AuditLog_module_createdAt_idx and AuditLog_adminRefId_idx, so
-- creating them here too would fail that migration on a fresh database.
--
-- IF NOT EXISTS is deliberate, not defensive habit: every database that exists today
-- already has this table, so this migration must be a no-op there while still doing
-- the real work on a fresh one. That lets it record as applied everywhere without a
-- manual `prisma migrate resolve --applied`.

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "targetId" INTEGER,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX IF NOT EXISTS "AuditLog_module_idx" ON "AuditLog"("module");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
