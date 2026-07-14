-- AlterTable
ALTER TABLE "ExamNotification" ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "buttonUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "date" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ExamNotification_isPublished_idx" ON "ExamNotification"("isPublished");

-- CreateIndex
CREATE INDEX "ExamNotification_isActive_idx" ON "ExamNotification"("isActive");

