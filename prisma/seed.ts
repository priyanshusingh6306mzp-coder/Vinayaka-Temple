import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();

  if (!adminEmail || !adminInitialPassword) {
    console.error(
      "Error: ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must both be defined in .env before seeding."
    );
    process.exit(1);
  }

  const normalizedEmail = adminEmail.toLowerCase();

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });

  if (existingUser) {
    console.log(`[SEED] Admin user (${normalizedEmail}) already exists. Skipped creation.`);
    return;
  }

  // Hash initial password securely with bcrypt
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(adminInitialPassword, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: Role.ADMIN,
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  console.log(`[SEED] Admin user created successfully: ${newUser.email} (ID: ${newUser.id})`);
}

main()
  .catch((e) => {
    console.error("[SEED ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
