-- An optional heading that starts a group of committee members (used by the
-- IQAC composition: Management Members, Senior Teachers, ...). Nullable, so
-- every existing roster is unchanged.
ALTER TABLE "CommitteeMember" ADD COLUMN "groupLabel" TEXT;
