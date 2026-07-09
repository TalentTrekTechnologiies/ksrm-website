-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_key_key" ON "HomepageSection"("key");

-- CreateIndex
CREATE INDEX "HomepageSection_status_idx" ON "HomepageSection"("status");

-- CreateIndex
CREATE INDEX "HomepageSection_deletedAt_idx" ON "HomepageSection"("deletedAt");

-- AddForeignKey
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed data: the 4 Sprint 1B sections, seeded with the exact content that
-- was previously hardcoded in VisionMissionTabs.tsx/AboutPreview.tsx/
-- Admissions.tsx, so the public site is byte-identical immediately after
-- this migration rather than empty until an admin edits something.
INSERT INTO "HomepageSection" ("key", "content", "status", "sortOrder", "updatedAt") VALUES
('vision', '{
  "eyebrow": "Who We Are",
  "heading": "Our Vision & Mission",
  "label": "Our Vision",
  "text": "To evolve as center of repute for providing quality academic programs amalgamated with creative learning and research excellence to produce graduates with leadership qualities, ethical and human values to serve the nation."
}'::jsonb, 'PUBLISHED', 0, CURRENT_TIMESTAMP),

('mission', '{
  "label": "Our Mission",
  "missions": [
    {"code": "M1", "text": "To provide high quality education with enriched curriculum blended with impactful teaching-learning practices."},
    {"code": "M2", "text": "To promote research, entrepreneurship and innovation through industry collaborations."},
    {"code": "M3", "text": "To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation."}
  ]
}'::jsonb, 'PUBLISHED', 1, CURRENT_TIMESTAMP),

('about', '{
  "eyebrow": "OUR LEGACY",
  "title": "Four Decades of Engineering Excellence",
  "subtitle": null,
  "paragraphs": [
    "Established in 1980 in memory of Late Sri Srinivasa Reddy, KSRM College of Engineering was born from the vision of Late Sri Kandula Obul Reddy to bring quality technical education to the Rayalaseema region of Andhra Pradesh.",
    "Today, as a UGC Autonomous institution affiliated to JNTUA, we continue that legacy — shaping engineers, innovators, and leaders who carry our values into the world."
  ],
  "highlights": [],
  "statistics": [
    {"num": "1980", "label": "Established"},
    {"num": "7+", "label": "Departments"},
    {"num": "UGC", "label": "Autonomous"}
  ],
  "foundingYear": 1980,
  "image": {"url": "/topview (1).jpg", "alt": "KSRM Campus", "caption": "Aerial View of KSRM College Campus"},
  "badgeLabel": "YEARS OF TRUST",
  "cta": {"text": "Read Our Story →", "href": "/about"}
}'::jsonb, 'PUBLISHED', 2, CURRENT_TIMESTAMP),

('admissions', '{
  "badge": "ADMISSIONS 2025-26",
  "heading": "Begin Your Engineering Journey",
  "subtitle": "EAPCET Code: KSRM | Kadapa, Andhra Pradesh",
  "helplinePhones": [
    {"display": "+91-9000073434", "href": "tel:+919000073434"},
    {"display": "+91-8143731980", "href": "tel:+918143731980"}
  ],
  "helplineEmail": "ksrmcengg@yahoo.co.in"
}'::jsonb, 'PUBLISHED', 3, CURRENT_TIMESTAMP);

-- Seed data: the 2 admission program cards, reusing the existing ContentCard
-- table (section='homepage_admission_programs') exactly as it was already
-- designed for in Phase 1B ("branch-code pills on the homepage's admission
-- program cards" - see ContentCard's own doc comment).
INSERT INTO "ContentCard" ("section", "icon", "imageUrl", "title", "description", "tags", "linkUrl", "linkText", "sortOrder", "isActive", "updatedAt") VALUES
('homepage_admission_programs', 'B.Tech Programmes', '/b-tech-banner.png', 'B.Tech Engineering', '750+ Seats | 8 Branches | 4 Years', ARRAY['CSE','ECE','EEE','CIVIL','MECH','AI&ML','DS','AIML'], '/b-tech-banner.png', 'View Brochure ↗', 0, true, CURRENT_TIMESTAMP),
('homepage_admission_programs', 'Diploma / Polytechnic', '/diploma-banner.png', 'Diploma Programmes', 'Lateral Entry Available | 3 Years | EAPCET Eligible', ARRAY['Civil','Mechanical','ECE','EEE','CSE'], '/Diploma-Brochure-KSRMCE (1).pdf', '📥 Download Brochure', 1, true, CURRENT_TIMESTAMP);
