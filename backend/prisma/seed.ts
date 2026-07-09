import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

// Every module gets the full view/create/update/delete set EXCEPT
// degree_verification, which deliberately has no `delete` action -
// verification records are compliance-sensitive and should never be
// removable through this permission system; a correction is made by
// superseding/flagging a record via `update`, never by deleting it.
// 'restore' added alongside bringing each module up to the same
// soft-delete/restore pattern every CMS module now uses - CRUD_ACTIONS
// alone has no restore action. (site_settings is the deliberate exception:
// SiteSetting has no soft-delete columns by design - system config, not
// content - so it keeps plain CRUD_ACTIONS.)
const MODULE_ACTIONS: Record<string, readonly string[]> = {
  faculty: [...CRUD_ACTIONS, 'restore'],
  departments: [...CRUD_ACTIONS, 'restore'],
  news: [...CRUD_ACTIONS, 'restore'],
  gallery: [...CRUD_ACTIONS, 'restore'],
  placements: [...CRUD_ACTIONS, 'restore'],
  exam_notifications: CRUD_ACTIONS,
  notifications: CRUD_ACTIONS,
  research: CRUD_ACTIONS,
  degree_verification: ['view', 'create', 'update'],
  downloads: [...CRUD_ACTIONS, 'restore'],
  committees: [...CRUD_ACTIONS, 'restore'],
  careers: [...CRUD_ACTIONS, 'restore'],
  events: [...CRUD_ACTIONS, 'restore'],
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
  // vs SiteSetting note.
  contact: CRUD_ACTIONS,
  // Admin-account management and RBAC self-management (roles/permission
  // assignment) are deliberately kept out of every seeded role below
  // except Super Admin - see the ROLES list.
  admins: CRUD_ACTIONS,
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
};

const MODULE_LABELS: Record<string, string> = {
  faculty: 'faculty directory entries',
  departments:
    'department profiles, labs, learning outcomes, programmes, and highlights',
  news: 'news posts',
  gallery: 'gallery images',
  placements: 'placement records',
  exam_notifications: 'exam notifications',
  notifications: 'scrolling ticker notices',
  research: 'research publication records',
  degree_verification: 'degree verification records',
  downloads: 'downloadable documents',
  committees: 'committees and committee membership rosters',
  careers: 'job openings on the public Careers page',
  events: 'campus events calendar entries',
  site_settings:
    'global site configuration (social links, SEO defaults, footer data)',
  page_content:
    'page banners, site statistics, testimonials, campus videos, accreditation badges, recruiters, FAQs, leadership profiles, and generic content cards',
  contact: 'contact office directory entries',
  admins: 'admin accounts',
  roles: 'roles and their permission assignments (RBAC self-management)',
  homepage:
    'the public homepage - hero banner, statistics, and quick links (Sprint 1A)',
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
      'Full department-content and faculty management, typically scoped to their own department via Admin.departmentId (scoping enforced in application code, not by this role alone).',
    isSystemRole: true,
    permissionKeys: permissionsFor('departments', 'faculty'),
  },
  {
    name: 'Department Editor',
    description:
      'Edits department profile content (about/vision/labs/outcomes/programmes) but not the faculty roster itself.',
    isSystemRole: true,
    permissionKeys: permissionsFor('departments'),
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
      'General content and communications: news, gallery, ticker notices, page-driven marketing content (banners, statistics, testimonials, videos, FAQs, leadership profiles), and the public homepage. Does not include the contact office directory, which is kept more restricted.',
    isSystemRole: true,
    permissionKeys: permissionsFor(
      'news',
      'gallery',
      'notifications',
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
