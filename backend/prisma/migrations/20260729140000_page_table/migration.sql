CREATE TABLE "PageTable" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "pageSection" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "columns" TEXT[],
    "rows" JSONB NOT NULL,
    "footnote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "PageTable_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PageTable_key_key" ON "PageTable"("key");
CREATE INDEX "PageTable_pageSection_idx" ON "PageTable"("pageSection");
CREATE INDEX "PageTable_isActive_idx" ON "PageTable"("isActive");
