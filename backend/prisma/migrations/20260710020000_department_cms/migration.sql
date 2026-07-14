-- CreateEnum
CREATE TYPE "DepartmentHighlightKind" AS ENUM ('HIGHLIGHT', 'ACHIEVEMENT');

-- AlterTable
ALTER TABLE "CampusVideo" ADD COLUMN     "departmentId" INTEGER;

-- AlterTable
ALTER TABLE "ContactChannel" ADD COLUMN     "departmentId" INTEGER;

-- AlterTable
ALTER TABLE "DepartmentHighlight" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "kind" "DepartmentHighlightKind" NOT NULL DEFAULT 'HIGHLIGHT',
ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "Lab" ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "Research" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "SiteStatistic" ADD COLUMN     "departmentId" INTEGER;

-- CreateTable
CREATE TABLE "DepartmentDisplaySetting" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "DepartmentDisplaySetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DepartmentDisplaySetting_departmentId_idx" ON "DepartmentDisplaySetting"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentDisplaySetting_departmentId_key_key" ON "DepartmentDisplaySetting"("departmentId", "key");

-- CreateIndex
CREATE INDEX "CampusVideo_departmentId_idx" ON "CampusVideo"("departmentId");

-- CreateIndex
CREATE INDEX "ContactChannel_departmentId_idx" ON "ContactChannel"("departmentId");

-- CreateIndex
CREATE INDEX "DepartmentHighlight_departmentId_kind_idx" ON "DepartmentHighlight"("departmentId", "kind");

-- AddForeignKey
ALTER TABLE "DepartmentDisplaySetting" ADD CONSTRAINT "DepartmentDisplaySetting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentDisplaySetting" ADD CONSTRAINT "DepartmentDisplaySetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteStatistic" ADD CONSTRAINT "SiteStatistic_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactChannel" ADD CONSTRAINT "ContactChannel_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusVideo" ADD CONSTRAINT "CampusVideo_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

