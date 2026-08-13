-- Manual display order for exam notifications.
--
-- The public and admin lists both sorted by date only, so the examination
-- office could not pin an important notice above a newer one. This adds the
-- same drag-to-reorder capability Faculty already has.
--
-- Additive and non-breaking: NOT NULL with a default of 0, so every existing
-- row gets 0 and stays tied. The existing date ordering is the tie-breaker,
-- which means nothing moves until someone actually drags something.
ALTER TABLE "ExamNotification" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
