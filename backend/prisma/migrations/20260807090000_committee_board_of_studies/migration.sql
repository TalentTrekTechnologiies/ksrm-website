-- A Board of Studies belongs to one department, so a committee can now name
-- the department it serves. Null for every committee that already exists -
-- those are the institution's, not a department's - so this is purely additive
-- and no existing row changes meaning.

ALTER TYPE "CommitteeType" ADD VALUE 'BOARD_OF_STUDIES';

ALTER TABLE "Committee" ADD COLUMN "departmentId" INTEGER;

CREATE INDEX "Committee_departmentId_idx" ON "Committee"("departmentId");

-- SET NULL, not CASCADE: deleting a department must not silently take a
-- committee's whole roster with it.
ALTER TABLE "Committee"
  ADD CONSTRAINT "Committee_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
