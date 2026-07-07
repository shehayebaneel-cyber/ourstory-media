import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pw = process.env.SEED_PASSWORD || "changeme123";
  const users = [
    { name: process.env.SEED_USER1_NAME || "You", email: (process.env.SEED_USER1_EMAIL || "you@ourstory.local").toLowerCase() },
    { name: process.env.SEED_USER2_NAME || "Love", email: (process.env.SEED_USER2_EMAIL || "love@ourstory.local").toLowerCase() },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, create: { ...u, passwordHash: await bcrypt.hash(pw, 10) }, update: { name: u.name } });
  }
  await prisma.setting.upsert({ where: { key: "startDate" }, create: { key: "startDate", value: process.env.SEED_START_DATE || "2020-01-01" }, update: {} });
  console.log(`Seeded ${users.length} accounts (${users.map((u) => u.email).join(", ")}). Password: ${pw}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
