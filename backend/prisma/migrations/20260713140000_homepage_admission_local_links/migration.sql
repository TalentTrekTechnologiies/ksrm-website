UPDATE "ContentCard"
SET "linkUrl" = '/admissions/ug',
    "linkText" = 'View UG Courses',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "section" = 'homepage_admission_programs'
  AND lower("title") LIKE '%b.tech%';

UPDATE "ContentCard"
SET "linkUrl" = '/admissions/diploma',
    "linkText" = 'View Diploma Courses',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "section" = 'homepage_admission_programs'
  AND lower("title") LIKE '%diploma%';

UPDATE "ContentCard"
SET "linkUrl" = '/admissions/pg',
    "linkText" = 'View PG Courses',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "section" = 'homepage_admission_programs'
  AND (
    lower("title") LIKE '%m.tech%'
    OR lower("title") LIKE '%mba%'
    OR lower("title") LIKE '%postgraduate%'
  );
