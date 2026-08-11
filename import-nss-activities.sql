--
-- NSS Annual Activity Calendar 2026-27 -> PageTable
--
-- No application code was needed for this: the NSS page already renders
-- <PageResources section="nss" />, and PageResources already fetches and
-- renders every PageTable row for its section. So this table becomes visible
-- the moment the row below exists, and is editable afterwards from the admin
-- page-table editor like any other CMS table - no redeploy to change a date.
--
-- Idempotent: re-running updates the existing row rather than duplicating it
-- (PageTable.key is unique).
--
-- Two transcription fixes applied to the source list, both obvious typos:
--   "14-Aprl-2027" / "28-Aprl-2027"  -> "14-Apr-2027" / "28-Apr-2027"
--   "04 -Nov-2026"                   -> "04-Nov-2026"  (stray space)
-- Everything else, including the date ranges written as prose
-- ("1st to 07th July, 2026"), is kept verbatim.
--

BEGIN;

INSERT INTO "PageTable" (
  key,
  "pageSection",
  title,
  columns,
  rows,
  footnote,
  "sortOrder",
  "isActive",
  "createdAt",
  "updatedAt",
  version
)
VALUES (
  'nss.annual-activities-2026-27',
  'nss',
  'Annual Activity Calendar 2026-27',
  ARRAY['S.No.', 'Name of the Activity', 'Date']::text[],
  '[
    ["1","World Bicycle Day","03-Jun-2026"],
    ["2","World Environment Day","05-Jun-2026"],
    ["3","International Yoga Day","21-Jun-2026"],
    ["4","International Day Against Drug Abuse Rally","26-Jun-2026"],
    ["5","Van Mahotsav Saptah","1st to 07th July, 2026"],
    ["6","World Population Day","11-July-2026"],
    ["7","Awareness program on Education Loans","15-July-2026"],
    ["8","Blood Donation program at Leelavathi Charitable trust","01-Aug-2026"],
    ["9","Orientation Day to Newly joined NSS students","05-Aug-2026"],
    ["10","Swachh Bharat","10-Aug-2026"],
    ["11","Har Ghar Tiranga Campaign","14-Aug-2026"],
    ["12","Free Eco-Friendly clay Ganesh idols to citizens","26-Aug-2026"],
    ["13","World Literacy Day","08-Sep-2026"],
    ["14","NSS foundation day","24-Sep-2026"],
    ["15","Swachhta Hai Seva","28-Sep-2026"],
    ["16","Gandhi Jayanthi","02-Oct-2026"],
    ["17","Cyber Security Awareness","05-Oct-2026"],
    ["18","World Eye Sight Day","09-Oct-2026"],
    ["19","Free Medical Health Check-Up","13-Oct-2026"],
    ["20","Global Hand Washing Day","15-Oct-2026"],
    ["21","Rastriya Ekta Diwas or Unity March","31-Oct-2026"],
    ["22","Mega Blood Donation Camp","04-Nov-2026"],
    ["23","Free Eye Check-Up","04-Nov-2026"],
    ["24","Blood Grouping Test","24-Nov-2026"],
    ["25","Awareness on Drugs","27-Nov-2026"],
    ["26","World AIDS Day","01-Dec-2026"],
    ["27","Blood Donation Camp at Mrudula Hospital","10-Dec-2026"],
    ["28","Food donation program for visually challenged people","04-Jan-2027"],
    ["29","National Road Safety week","11th - 17th Jan, 2027"],
    ["30","National Youth Day","12-Jan-2027"],
    ["31","National Voters'' Day","25-Jan-2027"],
    ["32","World Cancer Day","04-Feb-2027"],
    ["33","Pariksha Pe Charcha","06-Feb-2027"],
    ["34","Viksit Bharat Youth Parliament","06-Mar-2027"],
    ["35","Free Health Check-Up","10-Mar-2027"],
    ["36","World Tuberculosis (TB) Day","24-Mar-2027"],
    ["37","Awareness on Helmet bike rally","26-Mar-2027"],
    ["38","Dr. B.R. Ambedkar Jayanthi","14-Apr-2027"],
    ["39","Say No to Drugs","28-Apr-2027"],
    ["40","National Technology Day","11-May-2027"],
    ["41","Anti-Terrorism Day","21-May-2027"],
    ["42","Anti-Tobacco Day","31-May-2027"]
  ]'::jsonb,
  'NSSPO  ·  Dean, Students Affairs  ·  Principal',
  0,
  true,
  NOW(),
  NOW(),
  1
)
ON CONFLICT (key) DO UPDATE SET
  "pageSection" = EXCLUDED."pageSection",
  title         = EXCLUDED.title,
  columns       = EXCLUDED.columns,
  rows          = EXCLUDED.rows,
  footnote      = EXCLUDED.footnote,
  "isActive"    = EXCLUDED."isActive",
  "updatedAt"   = NOW(),
  version       = "PageTable".version + 1;

COMMIT;
