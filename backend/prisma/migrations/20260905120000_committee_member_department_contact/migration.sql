-- Department and contact number for a committee member.
--
-- The college publishes its committee rosters with five columns - name,
-- designation, department, role and a contact number - and only three of them
-- existed. The Anti-Sexual Harassment Cell is the case that forced it: a cell
-- that exists to be reached is not much use without a number to call.
--
-- Both nullable with no backfill: a committee that does not break its members
-- down by department, or does not publish numbers, leaves them empty and
-- renders exactly as it does today.
ALTER TABLE "CommitteeMember" ADD COLUMN "department" TEXT;
ALTER TABLE "CommitteeMember" ADD COLUMN "contact" TEXT;
