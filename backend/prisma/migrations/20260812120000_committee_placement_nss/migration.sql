-- Adds the NSS placement so the NSS programme committee can be maintained in
-- Admin -> Committees and rendered on the Campus Life -> NSS page, the same
-- way the Library and IQAC committees already work.
--
-- Its own value rather than reusing CAMPUS_LIFE: that placement is shared by
-- every campus-life page, so NSS staff would surface on unrelated ones.
--
-- Purely additive. Adding a value to a Postgres enum rewrites no rows, takes
-- no destructive lock, and leaves every existing Committee untouched.
ALTER TYPE "CommitteePlacement" ADD VALUE IF NOT EXISTS 'NSS';
