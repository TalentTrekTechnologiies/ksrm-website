-- Global "faculty display mode" switch, read by the public department pages
-- via GET /site-settings/public. One SiteSetting row so the admin Site Settings
-- page has something to toggle (its saveGroup only UPDATEs existing rows, never
-- creates them). Default 'true' preserves the current behaviour (photo cards);
-- 'false' renders a compact faculty data list across ALL departments at once,
-- so an admin flips one switch instead of a per-department toggle each.
INSERT INTO "SiteSetting" ("key", "value", "type", "group", "isPublic", "description", "createdAt", "updatedAt")
VALUES (
  'faculty_show_photos',
  'true',
  'BOOLEAN'::"SiteSettingType",
  'appearance',
  true,
  'When ON, department pages show faculty as photo cards. When OFF, every department shows a compact faculty data list (no photos).',
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO NOTHING;
