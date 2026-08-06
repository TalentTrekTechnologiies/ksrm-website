-- KGCET gets tables of its own.
--
-- The participation figures and the three highlight cards were in the page's
-- source, exposed only as loose text slots in Page Content - publishing this
-- year's turnout meant finding "participation.4.attended" among sixty text
-- boxes. Purely additive: no existing table is touched.

CREATE TABLE "KgcetParticipation" (
    "id"         SERIAL       NOT NULL,
    "year"       TEXT         NOT NULL,
    "registered" INTEGER      NOT NULL DEFAULT 0,
    "attended"   INTEGER      NOT NULL DEFAULT 0,
    "qualified"  INTEGER      NOT NULL DEFAULT 0,
    "sortOrder"  INTEGER      NOT NULL DEFAULT 0,
    "isActive"   BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    "deletedAt"  TIMESTAMP(3),
    "deletedBy"  INTEGER,
    "version"    INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT "KgcetParticipation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KgcetHighlight" (
    "id"          SERIAL       NOT NULL,
    "icon"        TEXT,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "sortOrder"   INTEGER      NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    "deletedAt"   TIMESTAMP(3),
    "deletedBy"   INTEGER,
    "version"     INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT "KgcetHighlight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KgcetParticipation_deletedAt_idx" ON "KgcetParticipation"("deletedAt");
CREATE INDEX "KgcetParticipation_sortOrder_idx" ON "KgcetParticipation"("sortOrder");
CREATE INDEX "KgcetHighlight_deletedAt_idx"     ON "KgcetHighlight"("deletedAt");
CREATE INDEX "KgcetHighlight_sortOrder_idx"     ON "KgcetHighlight"("sortOrder");

-- SET NULL, not CASCADE: removing an admin account must never delete the
-- content they happened to have deleted.
ALTER TABLE "KgcetParticipation"
  ADD CONSTRAINT "KgcetParticipation_deletedBy_fkey"
  FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KgcetHighlight"
  ADD CONSTRAINT "KgcetHighlight_deletedBy_fkey"
  FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
