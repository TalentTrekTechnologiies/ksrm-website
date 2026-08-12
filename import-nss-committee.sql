--
-- NSS Programme Committee -> Committee + CommitteeMember
--
-- Seeds the committee once. Afterwards it is edited entirely from
-- Admin -> Committees like every other committee on the site: members can be
-- added, renamed, reordered or removed with no redeploy. The NSS page renders
-- whatever is in the CMS via <NssCommittee />, which selects on
-- placement = 'NSS'.
--
-- Requires the 20260812120000_committee_placement_nss migration, which adds
-- the NSS value to the CommitteePlacement enum.
--
-- Idempotent: re-running refreshes the roster rather than duplicating it. The
-- committee is matched by name, and its members are replaced wholesale, so
-- editing the list here and re-running produces exactly the list below.
--

BEGIN;

INSERT INTO "Committee" (name, type, description, placement, "sortOrder", "isActive", "createdAt", "updatedAt", version)
SELECT
  'NSS Programme Committee',
  'OTHER'::"CommitteeType",
  'National Service Scheme programme officer and committee members.',
  'NSS'::"CommitteePlacement",
  0,
  true,
  NOW(),
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "Committee" WHERE name = 'NSS Programme Committee' AND "deletedAt" IS NULL
);

-- Replace the roster so a re-run is a refresh, not a duplication.
DELETE FROM "CommitteeMember"
WHERE "committeeId" IN (
  SELECT id FROM "Committee" WHERE name = 'NSS Programme Committee' AND "deletedAt" IS NULL
);

INSERT INTO "CommitteeMember" (
  "committeeId", name, designation, role, "sortOrder", "isActive", "createdAt", "updatedAt", version
)
SELECT
  c.id, m.name, m.designation, m.role, m.sort_order, true, NOW(), NOW(), 1
FROM "Committee" c
CROSS JOIN (
  VALUES
    ('Mr. B. Lakshumaiah',      'Assistant Professor in ME',    'NSS PO',  0),
    ('Mr. Viswanath',           'Assistant Professor in CE',    'Member',  1),
    ('Mr. S. Khadarvalli',      'Assistant Professor in EEE',   'Member',  2),
    ('Mr. RPVG. Ashok Reddy',   'Assistant Professor in ECE',   'Member',  3),
    ('Smt. V. Sudha',           'Assistant Professor in CSE',   'Member',  4),
    ('Smt. B. Swetha',          'Assistant Professor in CSE',   'Member',  5),
    ('Dr. C. Manoj Kumar',      'Assistant Professor in H & S', 'Member',  6)
) AS m(name, designation, role, sort_order)
WHERE c.name = 'NSS Programme Committee' AND c."deletedAt" IS NULL;

COMMIT;
