-- Page-view counting and live-presence tracking for the visitor widget.
-- Purely additive.

ALTER TABLE "SiteVisitDay" ADD COLUMN "hits" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "SitePresence" (
    "id" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitePresence_pkey" PRIMARY KEY ("id")
);
