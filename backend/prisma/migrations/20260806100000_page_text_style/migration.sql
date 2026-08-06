-- Per-slot appearance for Page Content text.
--
-- An admin can already change the wording of a slot; this lets them change how
-- that one piece of text looks - its size and its colour - without touching
-- the page's design or every other page.
--
-- Both nullable with no default: every existing slot keeps rendering exactly
-- as it does today, and clearing a field puts that slot back to the page's own
-- styling rather than to some default value.

ALTER TABLE "PageText" ADD COLUMN "fontSize" TEXT;
ALTER TABLE "PageText" ADD COLUMN "color" TEXT;
