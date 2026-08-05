--
-- Bus routes only.
--
-- Everything else in deploy-data.sql is already applied on the VPS (MCA
-- retired, the 8 contact records, the 6 disclosure documents), so this carries
-- just the part that is still missing. Kept separate deliberately: the
-- programmes section of the full script would add 12 rows on top of the 25
-- already there, several of which are duplicates of each other, and that is a
-- data-cleanup decision rather than a deployment step.
--
-- The six real routes, as published on the college's own Transport page - not
-- the eight placeholders hardcoded in the repo, which named towns 120-200km
-- away and included two routes with no destination at all.
--
-- Idempotent: matched on (routeNo, fromPlace), guarded by NOT EXISTS. Nothing
-- is updated or deleted. A second run inserts nothing.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f deploy-routes-only.sql
--

BEGIN;

DO $$
DECLARE
  n_routes integer := 0;
BEGIN

  INSERT INTO "TransportRoute"
    ("routeNo", "fromPlace", via, "departTime", "returnTime", fee,
     "sortOrder", "isActive", "createdAt", "updatedAt")
  SELECT v.no, v.frm, v.via, v.dep, v.ret, v.fee, v.sort, true, now(), now()
  FROM (VALUES
      ('R1','All points of Kadapa','Connected to all points from Kadapa','7:30 AM','5:30 PM','Rs 3,000/month',0),
      ('R2','Pulivendula','Pulivendula -> Vempalli -> KSRMCE Gate','7:00 AM','6:00 PM','Rs 2,500/month',1),
      ('R3','Proddatur','Proddatur -> Mydukur -> KSRMCE Gate','6:30 AM','5:00 PM','Rs 4,000/month',2),
      ('R4','Badvel','Badvel -> Ontimitta -> KSRMCE Gate','6:00 AM','4:30 PM','Rs 4,500/month',3),
      ('R5','Rayachoti','Rayachoti -> Kadapa -> KSRMCE Gate','7:15 AM','5:45 PM','Rs 3,500/month',4),
      ('R6','Yerraguntla','Yerraguntla -> Kamalapuram -> KSRMCE Gate','6:45 AM','5:15 PM','Rs 3,800/month',5)
    ) AS v(no, frm, via, dep, ret, fee, sort)
  WHERE NOT EXISTS (
    SELECT 1 FROM "TransportRoute" t
     WHERE t."routeNo" = v.no AND t."fromPlace" = v.frm
  );
  GET DIAGNOSTICS n_routes = ROW_COUNT;

  RAISE NOTICE '-----------------------------';
  RAISE NOTICE 'Bus routes added : %', n_routes;
  RAISE NOTICE '-----------------------------';

END $$;

COMMIT;
