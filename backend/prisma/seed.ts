import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Permission catalog - one key per manageable domain. "departments.manage"
// deliberately covers Department + Lab + LearningOutcome +
// DepartmentProgramme + DepartmentHighlight as one bundle, matching how
// the approved soft-delete scope groups them together as "department
// content" rather than splitting each into its own permission.
const PERMISSIONS: { key: string; description: string }[] = [
  {
    key: 'faculty.manage',
    description: 'Create, update, and remove faculty directory entries',
  },
  {
    key: 'departments.manage',
    description:
      'Manage department profiles, labs, learning outcomes, programmes, and highlights',
  },
  { key: 'news.manage', description: 'Create, update, and remove news posts' },
  {
    key: 'gallery.manage',
    description: 'Create, update, and remove gallery images',
  },
  {
    key: 'placements.manage',
    description: 'Create, update, and remove placement records',
  },
  {
    key: 'exam_notifications.manage',
    description: 'Create, update, and remove exam notifications',
  },
  {
    key: 'notifications.manage',
    description: 'Create, update, and remove scrolling ticker notices',
  },
  {
    key: 'research.manage',
    description: 'Create, update, and remove research publication records',
  },
  {
    key: 'degree_verification.manage',
    description: 'Create and view degree verification records',
  },
  {
    key: 'downloads.manage',
    description: 'Create, update, and remove downloadable documents',
  },
  {
    key: 'committees.manage',
    description: 'Manage committees and committee membership rosters',
  },
  {
    key: 'admins.manage',
    description:
      'Create, deactivate, and manage admin accounts and their roles',
  },
  {
    key: 'site_settings.manage',
    description:
      'Edit global site configuration (contact info, social links, SEO defaults)',
  },
];

const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);
const CONTENT_PERMISSION_KEYS = ALL_PERMISSION_KEYS.filter(
  (k) => k !== 'admins.manage',
);

// Proposed default role -> permission mapping. This is a starting point for
// review, not a claim that it exactly matches every real-world admin's
// current responsibilities - see DATA_MODEL_DESIGN.md §6 for the reasoning
// and the explicit note that existing admins are NOT assigned any of these
// roles by this script (that's a separate, later, reviewed data migration).
const ROLES: {
  name: string;
  description: string;
  isSystemRole: boolean;
  permissionKeys: string[];
}[] = [
  {
    name: 'Super Admin',
    description:
      'Full system access. In practice, bypass is enforced via Admin.isSuperAdmin, not this role - it exists so "Super Admin" appears as a real, selectable entry in admin-management screens.',
    isSystemRole: true,
    permissionKeys: ALL_PERMISSION_KEYS,
  },
  {
    name: 'CMS Administrator',
    description:
      'Full content management across every domain, excluding admin-account management.',
    isSystemRole: true,
    permissionKeys: CONTENT_PERMISSION_KEYS,
  },
  {
    name: 'Department Administrator',
    description:
      'Manages department content and faculty, typically scoped to their own department via Admin.departmentId (scoping enforced in application code, not by this role alone).',
    isSystemRole: true,
    permissionKeys: ['departments.manage', 'faculty.manage'],
  },
  {
    name: 'Department Editor',
    description:
      'Edits department profile content (about/vision/labs/outcomes/programmes) but not the faculty roster itself.',
    isSystemRole: true,
    permissionKeys: ['departments.manage'],
  },
  {
    name: 'Faculty Manager',
    description:
      'Institution-wide faculty directory management, not tied to one department.',
    isSystemRole: true,
    permissionKeys: ['faculty.manage'],
  },
  {
    name: 'Placements Officer',
    description: 'Manages placement records.',
    isSystemRole: true,
    permissionKeys: ['placements.manage'],
  },
  {
    name: 'Examination Cell',
    description: 'Manages exam notifications.',
    isSystemRole: true,
    permissionKeys: ['exam_notifications.manage'],
  },
  {
    name: 'Content Editor',
    description:
      'General content and communications: news, gallery, ticker notices.',
    isSystemRole: true,
    permissionKeys: ['news.manage', 'gallery.manage', 'notifications.manage'],
  },
  {
    name: 'Viewer',
    description:
      'Read-only - relies entirely on already-public GET endpoints. No write permissions.',
    isSystemRole: true,
    permissionKeys: [],
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
