import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SYSTEM_ADMIN_EMAIL } from '../src/common/system-admin.constant';
import {
  MEDIA_SIZE_SETTING_KEYS,
  MEDIA_SIZE_DEFAULTS_BYTES,
} from '../src/media/constants/media-type-map';

const prisma = new PrismaClient();

// -----------------------------------------------------------------------------
// Permission catalog - module.action granularity (not role names). Every
// permission is scoped to exactly one module and one CRUD-level action;
// nothing here ever grants access based on a role's *name* - only an
// admin's actual, individually-checked permission set decides what they can
// do (see DATA_MODEL_DESIGN.md's Authorization Principles section).
//
// The `module.action` convention is deliberately flat and string-keyed so it
// can extend later without a schema change: a future page-level permission
// is just a new key like `pages.homepage.update`, and a future field-level
// permission is just `faculty.update.email` - both fit the existing
// Permission.key column (a plain unique String) with no migration needed.
// -----------------------------------------------------------------------------

const CRUD_ACTIONS = ['view', 'create', 'update', 'delete'] as const;

// Every module gets the full view/create/update/delete set, plus 'restore'
// bringing each module up to the same soft-delete/restore pattern every CMS
// module now uses - CRUD_ACTIONS alone has no restore action. (site_settings
// is the deliberate exception: SiteSetting has no soft-delete columns by
// design - system config, not content - so it keeps plain CRUD_ACTIONS.)
const MODULE_ACTIONS: Record<string, readonly string[]> = {
  faculty: [...CRUD_ACTIONS, 'restore'],
  departments: [...CRUD_ACTIONS, 'restore'],
  news: [...CRUD_ACTIONS, 'restore'],
  gallery: [...CRUD_ACTIONS, 'restore'],
  placements: [...CRUD_ACTIONS, 'restore'],
  exam_notifications: CRUD_ACTIONS,
  research: CRUD_ACTIONS,
  downloads: [...CRUD_ACTIONS, 'restore'],
  committees: [...CRUD_ACTIONS, 'restore'],
  careers: [...CRUD_ACTIONS, 'restore'],
  events: [...CRUD_ACTIONS, 'restore'],
  // Media Library. Force-deleting a still-referenced asset is deliberately
  // NOT its own permission key - it's gated purely by Admin.isSuperAdmin in
  // MediaService, the same pattern admins/roles already use for their most
  // privilege-sensitive actions.
  media: [...CRUD_ACTIONS, 'restore'],
  site_settings: CRUD_ACTIONS,
  // page_content bundles every page-driven marketing/institutional content
  // type added in the page-content audit: PageBanner, SiteStatistic,
  // Testimonial, CampusVideo, AccreditationBadge, Recruiter, Faq,
  // LeadershipProfile, ContentCard - one permission module, matching how
  // "departments" already bundles five related tables.
  page_content: CRUD_ACTIONS,
  // Kept separate from site_settings/page_content: contact office directory
  // entries are repeating rows (Principal/Admissions/Exam/Placement/Main),
  // not singular config values - see DATA_MODEL_DESIGN.md's ContactChannel
  // vs SiteSetting note. Department CMS phase reuses the same table
  // (departmentId: null = global directory, set = a department's Contact
  // Information tab) rather than a second permission module.
  contact: [...CRUD_ACTIONS, 'restore'],
  // Admin-account management and RBAC self-management (roles/permission
  // assignment) are deliberately kept out of every seeded role below
  // except Super Admin - see the ROLES list.
  admins: [...CRUD_ACTIONS, 'restore'],
  roles: CRUD_ACTIONS,
  // Homepage CMS (Sprint 1A) - a deliberately non-CRUD action set, matching
  // the explicit spec for this module rather than the flat CRUD_ACTIONS
  // every other module uses. `publish`/`preview` are seeded now even though
  // Sprint 1A's routes don't exercise them yet (full publish/schedule
  // workflow lands in Sprint 1D) - avoids a second permission migration
  // later. `seo.edit` is checked separately from `edit` on the future SEO
  // sub-resource (Sprint 1D), kept in the catalog now for the same reason.
  homepage: [
    'view',
    'edit',
    'publish',
    'delete',
    'restore',
    'preview',
    'seo.edit',
  ],
  // Department CMS phase - each department content type is its own module
  // (matching the fine-grained per-content-type pattern used everywhere
  // else in this catalog, e.g. faculty/news/gallery are separate modules
  // too) rather than bundling all of them under `departments`, even though
  // every department is served by the same reusable engine/code.
  labs: [...CRUD_ACTIONS, 'restore'],
  learning_outcomes: [...CRUD_ACTIONS, 'restore'],
  department_programmes: [...CRUD_ACTIONS, 'restore'],
  transport_routes: [...CRUD_ACTIONS, 'restore'],
  kgcet: ['view', 'create', 'update', 'delete', 'restore'],
  department_highlights: [...CRUD_ACTIONS, 'restore'],
  // No create/delete/restore: display settings are toggles on a fixed,
  // code-defined catalog (see DEPARTMENT_DISPLAY_SETTINGS_CATALOG), not
  // records an admin creates or removes.
  department_display_settings: ['view', 'update'],
  // Careers Application Pipeline. No 'create' - applications arrive from
  // the public submission form, not an admin action. No 'delete'/'restore'
  // - a compliance-adjacent HR record corrected by status transition,
  // never deleted.
  career_applications: ['view', 'update', 'export'],
  // Centralized Announcement & Ticker Engine.
  announcements: [...CRUD_ACTIONS, 'restore'],
};

const MODULE_LABELS: Record<string, string> = {
  faculty: 'faculty directory entries',
  departments: 'department profiles',
  news: 'news posts',
  gallery: 'gallery images',
  placements: 'placement records',
  exam_notifications: 'exam notifications',
  research: 'research publication records',
  downloads: 'downloadable documents',
  committees: 'committees and committee membership rosters',
  careers: 'job openings on the public Careers page',
  events: 'campus events calendar entries',
  media: 'the centralized Media Library (images, videos, documents)',
  site_settings:
    'global site configuration (social links, SEO defaults, footer data)',
  page_content:
    'page banners, site statistics, testimonials, campus videos, accreditation badges, recruiters, FAQs, leadership profiles, and generic content cards',
  contact:
    'contact office directory entries (global directory and department Contact Information tabs)',
  admins: 'admin accounts',
  roles: 'roles and their permission assignments (RBAC self-management)',
  homepage:
    'the public homepage - hero banner, statistics, and quick links (Sprint 1A)',
  labs: 'department laboratory records',
  learning_outcomes: 'department PEO/PO/PSO learning outcome records',
  department_programmes: 'department academic programme records',
  transport_routes: 'college bus routes, timings and crew',
  kgcet: 'KGCET participation figures and highlight cards',
  department_highlights: 'department highlight and achievement records',
  department_display_settings: 'department page section visibility toggles',
  career_applications: 'job applications submitted through the Careers page',
  announcements:
    'centralized announcements shown as tickers/banners across the header, hero, homepage, department, admissions, and placements pages',
};

// A plain Record<string, string> (not keyed to CRUD_ACTIONS) so non-CRUD
// modules like `homepage` can contribute their own action verbs here.
const ACTION_VERBS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  edit: 'Edit',
  publish: 'Publish',
  restore: 'Restore',
  preview: 'Preview draft/unpublished',
  'seo.edit': 'Edit SEO settings for',
  export: 'Export',
};

const PERMISSIONS: { key: string; description: string }[] = Object.entries(
  MODULE_ACTIONS,
).flatMap(([module, actions]) =>
  actions.map((action) => ({
    key: `${module}.${action}`,
    description: `${ACTION_VERBS[action]} ${MODULE_LABELS[module]}`,
  })),
);

const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

function permissionsFor(...modules: string[]): string[] {
  return ALL_PERMISSION_KEYS.filter((key) =>
    modules.some((module) => key.startsWith(`${module}.`)),
  );
}

function viewOnlyPermissions(): string[] {
  return ALL_PERMISSION_KEYS.filter((key) => key.endsWith('.view'));
}

// Every content module except admins/roles themselves - i.e. everything a
// "CMS Administrator" should touch, but not admin-account or RBAC management.
const CONTENT_MODULES = Object.keys(MODULE_ACTIONS).filter(
  (m) => m !== 'admins' && m !== 'roles',
);

// Proposed default role -> permission mapping. This is a starting point for
// review, not a claim that it exactly matches every real-world admin's
// current responsibilities - see DATA_MODEL_DESIGN.md §6 for the reasoning
// and the explicit note that existing admins are NOT assigned any of these
// roles by this script (that's a separate, later, reviewed data migration).
//
// Deliberately, only "Super Admin" is ever given any `admins.*`/`roles.*`
// permission below - admin-account management and RBAC self-management
// (creating roles, changing what a role grants) are the two most
// privilege-sensitive actions in the whole system, and granting either to
// a non-Super-Admin role would let that role holder escalate their own
// access. If a real need for a narrower "can manage other admins but isn't
// Super Admin" role emerges, that's a deliberate future addition, not a
// default.
const ROLES: {
  name: string;
  description: string;
  isSystemRole: boolean;
  permissionKeys: string[];
}[] = [
  {
    name: 'Super Admin',
    description:
      'Full system access, including RBAC self-management (creating roles, assigning permissions to roles, assigning roles to admins). In practice, the authorization bypass is enforced via Admin.isSuperAdmin, not this role - it exists so "Super Admin" appears as a real, selectable entry in admin-management screens, and so its full permission set is visible/auditable like any other role.',
    isSystemRole: true,
    permissionKeys: ALL_PERMISSION_KEYS,
  },
  {
    name: 'CMS Administrator',
    description:
      'Full content management (view/create/update/delete) across every content module, excluding admin-account management and RBAC self-management.',
    isSystemRole: true,
    permissionKeys: permissionsFor(...CONTENT_MODULES),
  },
  {
    name: 'Department Administrator',
    description:
      'Full department-content and faculty management (profile, faculty, labs, learning outcomes, programmes, highlights/achievements, research, contact information, and display settings), typically scoped to their own department via Admin.departmentId (scoping enforced in application code, not by this role alone).',
    isSystemRole: true,
    permissionKeys: permissionsFor(
      'departments',
      'faculty',
      'labs',
      'learning_outcomes',
      'department_programmes',
      'transport_routes',
      'department_highlights',
      'department_display_settings',
      'research',
      'contact',
    ),
  },
  {
    name: 'Department Editor',
    description:
      'Edits department profile content (about/vision/labs/outcomes/programmes/highlights/research/display settings) but not the faculty roster or the contact office directory.',
    isSystemRole: true,
    permissionKeys: permissionsFor(
      'departments',
      'labs',
      'learning_outcomes',
      'department_programmes',
      'department_highlights',
      'department_display_settings',
      'research',
    ),
  },
  {
    name: 'Faculty Manager',
    description:
      'Institution-wide faculty directory management, not tied to one department.',
    isSystemRole: true,
    permissionKeys: permissionsFor('faculty'),
  },
  {
    name: 'Placements Officer',
    description: 'Manages placement records.',
    isSystemRole: true,
    permissionKeys: permissionsFor('placements'),
  },
  {
    name: 'Examination Cell',
    description: 'Manages exam notifications.',
    isSystemRole: true,
    permissionKeys: permissionsFor('exam_notifications'),
  },
  {
    name: 'Content Editor',
    description:
      'General content and communications: news, gallery, announcements, page-driven marketing content (banners, statistics, testimonials, videos, FAQs, leadership profiles), and the public homepage. Does not include the contact office directory, which is kept more restricted.',
    isSystemRole: true,
    permissionKeys: permissionsFor(
      'news',
      'gallery',
      'announcements',
      'page_content',
      'homepage',
    ),
  },
  {
    name: 'Viewer',
    description:
      'Read-only across every module, including admin-panel views the public site does not expose (e.g. unpublished/draft content). No create/update/delete permissions, and no admin-account or RBAC visibility beyond what "view" grants elsewhere.',
    isSystemRole: true,
    permissionKeys: viewOnlyPermissions(),
  },
];

// Site Settings scope, per explicit user direction: "only global
// configuration" - College Name / Logo / Favicon / Theme / SEO Defaults /
// Footer / Social Links / Upload Limits / Email Configuration /
// Announcement Settings / Media Settings, nothing else. Upload limits reuse
// MediaSettingsService's own key/default constants so there's exactly one
// source of truth for those three rows. Email Configuration is seeded as a
// read-only *pointer* (isPublic: false, admin-only), not an editable
// duplicate of SMTP/SES credentials - those stay in environment variables
// for security, this row just makes that discoverable from Site Settings.
interface SiteSettingSeed {
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'URL' | 'EMAIL' | 'IMAGE_URL';
  group: string;
  isPublic: boolean;
  description: string;
}

const SITE_SETTINGS_SEED: SiteSettingSeed[] = [
  // Branding
  { key: 'site.collegeName', value: 'K.S.R.M College of Engineering', type: 'STRING', group: 'branding', isPublic: true, description: 'Official college name shown in the header and page titles.' },
  { key: 'site.logoUrl', value: '/header.png', type: 'IMAGE_URL', group: 'branding', isPublic: true, description: 'Header logo. Replace via the Media Library to update it site-wide without a code change.' },
  { key: 'site.faviconUrl', value: '/favicon.ico', type: 'IMAGE_URL', group: 'branding', isPublic: true, description: 'Browser tab icon.' },
  { key: 'site.collegeMotto', value: 'Lighted to Lighten', type: 'STRING', group: 'branding', isPublic: true, description: 'College motto/tagline.' },
  // Theme
  // Removed: site.themePrimaryColor / site.themeAccentColor. The public
  // palette is authored directly in the components, so these settings never
  // affected anything - they were a control that silently did nothing.
  // Footer
  { key: 'site.footerCopyright', value: `© ${new Date().getFullYear()} K.S.R.M College of Engineering. All rights reserved.`, type: 'STRING', group: 'footer', isPublic: true, description: 'Copyright line shown in the site footer.' },
  // Contact Information (the single "official college contact" - distinct
  // from the detailed ContactChannel office directory, which lists several
  // named offices with their own numbers; these are the one general set
  // shown in places like the footer).
  { key: 'site.contactEmail', value: '', type: 'EMAIL', group: 'contact', isPublic: true, description: 'General college contact email.' },
  { key: 'site.contactPhone', value: '', type: 'STRING', group: 'contact', isPublic: true, description: 'General college contact phone number.' },
  { key: 'site.contactAddress', value: '', type: 'STRING', group: 'contact', isPublic: true, description: 'Postal address.' },
  { key: 'site.googleMapsEmbedUrl', value: '', type: 'URL', group: 'contact', isPublic: true, description: 'Google Maps embed URL for the campus location.' },
  // Social Links
  { key: 'site.socialFacebook', value: '', type: 'URL', group: 'social', isPublic: true, description: 'Facebook page URL (leave blank to hide the icon).' },
  { key: 'site.socialTwitter', value: '', type: 'URL', group: 'social', isPublic: true, description: 'Twitter/X profile URL (leave blank to hide the icon).' },
  { key: 'site.socialInstagram', value: '', type: 'URL', group: 'social', isPublic: true, description: 'Instagram profile URL (leave blank to hide the icon).' },
  { key: 'site.socialYoutube', value: '', type: 'URL', group: 'social', isPublic: true, description: 'YouTube channel URL (leave blank to hide the icon).' },
  { key: 'site.socialLinkedin', value: '', type: 'URL', group: 'social', isPublic: true, description: 'LinkedIn page URL (leave blank to hide the icon).' },
  // Announcement Settings
  { key: 'site.announcementHeaderTickerEnabled', value: 'true', type: 'BOOLEAN', group: 'announcements', isPublic: true, description: 'Global on/off for the header announcement ticker, independent of individual announcements\' own placements.' },
  { key: 'site.announcementHeroTickerEnabled', value: 'true', type: 'BOOLEAN', group: 'announcements', isPublic: true, description: 'Global on/off for the hero banner announcement ticker.' },
  { key: 'site.announcementTickerSpeedSeconds', value: '40', type: 'NUMBER', group: 'announcements', isPublic: true, description: 'Scroll speed (seconds per loop) for every announcement ticker site-wide.' },
  { key: 'site.announcementPauseOnHover', value: 'true', type: 'BOOLEAN', group: 'announcements', isPublic: true, description: 'Pause ticker scrolling while the visitor hovers over it.' },
  { key: 'site.announcementMaxVisible', value: '10', type: 'NUMBER', group: 'announcements', isPublic: true, description: 'Maximum number of announcements shown in one ticker loop.' },
  // Media Settings / Upload Limits
  // (the 3 max-size rows are seeded separately below, group "media", reusing
  // MediaSettingsService's own keys/defaults as the one source of truth)
  // Email Configuration (read-only pointer, not editable credentials)
  { key: 'site.emailConfigInfo', value: 'Configured via the EMAIL_PROVIDER environment variable (console / smtp / ses). See backend/.env.example. Not editable here for security - credentials never live in the database.', type: 'STRING', group: 'email', isPublic: false, description: 'Where email sending is actually configured.' },
  { key: 'site.hrEmail', value: '', type: 'EMAIL', group: 'email', isPublic: false, description: 'HR email address that receives Career Application notifications.' },
  // SEO Defaults
  { key: 'site.seoDefaultTitle', value: 'K.S.R.M College of Engineering, Kadapa', type: 'STRING', group: 'seo', isPublic: true, description: 'Fallback <title> for pages that don\'t set their own.' },
  { key: 'site.seoDefaultDescription', value: 'KSRM College of Engineering, Kadapa — UGC Autonomous, NAAC A++ accredited, NBA Tier-1, affiliated to JNTUA.', type: 'STRING', group: 'seo', isPublic: true, description: 'Fallback meta description for pages that don\'t set their own.' },
  { key: 'site.seoKeywords', value: 'KSRM, engineering college, Kadapa, JNTUA, NAAC, NBA', type: 'STRING', group: 'seo', isPublic: true, description: 'Comma-separated fallback meta keywords.' },
  { key: 'site.seoOgImageUrl', value: '', type: 'IMAGE_URL', group: 'seo', isPublic: true, description: 'Default social-share preview image (Open Graph).' },
  { key: 'site.headerFlowerShower', value: 'true', type: 'BOOLEAN', group: 'branding', isPublic: true, description: 'Show the falling-flower animation over the founder portrait in the header. Only applies to the built-in header banner.' },
  // Popup Notice - a dismissible poster modal shown on the homepage (e.g. to
  // highlight an event / placement drive). CMS-driven so it can be turned on,
  // swapped, and turned off per event with no code change.
  { key: 'site.popupEnabled', value: 'false', type: 'BOOLEAN', group: 'popup', isPublic: true, description: 'Show the homepage popup notice. Turn on only while an event is running.' },
  { key: 'site.popupImageUrl', value: '', type: 'IMAGE_URL', group: 'popup', isPublic: true, description: 'Poster image for the popup (upload via the Media Library). Nothing shows if this is empty.' },
  { key: 'site.popupLinkUrl', value: '', type: 'URL', group: 'popup', isPublic: true, description: 'Optional link the poster opens when clicked (e.g. the placements page). Leave blank for no link.' },
  { key: 'site.popupTitle', value: '', type: 'STRING', group: 'popup', isPublic: true, description: 'Short caption / image alt text for the popup (accessibility).' },
  // System
  { key: 'site.maintenanceMode', value: 'false', type: 'BOOLEAN', group: 'system', isPublic: true, description: 'When on, the public site should show a maintenance notice. (Display of the notice itself is a frontend concern - this is the flag.)' },
];

async function seedSiteSettings() {
  for (const setting of SITE_SETTINGS_SEED) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  // Upload limits (group "media") - MediaSettingsService.ensureDefaultSettingsSeeded()
  // does the exact same upsert but was never actually called from anywhere,
  // so these rows never existed until an admin manually created them with
  // the right keys. Reusing its own constants here instead of duplicating
  // the numbers keeps MediaSettingsService as the one source of truth.
  const mediaTypes = Object.keys(MEDIA_SIZE_SETTING_KEYS) as (keyof typeof MEDIA_SIZE_SETTING_KEYS)[];
  for (const type of mediaTypes) {
    const key = MEDIA_SIZE_SETTING_KEYS[type];
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: {
        key,
        value: String(MEDIA_SIZE_DEFAULTS_BYTES[type]),
        type: 'NUMBER',
        group: 'media',
        isPublic: false,
        description: `Maximum upload size (bytes) for ${type.toLowerCase()} files in the Media Library.`,
      },
    });
  }
}

async function seedPermissions() {
  const permissionsByKey = new Map<string, { id: number }>();
  for (const permission of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
    permissionsByKey.set(permission.key, row);
  }
  return permissionsByKey;
}

async function seedRoles(permissionsByKey: Map<string, { id: number }>) {
  for (const role of ROLES) {
    const roleRow = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        isSystemRole: role.isSystemRole,
      },
      create: {
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
      },
    });

    for (const key of role.permissionKeys) {
      const permission = permissionsByKey.get(key);
      if (!permission) {
        throw new Error(
          `Role "${role.name}" references unknown permission key "${key}"`,
        );
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleRow.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: { roleId: roleRow.id, permissionId: permission.id },
      });
    }
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin
  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@ksrm.edu' },
    update: {},
    create: {
      email: 'superadmin@ksrm.edu',
      password: hashedPassword,
      name: 'Super Administrator',
      isSuperAdmin: true,
      permissions: [], // Super admin has all permissions
      isActive: true,
    },
  });

  console.log('✅ Super admin created:', superAdmin);
  console.log('\n📝 Login credentials:');
  console.log('   Email: superadmin@ksrm.edu');
  console.log('   Password: SuperAdmin@123');
  console.log('\n⚠️  Please change the password after first login!');

  // Service-account admin for actions the public triggers with no real
  // admin session (e.g. a job applicant's resume upload) but that still
  // need an Admin FK for Media/AuditLog attribution. isActive: false and a
  // random unusable password hash - this account can never log in through
  // the normal auth flow (JwtStrategy/AuthService both reject !isActive).
  const systemAdminPassword = await bcrypt.hash(
    `system-account-${Math.random().toString(36).slice(2)}`,
    10,
  );
  await prisma.admin.upsert({
    where: { email: SYSTEM_ADMIN_EMAIL },
    update: {},
    create: {
      email: SYSTEM_ADMIN_EMAIL,
      password: systemAdminPassword,
      name: 'System (Public Submissions)',
      isSuperAdmin: false,
      permissions: [],
      isActive: false,
    },
  });
  console.log('✅ System service-account admin created (isActive: false)');

  // Seed the RBAC catalog (Permission/Role/RolePermission). This does NOT
  // assign any role to the existing super admin or any other admin - role
  // assignment for existing accounts is an explicit, separate, reviewed
  // data migration (DATA_MODEL_DESIGN.md §9 Phase 5), not part of this
  // additive seed.
  console.log('\n🌱 Seeding RBAC catalog (permissions + system roles)...');
  const permissionsByKey = await seedPermissions();
  await seedRoles(permissionsByKey);
  console.log(
    `✅ Seeded ${PERMISSIONS.length} permissions and ${ROLES.length} system roles`,
  );

  console.log('\n🌱 Seeding Site Settings (global configuration)...');
  await seedSiteSettings();
  console.log(
    `✅ Seeded ${SITE_SETTINGS_SEED.length + Object.keys(MEDIA_SIZE_SETTING_KEYS).length} site settings`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
