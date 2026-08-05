-- Committees get an admin-controlled display order.
--
-- They were listed alphabetically, which is not the order a college presents
-- its committees in, and there was no way to change it. Members already had a
-- sortOrder column; committees themselves had none.

ALTER TABLE "Committee" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Seed with the alphabetical order the list already had, so switching the
-- query over to sortOrder does not reshuffle anybody's list on first load -
-- without this every row sits at 0 and Postgres is free to return them in any
-- order at all, which would look like the reorder feature broke the page.
WITH ordered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "name" ASC) - 1)::int AS pos
  FROM "Committee"
)
UPDATE "Committee" c
   SET "sortOrder" = o.pos
  FROM ordered o
 WHERE c.id = o.id;

-- Same treatment for any members left tied at the default. Rows created
-- before sortOrder was ever set all sit at 0 together, and a tie there is
-- resolved arbitrarily by the database, so a roster could come back in a
-- different order on different requests.
WITH tied AS (
  SELECT "committeeId"
    FROM "CommitteeMember"
   WHERE "deletedAt" IS NULL
   GROUP BY "committeeId"
  HAVING COUNT(*) > 1 AND COUNT(DISTINCT "sortOrder") = 1
),
renumbered AS (
  SELECT m.id, (ROW_NUMBER() OVER (PARTITION BY m."committeeId" ORDER BY m.id ASC) - 1)::int AS pos
    FROM "CommitteeMember" m
    JOIN tied t ON t."committeeId" = m."committeeId"
   WHERE m."deletedAt" IS NULL
)
UPDATE "CommitteeMember" m
   SET "sortOrder" = r.pos
  FROM renumbered r
 WHERE m.id = r.id;
