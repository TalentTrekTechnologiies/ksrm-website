-- DropTable
-- Degree Verification module removed per explicit product decision: the
-- feature was never truly used (admin CRUD page was a bare stub, the public
-- verification page bypasses this table entirely via an external portal at
-- icredify.com). Confirmed zero rows in production before this migration
-- was written. The table's own FK constraint and index are dropped
-- automatically as part of DROP TABLE.
DROP TABLE "DegreeVerification";
