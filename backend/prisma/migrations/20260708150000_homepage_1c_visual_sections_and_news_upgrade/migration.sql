BEGIN;

-- ===== Schema changes (Sprint 1C) =====

-- CampusVideo.badgeLabel - nullable, replaces the previous by-array-position
-- badge text in the hardcoded component (silently mislabeled videos on reorder).
ALTER TABLE "CampusVideo" ADD COLUMN     "badgeLabel" TEXT;

-- News.isFeatured - lets the homepage's Latest News section prioritize
-- hand-picked stories instead of always showing just the N most recent.
ALTER TABLE "News" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- ===== Seed: Testimonial (from frontend/data/home.ts's `testimonials`) =====
-- `role` holds the degree/graduation-year string already shown on the public
-- site ("B.Tech CSE 2023") - the DTO/UI label it as "Designation" for
-- flexibility, but the current content is degree info.

INSERT INTO "Testimonial" ("name", "role", "company", "quote", "rating", "sortOrder", "isActive", "updatedAt")
VALUES
  ('Rahul Sharma', 'B.Tech CSE 2023', 'TCS', 'KSRMCE gave me not just a degree but the skills and confidence to excel in the software industry.', 5, 0, true, CURRENT_TIMESTAMP),
  ('Priya Reddy', 'B.Tech ECE 2022', 'Infosys', 'The labs and infrastructure at KSRMCE are top-notch. I learned hands-on skills that directly helped me in my career.', 5, 1, true, CURRENT_TIMESTAMP),
  ('Venkat Krishna', 'B.Tech MECH 2023', 'L&T', 'From day one, the college focused on our overall development. The placement cell worked tirelessly for us.', 5, 2, true, CURRENT_TIMESTAMP);

-- ===== Seed: CampusVideo (from `campusVideosData`, badges from the
-- hardcoded `videoBadges` array in CampusVideos.tsx) =====

INSERT INTO "CampusVideo" ("title", "youtubeUrl", "badgeLabel", "sortOrder", "isActive", "updatedAt")
VALUES
  ('Campus Tour', 'https://www.youtube.com/embed/opMcRto95Pg', 'Campus Tour', 0, true, CURRENT_TIMESTAMP),
  ('Official Ad', 'https://www.youtube.com/embed/faqh__a-PKI', 'Official', 1, true, CURRENT_TIMESTAMP),
  ('College Tour', 'https://www.youtube.com/embed/Si_PEgnmoG8', 'College Tour', 2, true, CURRENT_TIMESTAMP);

-- ===== Seed: AccreditationBadge (from Accreditation.tsx's hardcoded array)
-- `subtext` = the card's `sub` line, `imageUrl` required (all 4 have one) =====

INSERT INTO "AccreditationBadge" ("shortName", "grade", "name", "subtext", "linkUrl", "linkText", "imageUrl", "sortOrder", "isActive", "updatedAt")
VALUES
  ('NAAC', 'A++', 'NAAC Accredited', '3.60 CGPA', '/accreditation', 'View Certificate', '/naac.png', 0, true, CURRENT_TIMESTAMP),
  ('NBA', 'Tier-1', 'NBA Accredited', 'CE, ECE, CSE, EEE, ME', '/accreditation', 'View Programs', '/nba.png', 1, true, CURRENT_TIMESTAMP),
  ('NIRF', 'Ranked', 'NIRF India', 'Engineering Category', '/accreditation', 'View Ranking', '/nirf.jpg', 2, true, CURRENT_TIMESTAMP),
  ('UGC', 'Autonomous', 'UGC Status', 'Affiliated to JNTUA', '/accreditation', 'Learn More', '/ugc.webp', 3, true, CURRENT_TIMESTAMP);

-- ===== Seed: Recruiter (from `data/home.ts`'s `recruiters`, 17 rows) =====

INSERT INTO "Recruiter" ("name", "logoUrl", "sortOrder", "isActive", "updatedAt")
VALUES
  ('TCS', '/recruiters/tcs.jpg', 0, true, CURRENT_TIMESTAMP),
  ('Infosys', '/recruiters/infosys.jpg', 1, true, CURRENT_TIMESTAMP),
  ('Wipro', '/recruiters/wipro.jpg', 2, true, CURRENT_TIMESTAMP),
  ('Cognizant', '/recruiters/cognizant.jpg', 3, true, CURRENT_TIMESTAMP),
  ('Capgemini', '/recruiters/capegemini.jpg', 4, true, CURRENT_TIMESTAMP),
  ('HCL', '/recruiters/hcl.jpg', 5, true, CURRENT_TIMESTAMP),
  ('Mindtree', '/recruiters/mindtree.jpg', 6, true, CURRENT_TIMESTAMP),
  ('Mphasis', '/recruiters/mphasis.jpg', 7, true, CURRENT_TIMESTAMP),
  ('NTT Data', '/recruiters/ntt data.jpg', 8, true, CURRENT_TIMESTAMP),
  ('Hexaware', '/recruiters/hexaware.jpg', 9, true, CURRENT_TIMESTAMP),
  ('Birla Soft', '/recruiters/birla soft.jpg', 10, true, CURRENT_TIMESTAMP),
  ('Virtusa', '/recruiters/virtusa.jpg', 11, true, CURRENT_TIMESTAMP),
  ('Atos', '/recruiters/Atos.jpg', 12, true, CURRENT_TIMESTAMP),
  ('Zoho', '/recruiters/zoho.jpg', 13, true, CURRENT_TIMESTAMP),
  ('GND Solutions', '/recruiters/gnd solutions.jpg', 14, true, CURRENT_TIMESTAMP),
  ('Goldman Sachs', '/recruiters/goldsachs.jpg', 15, true, CURRENT_TIMESTAMP),
  ('Renault', '/recruiters/renault.jpg', 16, true, CURRENT_TIMESTAMP);

-- ===== Seed: ContentCard homepage department teasers (from
-- `data/home.ts`'s `departments`, 7 rows) - deliberately decoupled from the
-- real Department table (only 1/7 populated there; see Sprint 1C plan).
-- `tags` (Programs pills) is left empty - no fabricated program data. =====

INSERT INTO "ContentCard" ("section", "imageUrl", "title", "description", "tags", "linkUrl", "linkText", "sortOrder", "isActive", "updatedAt")
VALUES
  ('homepage_departments', '/posters/departments/cse.svg', 'Computer Science & Engineering', NULL, ARRAY[]::TEXT[], '/departments/cse', 'Explore', 0, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/ece.svg', 'Electronics & Communication Engineering', NULL, ARRAY[]::TEXT[], '/departments/ece', 'Explore', 1, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/eee.svg', 'Electrical & Electronics Engineering', NULL, ARRAY[]::TEXT[], '/departments/eee', 'Explore', 2, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/mech.svg', 'Mechanical Engineering', NULL, ARRAY[]::TEXT[], '/departments/mech', 'Explore', 3, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/civil.svg', 'Civil Engineering', NULL, ARRAY[]::TEXT[], '/departments/civil', 'Explore', 4, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/hs.svg', 'Humanities & Sciences', NULL, ARRAY[]::TEXT[], '/departments/hs', 'Explore', 5, true, CURRENT_TIMESTAMP),
  ('homepage_departments', '/posters/departments/mba.svg', 'Management Studies', NULL, ARRAY[]::TEXT[], '/departments/mba', 'Explore', 6, true, CURRENT_TIMESTAMP);

-- ===== Seed: SiteSetting-backed section visibility flags (Sprint 1C's 6
-- new sections only - see feedback_section_visibility memory for why 1A/1B
-- sections aren't retrofitted here). All default to visible so nothing on
-- the live site changes as a result of this migration. =====

INSERT INTO "SiteSetting" ("key", "value", "type", "group", "isPublic", "description", "updatedAt")
VALUES
  ('homepage.visibility.testimonials', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Testimonials section on the public homepage.', CURRENT_TIMESTAMP),
  ('homepage.visibility.campusVideos', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Campus Videos section on the public homepage.', CURRENT_TIMESTAMP),
  ('homepage.visibility.accreditation', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Accreditation section on the public homepage.', CURRENT_TIMESTAMP),
  ('homepage.visibility.recruiters', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Recruiters marquee on the public homepage.', CURRENT_TIMESTAMP),
  ('homepage.visibility.departments', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Departments section on the public homepage.', CURRENT_TIMESTAMP),
  ('homepage.visibility.latestNews', 'true', 'BOOLEAN', 'homepage_visibility', true, 'Show/hide the Latest News section on the public homepage.', CURRENT_TIMESTAMP);

COMMIT;
