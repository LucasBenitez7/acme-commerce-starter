import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  INITIAL_CATEGORIES,
  CLOTHING_SIZES,
  SHOE_SIZES,
  PRODUCT_COLORS,
} from "@/lib/products/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando Seeding...");

  // 1. CATEGORÍAS
  console.log("📂 Sincronizando Categorías...");
  await prisma.$transaction(async (tx) => {
    for (const [index, c] of INITIAL_CATEGORIES.entries()) {
      await tx.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, sort: index },
        create: { slug: c.slug, name: c.name, sort: index },
      });
    }
  });

  // 2. ATRIBUTOS DINÁMICOS
  // A. Tallas de Ropa
  console.log("👕 Sincronizando Tallas de Ropa...");
  for (const size of CLOTHING_SIZES) {
    await prisma.presetSize.upsert({
      where: { name: size },
      update: { type: "clothing" },
      create: { name: size, type: "clothing" },
    });
  }

  // B. Tallas de Calzado
  console.log("👟 Sincronizando Tallas de Calzado...");
  for (const size of SHOE_SIZES) {
    await prisma.presetSize.upsert({
      where: { name: size },
      update: { type: "shoe" },
      create: { name: size, type: "shoe" },
    });
  }

  // C. Colores
  console.log("🎨 Sincronizando Colores...");
  for (const color of PRODUCT_COLORS) {
    if (color.name === "Default") continue;

    await prisma.presetColor.upsert({
      where: { name: color.name },
      update: { hex: color.hex },
      create: { name: color.name, hex: color.hex },
    });
  }

  // 2.5 USUARIO DEMO (opcional, para entrevistas/demos)
  const demoEmail = process.env.DEMO_EMAIL;
  const demoPassword = process.env.DEMO_PASSWORD;
  if (demoEmail && demoPassword) {
    console.log("👤 Creando usuario demo (solo lectura)...");
    const demoHash = await bcrypt.hash(demoPassword, 10);
    await prisma.user.upsert({
      where: { email: demoEmail.toLowerCase().trim() },
      update: { passwordHash: demoHash, role: "demo" },
      create: {
        email: demoEmail.toLowerCase().trim(),
        name: "Demo",
        firstName: "Demo",
        lastName: "User",
        passwordHash: demoHash,
        emailVerified: new Date(),
        role: "demo",
      },
    });
    console.log(`   ✓ demo@... → rol demo (solo lectura)`);
  }

  // 3. CONFIGURACIÓN DE TIENDA DEFAULT
  console.log("⚙️  Sincronizando Configuración...");
  const configCount = await prisma.storeConfig.count();
  if (configCount === 0) {
    await prisma.storeConfig.create({
      data: {
        heroTitle: "NUEVA COLECCIÓN",
        heroSubtitle: "Descubre las tendencias que definen esta temporada.",
        saleTitle: "REBAJAS",
        saleSubtitle: "Hasta 50% Dto.",
      },
    });
  }

  const countCats = await prisma.category.count();
  const countSizes = await prisma.presetSize.count();
  const countColors = await prisma.presetColor.count();

  console.log(`✅ SEED COMPLETO:`);
  console.log(`   - ${countCats} Categorías`);
  console.log(`   - ${countSizes} Tallas predefinidas`);
  console.log(`   - ${countColors} Colores predefinidos`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
