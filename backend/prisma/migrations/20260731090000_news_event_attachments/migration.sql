ALTER TABLE "News"  ADD COLUMN "videoUrl" TEXT,
                    ADD COLUMN "videoMediaId" INTEGER,
                    ADD COLUMN "documentUrl" TEXT,
                    ADD COLUMN "documentMediaId" INTEGER;

ALTER TABLE "Event" ADD COLUMN "videoUrl" TEXT,
                    ADD COLUMN "videoMediaId" INTEGER,
                    ADD COLUMN "documentUrl" TEXT,
                    ADD COLUMN "documentMediaId" INTEGER;
