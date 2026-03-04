import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando Seed E2E...");

  // ── 1. CATEGORÍAS MÍNIMAS ──────────────────────────────────────────────────
  console.log("📂 Creando categorías...");
  const categoryRopa = await prisma.category.upsert({
    where: { slug: "ropa" },
    update: {},
    create: { slug: "ropa", name: "Ropa", sort: 0 },
  });

  const categoryCalzado = await prisma.category.upsert({
    where: { slug: "calzado" },
    update: {},
    create: { slug: "calzado", name: "Calzado", sort: 1 },
  });

  // ── 2. CONFIGURACIÓN DE TIENDA ─────────────────────────────────────────────
  console.log("⚙️  Configurando tienda...");
  const configCount = await prisma.storeConfig.count();
  if (configCount === 0) {
    await prisma.storeConfig.create({
      data: {
        heroTitle: "TEST STORE",
        heroSubtitle: "E2E Testing Environment",
        saleTitle: "REBAJAS TEST",
        saleSubtitle: "Hasta 50% Dto.",
      },
    });
  }

  // ── 3. USUARIOS DE PRUEBA ──────────────────────────────────────────────────
  console.log("👤 Creando usuarios de prueba...");

  const passwordHash = await bcrypt.hash("Test1234!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin1234!", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: { passwordHash, emailVerified: new Date() },
    create: {
      email: "user@test.com",
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: { passwordHash: adminPasswordHash, emailVerified: new Date() },
    create: {
      email: "admin@test.com",
      name: "Admin User",
      firstName: "Admin",
      lastName: "User",
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
    },
  });

  // Dirección por defecto del usuario (necesaria para checkout)
  await prisma.userAddress.upsert({
    where: { id: "e2e-address-1" },
    update: {},
    create: {
      id: "e2e-address-1",
      userId: user.id,
      firstName: "Test",
      lastName: "User",
      phone: "600000000",
      street: "Calle Test 1",
      details: "Piso 2A",
      city: "Madrid",
      province: "Madrid",
      postalCode: "28001",
      country: "España",
      isDefault: true,
    },
  });

  // ── 4. PRODUCTOS DE PRUEBA ─────────────────────────────────────────────────
  console.log("👕 Creando productos...");

  // Producto 1 — Camiseta (para añadir al carrito y hacer checkout)
  const camiseta = await prisma.product.upsert({
    where: { slug: "camiseta-test-e2e" },
    update: {},
    create: {
      slug: "camiseta-test-e2e",
      name: "Camiseta Test E2E",
      description: "Camiseta de prueba para tests E2E",
      priceCents: 1999,
      compareAtPrice: 2999,
      currency: "EUR",
      categoryId: categoryRopa.id,
      sortOrder: 0,
      images: {
        create: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            alt: "Camiseta Test E2E",
            sort: 0,
            color: "Negro",
          },
        ],
      },
      variants: {
        create: [
          {
            size: "S",
            color: "Negro",
            colorHex: "#000000",
            colorOrder: 0,
            stock: 10,
            isActive: true,
          },
          {
            size: "M",
            color: "Negro",
            colorHex: "#000000",
            colorOrder: 0,
            stock: 10,
            isActive: true,
          },
          {
            size: "L",
            color: "Negro",
            colorHex: "#000000",
            colorOrder: 0,
            stock: 10,
            isActive: true,
          },
        ],
      },
    },
  });

  // Producto 2 — Pantalón (para tener catálogo)
  await prisma.product.upsert({
    where: { slug: "pantalon-test-e2e" },
    update: {},
    create: {
      slug: "pantalon-test-e2e",
      name: "Pantalón Test E2E",
      description: "Pantalón de prueba para tests E2E",
      priceCents: 3999,
      currency: "EUR",
      categoryId: categoryRopa.id,
      sortOrder: 1,
      images: {
        create: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            alt: "Pantalón Test E2E",
            sort: 0,
            color: "Azul",
          },
        ],
      },
      variants: {
        create: [
          {
            size: "M",
            color: "Azul",
            colorHex: "#0000ff",
            colorOrder: 0,
            stock: 5,
            isActive: true,
          },
          {
            size: "L",
            color: "Azul",
            colorHex: "#0000ff",
            colorOrder: 0,
            stock: 5,
            isActive: true,
          },
        ],
      },
    },
  });

  // Producto 3 — Para test de devolución (necesita estar con pedido DELIVERED)
  await prisma.product.upsert({
    where: { slug: "zapatillas-test-e2e" },
    update: {},
    create: {
      slug: "zapatillas-test-e2e",
      name: "Zapatillas Test E2E",
      description: "Zapatillas de prueba para tests E2E",
      priceCents: 5999,
      currency: "EUR",
      categoryId: categoryCalzado.id,
      sortOrder: 0,
      images: {
        create: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            alt: "Zapatillas Test E2E",
            sort: 0,
            color: "Blanco",
          },
        ],
      },
      variants: {
        create: [
          {
            size: "42",
            color: "Blanco",
            colorHex: "#ffffff",
            colorOrder: 0,
            stock: 3,
            isActive: true,
          },
        ],
      },
    },
  });

  // ── 5. PEDIDO PRE-CREADO PARA TEST DE DEVOLUCIÓN ───────────────────────────
  // El test de "solicitar devolución" necesita un pedido ya PAID + DELIVERED
  console.log("📦 Creando pedido de prueba para devolución...");

  const zapatillas = await prisma.product.findUnique({
    where: { slug: "zapatillas-test-e2e" },
    include: { variants: true },
  });

  const existingReturnOrder = await prisma.order.findFirst({
    where: {
      email: "user@test.com",
      stripePaymentIntentId: "pi_e2e_test_return",
    },
  });

  if (!existingReturnOrder && zapatillas) {
    const variant = zapatillas.variants[0];
    await prisma.order.create({
      data: {
        stripePaymentIntentId: "pi_e2e_test_return",
        paymentStatus: "PAID",
        fulfillmentStatus: "DELIVERED",
        isCancelled: false,
        currency: "EUR",
        itemsTotalMinor: 5999,
        shippingCostMinor: 0,
        taxMinor: 0,
        totalMinor: 5999,
        paymentMethod: "card",
        email: "user@test.com",
        firstName: "Test",
        lastName: "User",
        phone: "600000000",
        shippingType: "HOME",
        street: "Calle Test 1",
        postalCode: "28001",
        city: "Madrid",
        province: "Madrid",
        country: "España",
        userId: user.id,
        items: {
          create: [
            {
              productId: zapatillas.id,
              variantId: variant.id,
              nameSnapshot: "Zapatillas Test E2E",
              priceMinorSnapshot: 5999,
              sizeSnapshot: variant.size,
              colorSnapshot: variant.color,
              subtotalMinor: 5999,
              quantity: 1,
            },
          ],
        },
        history: {
          create: [
            {
              type: "STATUS_CHANGE",
              snapshotStatus: "Pedido realizado",
              actor: "system",
              reason: "order_created",
            },
          ],
        },
      },
    });
  }

  console.log(`✅ SEED E2E COMPLETO:`);
  console.log(`   - Usuario: user@test.com / Test1234!`);
  console.log(`   - Admin:   admin@test.com / Admin1234!`);
  console.log(`   - 3 productos creados`);
  console.log(`   - 1 pedido DELIVERED listo para test de devolución`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed E2E:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
