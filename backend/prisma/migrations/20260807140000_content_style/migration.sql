-- Per-field size and colour for content in ordinary CMS modules.
--
-- Page Content already had this, because PageText carries fontSize and color
-- itself. Doing the same for News, Events and the Gallery would have meant two
-- more columns on every module's table, forever. One loosely-keyed table
-- instead - the same (module, recordId, field) shape the audit log and media
-- usage already use here.
--
-- No foreign key to the content it styles, on purpose: this table must never
-- be the reason a module cannot delete a row, and an orphaned style is
-- harmless because it is only ever read by key.

CREATE TABLE "ContentStyle" (
    "id"        SERIAL       NOT NULL,
    "module"    TEXT         NOT NULL,
    "recordId"  INTEGER      NOT NULL,
    "field"     TEXT         NOT NULL,
    "fontSize"  TEXT,
    "color"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "ContentStyle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentStyle_module_recordId_field_key"
  ON "ContentStyle"("module", "recordId", "field");

CREATE INDEX "ContentStyle_module_idx" ON "ContentStyle"("module");

ALTER TABLE "ContentStyle"
  ADD CONSTRAINT "ContentStyle_updatedBy_fkey"
  FOREIGN KEY ("updatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
