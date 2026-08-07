-- Student Chapters, per department. Purely additive - nothing existing is
-- altered, so every current row keeps its current meaning.

ALTER TYPE "CommitteeType" ADD VALUE 'STUDENT_CHAPTER';

ALTER TABLE "Event" ADD COLUMN "departmentId" INTEGER;
CREATE INDEX "Event_departmentId_idx" ON "Event"("departmentId");
ALTER TABLE "Event"
  ADD CONSTRAINT "Event_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Department" ADD COLUMN "studentChapterAbout" TEXT;
