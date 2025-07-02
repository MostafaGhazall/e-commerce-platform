import bcrypt from "bcrypt";
import prisma from "../src/prisma";

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashed,
    },
  });

  console.log("✅ Admin created:", admin);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
