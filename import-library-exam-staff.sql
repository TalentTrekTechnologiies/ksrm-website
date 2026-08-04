--
-- Focused data import: Examination Section + Central Library staff
-- Source: local KSRM CMS database
--
-- This file is intentionally data-only and narrow. It imports only:
--   1. Department slug 'examination-section'
--   2. Department slug 'central-library'
--   3. Faculty rows for those two departments
--
-- It is idempotent:
--   - Existing Department rows are reused by slug.
--   - Existing Faculty rows are skipped by (name, department).
--   - No unrelated data is updated, deleted, or overwritten.
--

BEGIN;

DO $$
DECLARE
  exam_dept_id integer;
  library_dept_id integer;
BEGIN
  INSERT INTO "Department" (
    slug,
    name,
    "shortName",
    tagline,
    intro,
    about,
    "aboutVideoUrl",
    "heroImageUrl",
    vision,
    mission,
    "establishedYear",
    "hodId",
    "isActive",
    "createdAt",
    "updatedAt",
    "metaTitle",
    "metaDescription",
    "ogImageUrl",
    "deletedAt",
    "deletedBy",
    version,
    "heroMediaId"
  )
  VALUES (
    'examination-section',
    'Examination Section',
    'Exams',
    'Controller of Examinations office',
    NULL,
    'The Examination Section administers all university and internal examinations.',
    NULL,
    NULL,
    NULL,
    ARRAY[]::text[],
    NULL,
    NULL,
    true,
    '2026-07-31 18:30:57.127'::timestamp,
    '2026-07-31 18:34:01.818'::timestamp,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    NULL
  )
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO "Department" (
    slug,
    name,
    "shortName",
    tagline,
    intro,
    about,
    "aboutVideoUrl",
    "heroImageUrl",
    vision,
    mission,
    "establishedYear",
    "hodId",
    "isActive",
    "createdAt",
    "updatedAt",
    "metaTitle",
    "metaDescription",
    "ogImageUrl",
    "deletedAt",
    "deletedBy",
    version,
    "heroMediaId"
  )
  VALUES (
    'central-library',
    'Central Library',
    'Library',
    NULL,
    NULL,
    'The Central Library of K.S.R.M. College of Engineering.',
    NULL,
    NULL,
    NULL,
    ARRAY[]::text[],
    NULL,
    NULL,
    true,
    '2026-08-01 12:57:27.558'::timestamp,
    '2026-08-01 12:57:27.558'::timestamp,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    NULL
  )
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO exam_dept_id
  FROM "Department"
  WHERE slug = 'examination-section';

  SELECT id INTO library_dept_id
  FROM "Department"
  WHERE slug = 'central-library';

  IF exam_dept_id IS NULL THEN
    RAISE EXCEPTION 'Could not resolve Department slug examination-section';
  END IF;

  IF library_dept_id IS NULL THEN
    RAISE EXCEPTION 'Could not resolve Department slug central-library';
  END IF;

  INSERT INTO "Faculty" (
    name,
    designation,
    qualification,
    department,
    specialization,
    experience,
    email,
    phone,
    "photoUrl",
    "isHod",
    "isActive",
    "createdAt",
    "updatedAt",
    "departmentId",
    "welcomeMessage",
    "sortOrder",
    "deletedAt",
    "deletedBy",
    version,
    "mediaId"
  )
  SELECT
    v.name,
    v.designation,
    v.qualification,
    'Examination Section',
    NULL,
    NULL,
    NULL,
    NULL,
    v.photo_url,
    v.is_hod,
    true,
    v.created_at,
    v.updated_at,
    exam_dept_id,
    NULL,
    v.sort_order,
    NULL,
    NULL,
    v.version,
    v.media_id
  FROM (VALUES
    ('Dr. M.V. Ravi Kishore Reddy', 'Controller of Examinations', '-', 'http://localhost:4000/api/media/file/43/ORIGINAL/SOURCE', true, 0, 2, NULL::integer, '2026-07-31 18:20:42.009'::timestamp, '2026-07-31 18:30:57.191'::timestamp),
    ('Dr. T. Venkatesh', 'Assistant Controller of Examinations', '-', NULL, false, 1, 2, NULL::integer, '2026-07-31 18:19:23.122'::timestamp, '2026-07-31 18:30:57.212'::timestamp),
    ('Sri. K. Sailendra Kumar Reddy', 'Programmer', '-', '/Exam%20Sec.%20Staff%20Photos/K%20Sailendra%20Kumar%20Reddy.jpg', false, 2, 2, NULL::integer, '2026-07-31 18:19:23.148'::timestamp, '2026-07-31 18:30:57.225'::timestamp),
    ('Sri. B. Venkata Narayana', 'Junior Assistant', '-', '/Exam%20Sec.%20Staff%20Photos/B%20V%20Narayana.jpg', false, 3, 2, NULL::integer, '2026-07-31 18:19:23.167'::timestamp, '2026-07-31 18:30:57.238'::timestamp),
    ('Sri. M. Raja Sekhar', 'Data Entry Operator', '-', '/Exam%20Sec.%20Staff%20Photos/M%20Rajasekhar.jpg', false, 4, 2, NULL::integer, '2026-07-31 18:19:23.181'::timestamp, '2026-07-31 18:30:57.250'::timestamp),
    ('Smt. M. Umadevi', 'Clerk', '-', '/Exam%20Sec.%20Staff%20Photos/M%20Umadevi.jpg', false, 5, 2, NULL::integer, '2026-07-31 18:19:23.209'::timestamp, '2026-07-31 18:30:57.265'::timestamp),
    ('Sri. N. Sreenivasula Reddy', 'Attender', '-', '/Exam%20Sec.%20Staff%20Photos/N%20Sreenivasula%20Reddy.jpg', false, 6, 2, NULL::integer, '2026-07-31 18:19:23.229'::timestamp, '2026-07-31 18:30:57.276'::timestamp),
    ('Smt. K. Aruna', 'Attender', '-', '/Exam%20Sec.%20Staff%20Photos/K%20Aruna.jpg', false, 7, 2, NULL::integer, '2026-07-31 18:19:23.242'::timestamp, '2026-07-31 18:30:57.285'::timestamp)
  ) AS v(name, designation, qualification, photo_url, is_hod, sort_order, version, media_id, created_at, updated_at)
  WHERE NOT EXISTS (
    SELECT 1
    FROM "Faculty" f
    WHERE f.name = v.name
      AND f.department = 'Examination Section'
  );

  INSERT INTO "Faculty" (
    name,
    designation,
    qualification,
    department,
    specialization,
    experience,
    email,
    phone,
    "photoUrl",
    "isHod",
    "isActive",
    "createdAt",
    "updatedAt",
    "departmentId",
    "welcomeMessage",
    "sortOrder",
    "deletedAt",
    "deletedBy",
    version,
    "mediaId"
  )
  SELECT
    v.name,
    v.designation,
    v.qualification,
    'Central Library',
    NULL,
    v.experience,
    v.email,
    v.phone,
    v.photo_url,
    v.is_hod,
    true,
    v.created_at,
    v.updated_at,
    library_dept_id,
    NULL,
    v.sort_order,
    NULL,
    NULL,
    v.version,
    v.media_id
  FROM (VALUES
    ('Dr. N. Ravisankar Reddy', 'Librarian', 'M.A., B.Ed., M.L.I.Sc., Ph.D', '16 years', 'library@ksrmce.ac.in', '9441373732', '/library/ravi.jpg', true, 0, 3, NULL::integer, '2026-08-01 12:57:27.658'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Smt. L. Sasi Kala', 'Assistant Librarian', 'M.L.I.Sc.', '18 years', NULL, NULL, '/library/sasikala.jpeg', false, 1, 3, NULL::integer, '2026-08-01 12:57:27.704'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Sri. N. Nithya Puja Reddy', 'Record Assistant', 'M.A., M.L.I.Sc.', '29 years', NULL, NULL, '/library/nithya.jpeg', false, 2, 3, NULL::integer, '2026-08-01 12:57:27.720'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Sri. L. Chandra Sekhar Reddy', 'Grade III Technician', 'S.S.C., I.T.I.', '28 years', NULL, NULL, '/library/chandra.jpeg', false, 3, 3, NULL::integer, '2026-08-01 12:57:27.736'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Smt. C. Aruna', 'Data Entry Operator', 'B.Sc. (Comp.)', '1 year', NULL, NULL, '/library/aruna.jpeg', false, 4, 3, NULL::integer, '2026-08-01 12:57:27.753'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Sri. B. Rama Mohan Reddy', 'Attender', 'B.A.', '8 years', NULL, NULL, '/library/ramamohan.jpeg', false, 5, 3, NULL::integer, '2026-08-01 12:57:27.787'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('K. Sailaja', 'Attender', 'B.Com. (Comp.)', '4 years', NULL, NULL, '/library/sailaja.jpeg', false, 6, 3, NULL::integer, '2026-08-01 12:57:27.807'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Sri. D. Siva Rama Krishna', 'Attender', 'S.S.C.', '3 years', NULL, NULL, '/library/sivaramakrishna.jpeg', false, 7, 3, NULL::integer, '2026-08-01 12:57:27.823'::timestamp, '2026-08-01 13:21:17.497'::timestamp),
    ('Sri. M. Balanna', 'Attender', 'S.S.C.', '1 year', NULL, NULL, '/library/att.jpeg', false, 8, 3, NULL::integer, '2026-08-01 12:57:27.854'::timestamp, '2026-08-01 13:21:17.497'::timestamp)
  ) AS v(name, designation, qualification, experience, email, phone, photo_url, is_hod, sort_order, version, media_id, created_at, updated_at)
  WHERE NOT EXISTS (
    SELECT 1
    FROM "Faculty" f
    WHERE f.name = v.name
      AND f.department = 'Central Library'
  );
END $$;

COMMIT;

--
-- Verification queries
--

SELECT id, name, slug, "isActive", "deletedAt"
FROM "Department"
WHERE slug IN ('examination-section', 'central-library')
ORDER BY slug;

SELECT department, COUNT(*) AS staff_count
FROM "Faculty"
WHERE department IN ('Examination Section', 'Central Library')
GROUP BY department
ORDER BY department;

SELECT f.id, f.name, f.department, f."departmentId"
FROM "Faculty" f
LEFT JOIN "Department" d ON d.id = f."departmentId"
WHERE f."departmentId" IS NOT NULL
  AND d.id IS NULL;
