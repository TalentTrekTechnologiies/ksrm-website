--
-- Apex bodies and IQAC composition -> VPS.
--
-- The code for these is already deployed, but the rows only existed on the
-- machine that read them off the old site. Without this the IQAC page shows
-- "Members will be published here shortly" under all three apex bodies and an
-- empty composition table, which is exactly what the live site does now.
--
--   Governing Body     12 members   (read from the old site's gbody.php)
--   Academic Council   22 members   (academiccouncil.php)
--   Finance Committee   3 members   (financial.php)
--   IQAC               35 members   (the page's own composition table)
--
-- Idempotent: a committee is matched on (name, type) and reused if present;
-- each member is matched on name within that committee. Nothing is updated or
-- deleted, so a second run inserts nothing.
--
-- Needs the IQAC committee type, which is already applied on the VPS:
--   ALTER TYPE "CommitteeType" ADD VALUE 'IQAC';
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f deploy-committees.sql
--

BEGIN;

DO $$
DECLARE
  cid     integer;
  n_total integer := 0;
  n0 integer := 0; n1 integer := 0; n2 integer := 0; n3 integer := 0;
BEGIN

  ------------------------------------------------------------------
  -- Governing Body (GOVERNING_BODY) - 12 members
  ------------------------------------------------------------------
  SELECT id INTO cid FROM "Committee" WHERE name = 'Governing Body' AND type = 'GOVERNING_BODY'::"CommitteeType";
  IF cid IS NULL THEN
    INSERT INTO "Committee" (name, type, description, "isActive", "createdAt", "updatedAt")
    VALUES ('Governing Body', 'GOVERNING_BODY'::"CommitteeType", 'The apex decision-making body of the institution.', true, now(), now())
    RETURNING id INTO cid;
  END IF;

  INSERT INTO "CommitteeMember" ("committeeId", name, designation, role, "sortOrder", "isActive", "createdAt", "updatedAt")
  SELECT cid, v.n, v.d, v.r, v.s, true, now(), now()
  FROM (VALUES
      ('Sri K. Raja Mohan Reddy, chairman, K.S.R.M. College of Engineering(A), Kadapa','Trust/Management','Chairperson',0),
      ('Sri K. Madan Mohan Reddy , Vice-Chairman, K.S.R.M. College of Engineering(A), Kadapa','Trust/Management','Member',1),
      ('Smt K. Rajeswari, Correspondent, K.S.R.M. College of Engineering(A), Kadapa','Trust/Management','Member',2),
      ('Sri S. Venkata Siva Reddy, Member, K.S.R.M. College of Engineering(A), Kadapa','Trust/Management','Member',3),
      ('Dr. K. Chandra Obula Reddy, Member, K.S.R.M. College of Engineering(A), Kadapa','Trust/Management','Member',4),
      ('Dr. B. Sudheer Prem Kumar, Professor & Secretary of APSCHE, Mechanical Engineering, JNTUH College of Engineering, Hyderabad','Educationalist nominated by the management for the duration of 5 years.','Member',5),
      ('Prof. Prabhat Kumar Singh, Head of the Department of Civil Engineering, Indian Institute Technology (BHU), VARANASI-221 005 (UP)','U.G.C. Nominee','Member',6),
      ('One Member to be nominated by the State Government.','State Govt. Nominee','Member',7),
      ('Prof P. Sujatha, Principal, JUNTUA College of Engineering, Ananthapuramu-515 002','Nominated by the JNTUA University for the duration of 5 years.','Member',8),
      ('Prof M. Venkata Narayana, Professor of ECE Department, Dean R & D Cell, K.S.R.M. College of Engineering(A), Kadapa','Teacher nominated by the Principal','Member',9),
      ('Dr. K. Srinivasa Rao, Professor of CSE Department, K.S.R.M. College of Engineering(A), Kadapa','Teacher nominated by the Principal','Member',10),
      ('Prof V.S.S. Murthy, Principal, K.S.R.M. College of Engineering(A), Kadapa','Principal of the College','Member Secretary',11)
    ) AS v(n, d, r, s)
  WHERE NOT EXISTS (SELECT 1 FROM "CommitteeMember" m WHERE m."committeeId" = cid AND m.name = v.n);
  GET DIAGNOSTICS n0 = ROW_COUNT;
  n_total := n_total + n0;

  ------------------------------------------------------------------
  -- Academic Council (OTHER) - 22 members
  ------------------------------------------------------------------
  SELECT id INTO cid FROM "Committee" WHERE name = 'Academic Council' AND type = 'OTHER'::"CommitteeType";
  IF cid IS NULL THEN
    INSERT INTO "Committee" (name, type, description, "isActive", "createdAt", "updatedAt")
    VALUES ('Academic Council', 'OTHER'::"CommitteeType", 'Apex body of the institution.', true, now(), now())
    RETURNING id INTO cid;
  END IF;

  INSERT INTO "CommitteeMember" ("committeeId", name, designation, role, "sortOrder", "isActive", "createdAt", "updatedAt")
  SELECT cid, v.n, v.d, v.r, v.s, true, now(), now()
  FROM (VALUES
      ('Prof. V.S.S.Murthy','Principal','Chairman',0),
      ('Dr. V. Adinarayana Reddy','Dean Academics','Convener',1),
      ('Dr. N. Amarnath Reddy','Hod,CE','Member',2),
      ('Dr. M. S. Priyadarshini','Hod,EEE','Member',3),
      ('Prof D. Ravikanth','Hod,ME','Member',4),
      ('Prof G. Hemalatha','Hod,ECE','Member',5),
      ('Prof V. Lokeswara Reddy','Hod,CSE','Member',6),
      ('Dr. I. Sreevani','Hod, H & S','Member',7),
      ('Dr. S. Zahiruddin','Asso. Prof in ECE','Member',8),
      ('Dr. K. Sreenivasa Rao','Prof in CSE','Member',9),
      ('Sri M. Bhaskar Reddy','Asso Prof in EEE','Member',10),
      ('Dr. P. Srinivas','Asso Prof in ME','Member',11),
      ('Dr. Y. Satish Kumar Reddy','Asst Prof in Mathematics','Member',12),
      ('Dr. I. Sreenivasulu Reddy','Asst Prof in CE','Member',13),
      ('INDUSTRY: Sri. N. Sudhakar Reddy','Plant Head & Head of Corporate Governance, Shiridi Sai Electricals Limited','Member',14),
      ('EDUCATION: Prof. T. Kishore Kumar','Professor, NIT - Warangal','Member',15),
      ('MEDICINE: Dr. K. Ganga Prasad Reddy','Kadapa Children Hospital, Kadapa','Member',16),
      ('ENGINEERING: Dr. K. Vijay Kumar Reddy','Professor, JNTUH, Hyderabad','Member',17),
      ('Prof V. Sumalatha','Director of Acedamic & Planning, JNT University, Ananatapuramu','Member',18),
      ('Prof E. Keshava Reddy','Director of Evalution, JNT University, Ananatapuramu','Member',19),
      ('Prof S.Vasundra','Professor in CSE, JNTUA, Ananatapuramu','Member',20),
      ('Dr. S.L. Prathapa Reddy','Associate Professor in ECE','Member Secertary',21)
    ) AS v(n, d, r, s)
  WHERE NOT EXISTS (SELECT 1 FROM "CommitteeMember" m WHERE m."committeeId" = cid AND m.name = v.n);
  GET DIAGNOSTICS n1 = ROW_COUNT;
  n_total := n_total + n1;

  ------------------------------------------------------------------
  -- Finance Committee (OTHER) - 3 members
  ------------------------------------------------------------------
  SELECT id INTO cid FROM "Committee" WHERE name = 'Finance Committee' AND type = 'OTHER'::"CommitteeType";
  IF cid IS NULL THEN
    INSERT INTO "Committee" (name, type, description, "isActive", "createdAt", "updatedAt")
    VALUES ('Finance Committee', 'OTHER'::"CommitteeType", 'Apex body of the institution.', true, now(), now())
    RETURNING id INTO cid;
  END IF;

  INSERT INTO "CommitteeMember" ("committeeId", name, designation, role, "sortOrder", "isActive", "createdAt", "updatedAt")
  SELECT cid, v.n, v.d, v.r, v.s, true, now(), now()
  FROM (VALUES
      ('Dr. V.S.S. Murthy','Principal','Chairperson',0),
      ('Sri.K. Jayanarasimhulu','Accounts Manager','Coordinator',1),
      ('Dr. G. Hemalatha','Professor & HoD','Member',2)
    ) AS v(n, d, r, s)
  WHERE NOT EXISTS (SELECT 1 FROM "CommitteeMember" m WHERE m."committeeId" = cid AND m.name = v.n);
  GET DIAGNOSTICS n2 = ROW_COUNT;
  n_total := n_total + n2;

  ------------------------------------------------------------------
  -- IQAC (IQAC) - 35 members
  ------------------------------------------------------------------
  SELECT id INTO cid FROM "Committee" WHERE name = 'IQAC' AND type = 'IQAC'::"CommitteeType";
  IF cid IS NULL THEN
    INSERT INTO "Committee" (name, type, description, "isActive", "createdAt", "updatedAt")
    VALUES ('IQAC', 'IQAC'::"CommitteeType", 'Internal Quality Assurance Cell - composition.', true, now(), now())
    RETURNING id INTO cid;
  END IF;

  INSERT INTO "CommitteeMember" ("committeeId", name, designation, role, "sortOrder", "isActive", "createdAt", "updatedAt")
  SELECT cid, v.n, v.d, v.r, v.s, true, now(), now()
  FROM (VALUES
      ('Prof. T. Nageswara Prasad','Principal','Chairperson',0),
      ('Sri K. Madan Mohan Reddy','Vice-Chairman','Management',1),
      ('Prof. T. Nageswara Prasad','Dean, Academics','Member',2),
      ('Dr. M. Venkatanarayana','Dean, R&D','Member',3),
      ('Mr. A. Ramprakash Reddy','Dean, Faculty Affairs','Member',4),
      ('Mrs. B. Manorama Devi','Dean, Student Affairs','Member',5),
      ('Mr. R. Nagaraju','Dean, Training & Placements','Member',6),
      ('Dr. N. Amaranatha Reddy','Dean, Alumni','Member',7),
      ('Dr. M. Venugopal','Dean, Industry Relations','Member',8),
      ('Dr. V. Giridhar','Dean, Industry Institution Cell','Member',9),
      ('Dr. T. Elia','Dean, Innovation & Entrepreneurship','Member',10),
      ('Dr. M. V. Ravi Kishore Reddy','Controller of Examinations','Member',11),
      ('Dr. G. Chennakesava Reddy','HoD, Civil','Member',12),
      ('Dr. M.S. Priyadarshini','HoD, EEE','Member',13),
      ('Mr. K. Suresh Kumar','HoD, Mechanical','Member',14),
      ('Dr. M. Venkatanarayana','HoD, ECE','Member',15),
      ('Dr. V. Lokeswara Reddy','HoD, CSE','Member',16),
      ('Dr. V. Ramachandra Reddy','HoD, H&S','Member',17),
      ('Dr. N. Suhasini','HoD, MBA','Member',18),
      ('Mrs. G. Sireesha','Manager, Broadcom','Member',19),
      ('Mr. S. Guru Sankar','MD, Chaitanya Chemicals','Member',20),
      ('Mr. K. Subramanyam','Health Coordinator','Member',21),
      ('Mr. M. Vara Prasad Reddy','Deputy Executive Engineer','Member',22),
      ('Mr. M. Obul Das','DAS Educational & Welfare NGO','Member',23),
      ('Ms. K. Shanmukhi Lasya','Student','Member',24),
      ('Mr. B. Bala Subramanyam','Student','Member',25),
      ('Mrs. K. HarshaVardhini','Student','Member',26),
      ('Dr. V. Vijaya Kishore','Prof., ECE','Coordinator',27),
      ('Dr. I. Srinivasula Reddy','Asso. Prof., CE','Dy. Dean',28),
      ('Mr. P. Suresh Praveen Kumar','Asst. Prof., CE','Asso. Dean',29),
      ('Dr. C. Kumar Reddy','Asso. Prof., EEE','Asso. Dean',30),
      ('Mr. A. HariKrishna','Asst. Prof., ME','Asso. Dean',31),
      ('Dr. K. Pavan Kumar','Asso. Prof., ECE','Asso. Dean',32),
      ('Mrs. B. Swetha','Asst. Prof., CSE','Asso. Dean',33),
      ('Dr. M. Vijaya Bhaskar Reddy','Asso. Prof., H&S','Asso. Dean',34)
    ) AS v(n, d, r, s)
  WHERE NOT EXISTS (SELECT 1 FROM "CommitteeMember" m WHERE m."committeeId" = cid AND m.name = v.n);
  GET DIAGNOSTICS n3 = ROW_COUNT;
  n_total := n_total + n3;
  RAISE NOTICE '------------------------------------';
  RAISE NOTICE 'Committee members added : %', n_total;
  RAISE NOTICE '------------------------------------';

END $$;

COMMIT;
