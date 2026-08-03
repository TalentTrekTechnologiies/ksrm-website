ALTER TABLE "Research" ADD COLUMN "facultyId" INTEGER;

ALTER TABLE "Research"
  ADD CONSTRAINT "Research_facultyId_fkey"
  FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Research_facultyId_idx" ON "Research"("facultyId");
