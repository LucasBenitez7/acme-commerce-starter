import { type Prisma, PrismaClient } from "@prisma/client";

import { INITIAL_CATEGORIES } from "@/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding: Inicializando categorías base...");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const [index, c] of INITIAL_CATEGORIES.entries()) {
      await tx.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, sort: index },
        create: { slug: c.slug, name: c.name, sort: index },
      });
    }
  });

  const countCats = await prisma.category.count();
  console.log(`✅ OK: Base de datos lista con ${countCats} categorías.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
