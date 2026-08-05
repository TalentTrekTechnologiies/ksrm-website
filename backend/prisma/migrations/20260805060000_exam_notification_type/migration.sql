-- CreateEnum
CREATE TYPE "ExamNotificationType" AS ENUM ('NOTIFICATION', 'RESULT', 'TIMETABLE', 'QUESTION_PAPER', 'SYLLABUS', 'CALENDAR');

-- AlterTable
ALTER TABLE "ExamNotification" ADD COLUMN "type" "ExamNotificationType" NOT NULL DEFAULT 'NOTIFICATION';
ALTER TABLE "ExamNotification" ADD COLUMN "mediaId" INTEGER;
