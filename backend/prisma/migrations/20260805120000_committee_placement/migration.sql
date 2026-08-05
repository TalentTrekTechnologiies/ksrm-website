-- A committee can now be pointed at a public page from the CMS.
--
-- Before this, where a committee appeared was decided entirely by its `type`,
-- and each type was wired to one hardcoded section. A committee that did not
-- match one of those - an Internal Complaint Committee, an SC/ST Cell, a
-- Women's Empowerment Cell - could only be saved as OTHER, which rendered on
-- no page at all. Adding one meant a developer adding an enum value and a
-- section to a page.

CREATE TYPE "CommitteePlacement" AS ENUM ('ABOUT', 'IQAC', 'GRIEVANCE', 'ANTI_RAGGING', 'CAMPUS_LIFE');

-- Nullable with no default, deliberately. Every existing committee starts at
-- NULL = "not placed on any page", so the sections that already render by
-- type keep rendering exactly what they render today and nothing appears
-- twice. Placement only ever adds a committee to a page, never moves one.
ALTER TABLE "Committee" ADD COLUMN "placement" "CommitteePlacement";

CREATE INDEX "Committee_placement_idx" ON "Committee"("placement");
