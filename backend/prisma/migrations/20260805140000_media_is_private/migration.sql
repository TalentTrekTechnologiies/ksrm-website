-- Close the public file route over applicants' resumes.
--
-- THE PROBLEM
--
-- Resumes are stored as Media Library rows (CareerApplication.resumeMediaId),
-- and GET /media/file/:id/:variant/:format has no auth guard - by design, it
-- serves public marketing assets. So every resume ever submitted was
-- downloadable by anyone who walked the id sequence, and CareerApplication
-- .resumeUrl stored exactly that public URL.
--
-- The careers module already had a permission-gated route for staff to read a
-- resume (GET /career-applications/admin/:id/resume), with a comment saying
-- the public route must not be used for PII. Nothing enforced it.
--
-- It was not only theoretical: two published documents were pointing at a
-- resume's media id, so clicking them on the public site downloaded it.

ALTER TABLE "Media" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- Every resume already submitted becomes private. This is the whole point of
-- the migration - without it the column only protects future uploads and
-- leaves the existing ones exposed.
UPDATE "Media"
   SET "isPrivate" = true
 WHERE id IN (SELECT "resumeMediaId" FROM "CareerApplication");

-- The public route filters on this, so it needs to be indexed.
CREATE INDEX "Media_isPrivate_idx" ON "Media"("isPrivate");
