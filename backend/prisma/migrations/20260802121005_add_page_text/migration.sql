-- CreateTable
CREATE TABLE "PageText" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "pageSection" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PageText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageText_key_key" ON "PageText"("key");

-- CreateIndex
CREATE INDEX "PageText_pageSection_idx" ON "PageText"("pageSection");

