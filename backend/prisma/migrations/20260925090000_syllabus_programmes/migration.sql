-- Academics -> Syllabus becomes CMS-driven.
--
-- The page carried three headings written into the code - B.Tech (UG),
-- M.Tech (PG), MBA - each with its regulations in a const array beside it. So
-- renaming a heading, retiring R15, or offering a course the page had never
-- heard of all meant a code change and a deploy. BCA was approved for
-- AY 2026-27 while the page still knew about three programmes.
--
-- Purely additive: two new tables, nothing altered and nothing dropped. Until
-- rows exist the public page falls back to the three headings it has always
-- shown, so this migration on its own changes nothing a visitor sees.

CREATE TABLE "SyllabusProgramme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" "ProgrammeLevel",
    "nameContains" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SyllabusProgramme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyllabusRegulation" (
    "id" SERIAL NOT NULL,
    "programmeId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SyllabusRegulation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SyllabusProgramme_deletedAt_idx" ON "SyllabusProgramme"("deletedAt");
CREATE INDEX "SyllabusRegulation_programmeId_idx" ON "SyllabusRegulation"("programmeId");
CREATE INDEX "SyllabusRegulation_deletedAt_idx" ON "SyllabusRegulation"("deletedAt");

ALTER TABLE "SyllabusProgramme" ADD CONSTRAINT "SyllabusProgramme_deletedBy_fkey"
    FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SyllabusRegulation" ADD CONSTRAINT "SyllabusRegulation_programmeId_fkey"
    FOREIGN KEY ("programmeId") REFERENCES "SyllabusProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SyllabusRegulation" ADD CONSTRAINT "SyllabusRegulation_deletedBy_fkey"
    FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
