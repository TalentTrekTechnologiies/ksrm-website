-- Structured extras for events that need more than title/description/dates -
-- fests with a prize pool and multiple competition strands, chiefly, but
-- reusable for any event with a convener or byline. Purely additive.

ALTER TABLE "Event" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Event" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Event" ADD COLUMN "prizePool" TEXT;
ALTER TABLE "Event" ADD COLUMN "organizerName" TEXT;
