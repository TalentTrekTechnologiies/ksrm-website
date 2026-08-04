-- CreateEnum
CREATE TYPE "FacultyAchievementType" AS ENUM ('PUBLICATION', 'PATENT', 'BOOK', 'AWARD', 'CERTIFICATION');

-- CreateTable
CREATE TABLE "FacultyAchievement" (
    "id" SERIAL NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "type" "FacultyAchievementType" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "referenceNo" TEXT,
    "date" TIMESTAMP(3),
    "status" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FacultyAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacultyAchievement_facultyId_idx" ON "FacultyAchievement"("facultyId");

-- CreateIndex
CREATE INDEX "FacultyAchievement_type_idx" ON "FacultyAchievement"("type");

-- CreateIndex
CREATE INDEX "FacultyAchievement_deletedAt_idx" ON "FacultyAchievement"("deletedAt");

-- AddForeignKey
ALTER TABLE "FacultyAchievement" ADD CONSTRAINT "FacultyAchievement_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAchievement" ADD CONSTRAINT "FacultyAchievement_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

