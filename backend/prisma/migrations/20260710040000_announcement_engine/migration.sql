-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "AnnouncementSource" AS ENUM ('NEWS', 'EXAM_NOTIFICATION', 'EVENT', 'PLACEMENT', 'ADMISSION', 'MANUAL', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AnnouncementLocation" AS ENUM ('HEADER_TICKER', 'HERO_BANNER', 'HOMEPAGE_SECTION', 'DEPARTMENT_PAGE', 'ADMISSIONS_PAGE', 'PLACEMENTS_PAGE');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "shortText" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "badge" TEXT,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "color" TEXT,
    "source" "AnnouncementSource" NOT NULL DEFAULT 'MANUAL',
    "sourceModule" TEXT,
    "sourceRecordId" INTEGER,
    "linkUrl" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementPlacement" (
    "id" SERIAL NOT NULL,
    "announcementId" INTEGER NOT NULL,
    "location" "AnnouncementLocation" NOT NULL,
    "departmentId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnnouncementPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE INDEX "Announcement_isPublished_idx" ON "Announcement"("isPublished");

-- CreateIndex
CREATE INDEX "Announcement_deletedAt_idx" ON "Announcement"("deletedAt");

-- CreateIndex
CREATE INDEX "Announcement_startDate_endDate_idx" ON "Announcement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "AnnouncementPlacement_location_idx" ON "AnnouncementPlacement"("location");

-- CreateIndex
CREATE INDEX "AnnouncementPlacement_departmentId_idx" ON "AnnouncementPlacement"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementPlacement_announcementId_location_departmentId_key" ON "AnnouncementPlacement"("announcementId", "location", "departmentId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementPlacement" ADD CONSTRAINT "AnnouncementPlacement_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementPlacement" ADD CONSTRAINT "AnnouncementPlacement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
