--
-- Content sync: laptop -> VPS
-- Source: local KSRM CMS database
--
-- Data-only, narrow and idempotent, in the same shape as
-- import-library-exam-staff.sql. It applies four things:
--
--   1. Retires the MCA department (soft-delete, matched by slug)
--   2. Adds the 8 global Contact page records (4 directory + 4 info)
--   3. Adds the 12 Academics programmes with their seats, codes and NBA marks
--   4. Adds 6 Mandatory Disclosure documents whose files already exist there
--
-- Non-destructive and safe to re-run:
--   - Nothing is hard-deleted. MCA is soft-deleted exactly as the admin UI
--     does it, so Restore still works.
--   - Rows are matched on natural keys (slug / name+group / department+name /
--     title), never on id - the two databases assign different ids for the
--     same records.
--   - Every INSERT is guarded by NOT EXISTS. A second run reports 0 inserted.
--   - No UPDATE touches a row this script did not create, except the one
--     deliberate MCA soft-delete.
--
-- RUN THE MIGRATIONS FIRST. This depends on columns added by
-- 20260805000000_programme_code_accreditation:
--     cd /var/www/ksrm/backend && npx prisma migrate deploy
--
-- NOT INCLUDED - 8 further Mandatory Disclosure documents (Accreditation
-- Status, NBA Letter, UGC Autonomous Letter, Organogram, Committee
-- Co-ordinators, Ombudsman, Fee Collection, Capacity Development). Those point
-- at local media ids that hold DIFFERENT FILES on the VPS - verified by
-- comparing both servers byte for byte. Inserting them would publish documents
-- that open the wrong PDF. Upload those eight through Admin -> Downloads on the
-- VPS instead, so it assigns its own media ids.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f deploy-data.sql
--

BEGIN;

DO $$
DECLARE
  media_base text := 'http://200.141.7.253';   -- change if the site moves to a domain
  n_mca      integer := 0;
  n_contacts integer := 0;
  n_progs    integer := 0;
  n_docs     integer := 0;
BEGIN

  ------------------------------------------------------------------
  -- 1. Retire the MCA department
  ------------------------------------------------------------------
  UPDATE "Department"
     SET "deletedAt" = now(), "isActive" = false, "updatedAt" = now(), "version" = "version" + 1
   WHERE slug = 'mca' AND "deletedAt" IS NULL;
  GET DIAGNOSTICS n_mca = ROW_COUNT;

  ------------------------------------------------------------------
  -- 2. Contact page records (global: departmentId IS NULL)
  ------------------------------------------------------------------
  -- "group" is a reserved word and must stay quoted. Matched on (name, group)
  -- among global rows only, so a department's own contact entry that happens
  -- to share a name is never mistaken for one of these.
  INSERT INTO "ContactChannel"
    (name, phones, emails, address, "mapEmbedUrl", "sortOrder", "isActive",
     "createdAt", "updatedAt", "departmentId", "group")
  SELECT v.name, v.phones, v.emails, v.address, NULL, v.sort, true,
         now(), now(), NULL, v.grp
  FROM (VALUES
      ('Principal Office',     ARRAY['+91 9000073434'], ARRAY['principal@ksrmce.ac.in']::text[],       NULL::text,                                                        0, 'directory'),
      ('Admissions Office',    ARRAY['+91 8143731980'], ARRAY['dean.admissions@ksrmce.ac.in']::text[], NULL::text,                                                        1, 'directory'),
      ('Examination Section',  ARRAY['08562 295972'],   ARRAY['exams@ksrmce.ac.in']::text[],           NULL::text,                                                        2, 'directory'),
      ('Training & Placement', ARRAY['+91 9000073434'], ARRAY['tpo@ksrmce.ac.in']::text[],             NULL::text,                                                        3, 'directory'),
      ('Address',              ARRAY[]::text[],         ARRAY[]::text[],                               'K.S.R.M. College of Engineering, Kadapa - 516003, Andhra Pradesh', 0, 'info'),
      ('Phone',                ARRAY['+91 9000332294'], ARRAY[]::text[],                               NULL::text,                                                        1, 'info'),
      ('Email',                ARRAY[]::text[],         ARRAY['principal@ksrmce.ac.in']::text[],       NULL::text,                                                        2, 'info'),
      ('Alternate',            ARRAY[]::text[],         ARRAY['info@ksrmce.ac.in']::text[],            NULL::text,                                                        3, 'info')
    ) AS v(name, phones, emails, address, sort, grp)
  WHERE NOT EXISTS (
    SELECT 1 FROM "ContactChannel" c
     WHERE c.name = v.name AND c."group" = v.grp AND c."departmentId" IS NULL
  );
  GET DIAGNOSTICS n_contacts = ROW_COUNT;

  ------------------------------------------------------------------
  -- 3. Academics programmes (seats, course codes, accreditation)
  ------------------------------------------------------------------
  -- These drive Academics -> Courses & Intake, the UG/PG/Diploma admissions
  -- tables and each department's page. Joined to Department by slug so the
  -- VPS's own department ids are used.
  INSERT INTO "DepartmentProgramme"
    ("departmentId", name, level, intake, code, accreditation, "sortOrder",
     "isActive", "createdAt", "updatedAt")
  SELECT d.id, v.name, v.level::"ProgrammeLevel", v.intake,
         NULLIF(v.code, ''), NULLIF(v.accreditation, ''), v.sort,
         true, now(), now()
  FROM (VALUES
      ('B.Tech - Civil Engineering',                               'civil',      'UG', 60,  'CE',          'NBA', 0),
      ('B.Tech - Computer Science & Engineering',                  'cse',        'UG', 120, 'CSE',         'NBA', 1),
      ('B.Tech - CSE (Artificial Intelligence & Machine Learning)','cse',        'UG', 60,  'CSE-AIML',    '',    2),
      ('B.Tech - CSE (Data Science)',                              'cse',        'UG', 60,  'CSE-DS',      '',    3),
      ('B.Tech - CSE (AI & ML Specialisation)',                    'cse',        'UG', 60,  'CSE-AIML-S',  '',    4),
      ('B.Tech - Electrical & Electronics Engineering',            'eee',        'UG', 60,  'EEE',         'NBA', 5),
      ('B.Tech - Electronics & Communication Engineering',         'ece',        'UG', 120, 'ECE',         'NBA', 6),
      ('B.Tech - Mechanical Engineering',                          'mechanical', 'UG', 60,  'ME',          'NBA', 7),
      ('M.Tech - Computer Science & Engineering',                  'cse',        'PG', 18,  'M.Tech-CSE',  '',    0),
      ('M.Tech - VLSI & Embedded Systems',                         'ece',        'PG', 18,  'M.Tech-VLSI', '',    1),
      ('M.Tech - Structural Engineering',                          'civil',      'PG', 18,  'M.Tech-SE',   '',    2),
      ('MBA - Master of Business Administration',                  'mba',        'PG', 60,  'MBA',         '',    3)
    ) AS v(name, slug, level, intake, code, accreditation, sort)
  JOIN "Department" d ON d.slug = v.slug AND d."deletedAt" IS NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM "DepartmentProgramme" p
     WHERE p."departmentId" = d.id AND p.name = v.name
  );
  GET DIAGNOSTICS n_progs = ROW_COUNT;

  ------------------------------------------------------------------
  -- 4. Mandatory Disclosure documents (only those whose media matches)
  ------------------------------------------------------------------
  -- fileUrl is rebuilt from media_base rather than copied: the local rows
  -- carry http://localhost:4000/... which would resolve against the visitor's
  -- own machine. Each row is inserted only if that media id really exists
  -- here, so a missing upload can never become a link to nothing.
  INSERT INTO "Download"
    (title, description, category, "departmentId", "categoryId", "pageSection",
     "groupLabel", "fileUrl", "sortOrder", "isActive", "publishedAt",
     "createdAt", "updatedAt", "mediaId")
  SELECT v.title, NULL, 'OTHER'::"DownloadCategory", NULL, NULL, 'mandatory-disclosure',
         'Other Statutory Documents',
         media_base || '/api/media/file/' || v.media || '/ORIGINAL/SOURCE',
         v.sort, true, now(), now(), now(), v.media
  FROM (VALUES
      ('Institution Core Values',                   168, 50),
      ('Code of Professional Conduct',              169, 51),
      ('Code of Conduct Handbook',                  170, 52),
      ('Faculty Evaluation System',                 171, 53),
      ('Code of Ethics in Research and Innovation', 172, 54),
      ('RTI Rules & Regulations',                   174, 57)
    ) AS v(title, media, sort)
  WHERE NOT EXISTS (
    SELECT 1 FROM "Download" d
     WHERE d.title = v.title AND d."pageSection" = 'mandatory-disclosure'
  )
  AND EXISTS (
    SELECT 1 FROM "Media" m WHERE m.id = v.media AND m."deletedAt" IS NULL
  );
  GET DIAGNOSTICS n_docs = ROW_COUNT;

  RAISE NOTICE '-------------------------------------------';
  RAISE NOTICE 'MCA departments retired  : %', n_mca;
  RAISE NOTICE 'Contact records added    : %', n_contacts;
  RAISE NOTICE 'Programmes added         : %', n_progs;
  RAISE NOTICE 'Disclosure documents     : %', n_docs;
  RAISE NOTICE '-------------------------------------------';
  IF n_progs < 12 THEN
    RAISE NOTICE 'Fewer than 12 programmes added - they already existed, or a';
    RAISE NOTICE 'department slug (civil/cse/eee/ece/mechanical/mba) is missing.';
  END IF;

END $$;

COMMIT;
