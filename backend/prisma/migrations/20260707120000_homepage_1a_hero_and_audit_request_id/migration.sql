-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "requestId" TEXT;

-- CreateTable
CREATE TABLE "HomepageHero" (
    "id" SERIAL NOT NULL,
    "accreditationLabel" TEXT,
    "heading" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryHref" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryHref" TEXT,
    "panelLabel" TEXT,
    "captions" JSONB,
    "newsTicker" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "HomepageHero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageHero_isActive_idx" ON "HomepageHero"("isActive");

-- CreateIndex
CREATE INDEX "HomepageHero_deletedAt_idx" ON "HomepageHero"("deletedAt");

-- AddForeignKey
ALTER TABLE "HomepageHero" ADD CONSTRAINT "HomepageHero_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

