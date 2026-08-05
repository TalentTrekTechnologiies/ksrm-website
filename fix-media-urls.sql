--
-- Rewrite hardcoded http://200.141.7.253 media URLs to relative paths.
--
-- THE PROBLEM
--
-- The site is served over https://ksrmce.ac.in, but 301 rows still carry
-- absolute URLs pointing at http://200.141.7.253 - written when the site was
-- reached by IP. A browser will not load http:// resources into an https://
-- page (mixed content), so those images and files silently fail: 144 faculty
-- photos, 99 gallery images, 54 documents. This is why "images are not
-- loading" while the same file opens fine if pasted into the address bar.
--
-- THE FIX
--
-- Strip the origin and keep the path: /api/media/file/415/ORIGINAL/SOURCE.
-- A relative URL inherits whatever scheme and host the page was served on, so
-- it works over https today, keeps working if the IP changes, and needs no
-- second pass if the site later moves to another domain. Verified the same
-- path serves correctly on the domain before writing this.
--
-- SAFETY
--
--   - Only rows whose URL starts with that exact origin are touched. Anything
--     already relative, already on ksrmce.ac.in, or pointing at an external
--     site (YouTube, JNTUA) is left exactly as it is.
--   - No row is created or deleted; only the origin prefix is removed.
--   - Idempotent: a second run matches nothing and reports 0.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f fix-media-urls.sql
--

BEGIN;

DO $$
DECLARE
  old_origin text := 'http://200.141.7.253';
  n_down     integer := 0;
  n_gal      integer := 0;
  n_fac      integer := 0;
  n_news     integer := 0;
  n_event    integer := 0;
  n_exam     integer := 0;
  n_place    integer := 0;
BEGIN

  UPDATE "Download"
     SET "fileUrl" = substring("fileUrl" from length(old_origin) + 1)
   WHERE "fileUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_down = ROW_COUNT;

  UPDATE "GalleryImage"
     SET "imageUrl" = substring("imageUrl" from length(old_origin) + 1)
   WHERE "imageUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_gal = ROW_COUNT;

  UPDATE "Faculty"
     SET "photoUrl" = substring("photoUrl" from length(old_origin) + 1)
   WHERE "photoUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_fac = ROW_COUNT;

  UPDATE "News"
     SET "imageUrl" = substring("imageUrl" from length(old_origin) + 1)
   WHERE "imageUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_news = ROW_COUNT;

  UPDATE "Event"
     SET "imageUrl" = substring("imageUrl" from length(old_origin) + 1)
   WHERE "imageUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_event = ROW_COUNT;

  UPDATE "ExamNotification"
     SET "buttonUrl" = substring("buttonUrl" from length(old_origin) + 1)
   WHERE "buttonUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_exam = ROW_COUNT;

  UPDATE "Placement"
     SET "companyLogoUrl" = substring("companyLogoUrl" from length(old_origin) + 1)
   WHERE "companyLogoUrl" LIKE old_origin || '/%';
  GET DIAGNOSTICS n_place = ROW_COUNT;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Downloads   : %', n_down;
  RAISE NOTICE 'Gallery     : %', n_gal;
  RAISE NOTICE 'Faculty     : %', n_fac;
  RAISE NOTICE 'News        : %', n_news;
  RAISE NOTICE 'Events      : %', n_event;
  RAISE NOTICE 'Exam notices: %', n_exam;
  RAISE NOTICE 'Placements  : %', n_place;
  RAISE NOTICE 'TOTAL       : %', n_down + n_gal + n_fac + n_news + n_event + n_exam + n_place;
  RAISE NOTICE '----------------------------------------';

END $$;

COMMIT;
