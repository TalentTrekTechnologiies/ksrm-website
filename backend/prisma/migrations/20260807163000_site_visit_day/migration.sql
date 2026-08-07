-- Daily visit tally backing the footer's live visitor counter. New table,
-- nothing existing touched.

CREATE TABLE "SiteVisitDay" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SiteVisitDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteVisitDay_date_key" ON "SiteVisitDay"("date");
