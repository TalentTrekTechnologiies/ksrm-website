-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" SERIAL NOT NULL,
    "routeNo" TEXT NOT NULL,
    "fromPlace" TEXT NOT NULL,
    "via" TEXT,
    "departTime" TEXT,
    "returnTime" TEXT,
    "fee" TEXT,
    "busNo" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransportRoute_deletedAt_idx" ON "TransportRoute"("deletedAt");

-- CreateIndex
CREATE INDEX "TransportRoute_sortOrder_idx" ON "TransportRoute"("sortOrder");

-- AddForeignKey
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
