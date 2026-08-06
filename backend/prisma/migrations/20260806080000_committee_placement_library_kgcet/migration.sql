-- Two more pages a committee can be pointed at.
--
-- The Library Committee and the KGCET committee had nowhere to go: the
-- placement list stopped at Campus Life, so a committee for either page could
-- be entered and then rendered nowhere - the same gap that left Grievance
-- Redressal invisible before placements existed.
--
-- Additive. Postgres cannot add an enum value inside a transaction that also
-- uses it, but adding alone is fine, and no existing row changes: every
-- committee keeps whatever placement it already had.

ALTER TYPE "CommitteePlacement" ADD VALUE IF NOT EXISTS 'LIBRARY';
ALTER TYPE "CommitteePlacement" ADD VALUE IF NOT EXISTS 'KGCET';
