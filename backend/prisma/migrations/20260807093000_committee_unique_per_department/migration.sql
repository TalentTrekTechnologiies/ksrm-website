-- Uniqueness becomes per-department, so all nine departments can have a
-- committee called simply "Board of Studies". Widening a unique index never
-- rejects a row the old one accepted, so no existing data can conflict.
--
-- It does loosen one thing: Postgres treats each NULL departmentId as distinct,
-- so this index no longer blocks two identically named institution-wide
-- committees. CommitteesService checks that case in code before writing, which
-- also produces a clearer message than a raw constraint violation.

DROP INDEX "Committee_type_name_key";

CREATE UNIQUE INDEX "Committee_type_name_departmentId_key"
  ON "Committee"("type", "name", "departmentId");
