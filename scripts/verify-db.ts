import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  const count = await prisma.user.count();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  console.log("=== DATABASE VERIFICATION RESULT ===");
  console.log(`Total Users Count: ${count}`);
  console.log("Users Record(s):");
  console.log(JSON.stringify(users, null, 2));
  console.log("=====================================");
}

verify()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
