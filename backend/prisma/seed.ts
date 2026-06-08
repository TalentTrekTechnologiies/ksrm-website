import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create super admin
  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: "superadmin@ksrm.edu" },
    update: {},
    create: {
      email: "superadmin@ksrm.edu",
      password: hashedPassword,
      name: "Super Administrator",
      isSuperAdmin: true,
      permissions: [], // Super admin has all permissions
      isActive: true,
    },
  });

  console.log("✅ Super admin created:", superAdmin);
  console.log("\n📝 Login credentials:");
  console.log("   Email: superadmin@ksrm.edu");
  console.log("   Password: SuperAdmin@123");
  console.log("\n⚠️  Please change the password after first login!");
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
