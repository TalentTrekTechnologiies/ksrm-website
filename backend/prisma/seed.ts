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

// Page ownership: a role owns the pages that belong to it, rather than every
// row of a module site-wide. Four models already carry the same dotted
// `pageSection` string - GalleryImage, Download, PageTable and PageText -
// which together are every piece of page-driven content in the CMS. Its root
// ("examinations.timetables" -> "examinations") IS the grouping key, so page
// ownership needs no new column and no new table: it is exactly the
// `pages.<page>` extension DATA_MODEL_DESIGN.md §3.16 promises fits the
// plain-String Permission.key column with no migration.
//
// Holding ANY pages.* key makes an admin page-restricted to those roots
// across all four models (enforced by PageSectionOwnershipGuard). Holding
// none leaves them unrestricted, so a Super Admin and the college-wide roles
// are unaffected. This is the module-level analogue of what
// Admin.departmentId + DepartmentOwnershipGuard already do for departments.
const PAGE_SECTION_ROOTS: Record<string, string> = {
  examinations: 'Examinations (calendars, notifications, time tables, results)',
  academics: 'Academics (calendar, courses & intake, fee structure, regulations)',
  syllabus: 'Syllabus',
  admissions: 'Admissions',
  iqac: 'IQAC',
  naac: 'NAAC',
  research: 'Research',
  library: 'Library',
  placements: 'Placements',
  alumni: 'Alumni',
  about: 'About Us',
  'campus-life': 'Campus Life',
  kgcet: 'KGCET',
};

const PERMISSIONS_WITH_SECTIONS = [
  ...PERMISSIONS,
  ...Object.entries(PAGE_SECTION_ROOTS).map(([root, label]) => ({
    key: `pages.${root}`,
    description: `Limit page content (documents, images, tables, text) to the ${label} page`,
  })),
];

const ALL_PERMISSION_KEYS = PERMISSIONS_WITH_SECTIONS.map((p) => p.key);

function permissionsFor(...modules: string[]): string[] {
  return ALL_PERMISSION_KEYS.filter((key) =>
    modules.some((module) => key.startsWith(`${module}.`)),
  );
}

// Like permissionsFor, but for the cases where a role needs only *some* of a
// module's actions - e.g. a Department Administrator may view and update the
// department they own, but must never create or delete a department.
function actionsFor(module: string, ...actions: string[]): string[] {
  return actions.map((action) => {
    const key = `${module}.${action}`;
    if (!ALL_PERMISSION_KEYS.includes(key)) {
      throw new Error(`Unknown permission key "${key}" in actionsFor()`);
    }
    return key;
  });
}

// Uploading is not a module of its own: every image and document in the CMS
// is created through POST /media/upload, which requires media.create. A role
// without these three keys cannot add a faculty photo, a gallery image, or a
// PDF - it can only edit rows that already exist. Every role that creates
// content therefore needs them.
const MEDIA_UPLOAD = actionsFor('media', 'view', 'create', 'update');

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
  // ONE department role, not one per department. Which department an admin
  // may touch is data (Admin.departmentId), never a separate role - so the
  // same role serves all eleven Department rows: the nine academic
  // departments plus Examination Section and Central Library. This is why
  // there is no separate "Examination Cell" or "Librarian" role: the exam
  // officer is this role with departmentId = examination-section, and every
  // module below is then narrowed to that department by
  // DepartmentOwnershipGuard. Per DATA_MODEL_DESIGN.md §14.1, nothing
  // anywhere branches on this role's *name* - the guard reads
  // Admin.departmentId and the permission keys below, nothing else.
  //
  // The module list is derived from the Department Workspace's own tab list
  // (frontend DepartmentWorkspace.tsx TABS), so every tab an admin can see
  // is a tab they can actually use - the previous seeding predated that
  // screen and left seven of its sixteen tabs unreachable.
  {
    name: 'Department Administrator',
    description:
      "Manages one department's entire workspace - profile, faculty, programmes, labs, learning outcomes, highlights, research, gallery, events, documents, committees (Student Chapter / Board of Studies), contact information, exam notifications and display settings. Which department is set per admin account via Admin.departmentId; DepartmentOwnershipGuard then restricts every module below to that department's own records. Cannot create or delete departments, and cannot touch college-wide content.",
    isSystemRole: true,
    permissionKeys: [
      // The department's own profile row: editable, never creatable or
      // deletable - creating and removing departments stays with a Super
      // Admin.
      ...actionsFor('departments', 'view', 'update'),
      ...permissionsFor(
        'faculty',
        'labs',
        'learning_outcomes',
        'department_programmes',
        'department_highlights',
        'research',
        'gallery',
        'events',
        'downloads',
        'committees',
        'contact',
        'exam_notifications',
      ),
      // Toggles only - the catalog is code-defined, so there is nothing to
      // create or delete here.
      ...actionsFor('department_display_settings', 'view', 'update'),
      // The workspace's Videos and Statistics tabs gate on homepage.view.
      // View only: this must not become a way to edit the public homepage.
      ...actionsFor('homepage', 'view'),
      ...MEDIA_UPLOAD,
    ],
  },
  // The two college-wide roles below deliberately overlap with the
  // department role's modules (gallery, events, committees). That is not a
  // conflict, it is the point: these accounts leave Admin.departmentId null,
  // so DepartmentOwnershipGuard never narrows them and they see every row,
  // while a department admin holding the same permission key sees only their
  // own department's. Separating *what* (permissions) from *where*
  // (departmentId) is what keeps this at one department role instead of one
  // per department.
  {
    name: 'Gallery Manager',
    description:
      'Manages the photo and video gallery across the whole college, every department included. Leave Admin.departmentId unset for this role - setting it would restrict the account to a single department\'s gallery.',
    isSystemRole: true,
    permissionKeys: [...permissionsFor('gallery'), ...MEDIA_UPLOAD],
  },
  {
    name: 'Communications',
    description:
      'College-wide news, events, committees and the announcement ticker. Does not include the public homepage, page content or site settings, which stay with a Super Admin. Leave Admin.departmentId unset for this role.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('news', 'events', 'committees', 'announcements'),
      ...MEDIA_UPLOAD,
    ],
  },
  // The two page-owning roles. Both hold the same page-content modules as
  // each other and differ ONLY by which pages.* key they carry - that key is
  // what PageSectionOwnershipGuard reads to decide which rows they may touch.
  // Adding a third page owner (IQAC, NAAC, Admissions...) is one entry here
  // plus the matching pages.* key above; no new module, guard or column.
  {
    name: 'Examination',
    description:
      "Owns the Examinations pages: exam notifications, plus the documents, images, tables and text on Examinations → Academic Calendars / Notifications / Time Tables / Exam Results. The pages.examinations key restricts every one of those modules to that page's own rows - this role cannot touch IQAC, NAAC, Academics or any department's content.",
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('exam_notifications'),
      // downloads.* is the permission module behind all four page-content
      // models - Download, GalleryImage's page uploads, PageTable and
      // PageText all gate on it - so this one module plus the pages.* key
      // below is the whole Examinations page. Deliberately NOT page_content,
      // which is site-wide marketing content (banners, testimonials,
      // recruiters) and belongs to nobody scoped to a single page.
      ...permissionsFor('downloads', 'gallery'),
      'pages.examinations',
      ...MEDIA_UPLOAD,
    ],
  },
  {
    name: 'Academics',
    description:
      'Owns the Academics pages: the college-wide programme/course list, plus the documents, images, tables and text on Academics → Academic Calendar / Courses & Intake / Fee Structure / Regulations, and the Syllabus page. Restricted to those pages by the pages.academics and pages.syllabus keys.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('department_programmes'),
      ...permissionsFor('downloads', 'gallery'),
      'pages.academics',
      'pages.syllabus',
      ...MEDIA_UPLOAD,
    ],
  },
  // Same shape as Examination above - identical modules, different pages.* key.
  // Library is deliberately a PAGE owner, not a department-scoped admin: the
  // Central Library department row would only give them the department
  // workspace, while the public Library page's documents carry
  // pageSection 'library' with departmentId null - which a department-scoped
  // admin is denied by design. Owning the page is what the job actually needs.
  {
    name: 'Library',
    description:
      'Owns the Library page: its documents, images, tables and text. Restricted to that page by the pages.library key.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('downloads', 'gallery'),
      'pages.library',
      ...MEDIA_UPLOAD,
    ],
  },
  {
    name: 'Placements Officer',
    description:
      'Owns placement records, job openings and the applications pipeline, plus the Placements page content. Cannot see admin accounts or any department workspace.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('placements', 'careers', 'career_applications'),
      ...permissionsFor('downloads', 'gallery'),
      'pages.placements',
      ...MEDIA_UPLOAD,
    ],
  },
  {
    name: 'Campus Services',
    description:
      'Owns the operational, non-teaching content: college bus routes and timings, and KGCET participation figures and highlights, including the KGCET page documents.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('transport_routes', 'kgcet'),
      ...permissionsFor('downloads', 'gallery'),
      'pages.kgcet',
      ...MEDIA_UPLOAD,
    ],
  },
  // The one role that edits the site's own shell rather than a page of
  // content. Deliberately still NOT admins.* or roles.*: those two remain
  // Super Admin only, because granting either lets the holder widen their own
  // access (DATA_MODEL_DESIGN.md 3.16). That is the single intentional gap
  // left in "every module has an owner".
  {
    name: 'Website Manager',
    description:
      'Owns the public homepage, the page-driven marketing content (banners, statistics, testimonials, videos, FAQs, leadership profiles, recruiters), the contact office directory, and global site settings. Does not include admin accounts or role management.',
    isSystemRole: true,
    permissionKeys: [
      ...permissionsFor('homepage', 'page_content', 'site_settings', 'contact'),
      ...MEDIA_UPLOAD,
    ],
  },
];

// Every module must be editable by SOME role, not only by a Super Admin -
// otherwise that part of the site is not really CMS-driven, since the only
// account that can change it is the one account you cannot safely hand out.
//
// admins and roles are the deliberate exceptions: granting either lets the
// holder widen their own access, so they stay Super Admin only
// (DATA_MODEL_DESIGN.md 3.16).
//
// Checked at seed time rather than left to review, because the gap it catches
// is invisible - a module with no owner looks exactly like a module that
// works, right up until someone needs to edit it.
const MODULES_RESERVED_TO_SUPER_ADMIN = ['admins', 'roles'];

function assertEveryModuleHasAnOwner(): void {
  const owned = new Set<string>();
  for (const role of ROLES) {
    if (role.name === 'Super Admin') continue;
    for (const key of role.permissionKeys) {
      owned.add(key.split('.')[0]);
    }
  }

  const orphans = Object.keys(MODULE_ACTIONS).filter(
    (module) =>
      !owned.has(module) && !MODULES_RESERVED_TO_SUPER_ADMIN.includes(module),
  );

  if (orphans.length) {
    throw new Error(
      `No role can edit these modules, so they are Super-Admin-only and not CMS-driven: ${orphans.join(', ')}. Give them an owner in ROLES, or add them to MODULES_RESERVED_TO_SUPER_ADMIN deliberately.`,
    );
  }
}

// Roles seeded by earlier versions of this file that are no longer part of
// the design. seedRoles() removes them, but refuses to remove one that still
// has an admin assigned - reassign that admin first, then reseed.
const RETIRED_ROLE_NAMES = [
  'CMS Administrator',
  'Department Editor',
  'Faculty Manager',
  'Examination Cell',
  'Content Editor',
  'Viewer',
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
  // PERMISSIONS_WITH_SECTIONS, not PERMISSIONS: the pages.* keys have to
  // exist as Permission rows before seedRoles() looks them up, or every role
  // carrying one aborts the seed with "references unknown permission key".
  for (const permission of PERMISSIONS_WITH_SECTIONS) {
    const row = await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
    permissionsByKey.set(permission.key, row);
  }
  return permissionsByKey;
}

// Reconciles each role's grants to exactly what ROLES declares - adding what
// is missing AND revoking what is no longer listed. An earlier version only
// ever added, which meant a permission could be taken out of a role here and
// still be live in the database forever. Every change is printed, because
// silently widening or narrowing what a live account can do is exactly the
// kind of change that should never happen unseen.
async function seedRoles(permissionsByKey: Map<string, { id: number }>) {
  // Fails the seed before writing anything, so an orphaned module is caught
  // here rather than by an admin who cannot do their job.
  assertEveryModuleHasAnOwner();

  const idToKey = new Map<number, string>();
  for (const [key, row] of permissionsByKey) idToKey.set(row.id, key);

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

    const desiredIds = new Set<number>();
    for (const key of role.permissionKeys) {
      const permission = permissionsByKey.get(key);
      if (!permission) {
        throw new Error(
          `Role "${role.name}" references unknown permission key "${key}"`,
        );
      }
      desiredIds.add(permission.id);
    }

    const existing = await prisma.rolePermission.findMany({
      where: { roleId: roleRow.id },
      select: { permissionId: true },
    });
    const existingIds = new Set(existing.map((r) => r.permissionId));

    const toGrant = [...desiredIds].filter((id) => !existingIds.has(id));
    const toRevoke = [...existingIds].filter((id) => !desiredIds.has(id));

    if (toGrant.length) {
      await prisma.rolePermission.createMany({
        data: toGrant.map((permissionId) => ({
          roleId: roleRow.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
    if (toRevoke.length) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: roleRow.id, permissionId: { in: toRevoke } },
      });
    }

    const label = (ids: number[]) =>
      ids
        .map((id) => idToKey.get(id) ?? `#${id}`)
        .sort()
        .join(', ');
    if (toGrant.length || toRevoke.length) {
      console.log(`\n  ${role.name}`);
      if (toGrant.length) console.log(`    + ${label(toGrant)}`);
      if (toRevoke.length) console.log(`    - ${label(toRevoke)}`);
    } else {
      console.log(`\n  ${role.name} (unchanged)`);
    }
  }

  await retireObsoleteRoles();
}

// Removes roles dropped from the design. Deleting a Role cascades to
// AdminRole, which would silently strip a live admin of all their access, so
// a role that still has holders is reported and left alone rather than
// deleted out from under them.
async function retireObsoleteRoles() {
  for (const name of RETIRED_ROLE_NAMES) {
    const role = await prisma.role.findUnique({
      where: { name },
      select: { id: true, _count: { select: { admins: true } } },
    });
    if (!role) continue;

    if (role._count.admins > 0) {
      console.log(
        `\n  ⚠️  "${name}" is retired but still assigned to ${role._count.admins} admin(s) - left in place. Reassign them, then reseed.`,
      );
      continue;
    }

    await prisma.role.delete({ where: { id: role.id } });
    console.log(`\n  - Retired role "${name}" (no admins assigned)`);
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
    `✅ Seeded ${PERMISSIONS_WITH_SECTIONS.length} permissions and ${ROLES.length} system roles`,
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
