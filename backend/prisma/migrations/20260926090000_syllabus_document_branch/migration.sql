-- A syllabus document says which branch and which regulation it is for.
--
-- It used to be worked out from the words in the title: "I & II SEM R18 ECE"
-- was filed under Electronics & Communication Engineering, regulation R18. The
-- rule lived in the public page, the upload form had a Title box and no branch
-- field anywhere on it, and a title matching nothing landed under "Other"
-- without complaint. Nobody uploading a file could see any of that.
--
-- Purely additive, and both columns nullable with no backfill: the seventy-odd
-- syllabus documents already published keep working exactly as they do now,
-- through the title matching that stays in place as the fallback.

ALTER TABLE "Download" ADD COLUMN "syllabusRegulationId" INTEGER;
ALTER TABLE "Download" ADD COLUMN "syllabusBranch" TEXT;

CREATE INDEX "Download_syllabusRegulationId_idx" ON "Download"("syllabusRegulationId");

-- SET NULL, not CASCADE: deleting a regulation heading must not delete the
-- college's PDFs. The document falls back to title matching instead.
ALTER TABLE "Download" ADD CONSTRAINT "Download_syllabusRegulationId_fkey"
    FOREIGN KEY ("syllabusRegulationId") REFERENCES "SyllabusRegulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
