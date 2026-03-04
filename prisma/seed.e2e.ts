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

  const userEmail = process.env.E2E_USER_EMAIL;
  const userPassword = process.env.E2E_USER_PASSWORD;
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!userEmail || !userPassword || !adminEmail || !adminPassword) {
    throw new Error(
      "❌ Faltan variables de entorno: E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD",
    );
  }

  const passwordHash = await bcrypt.hash(userPassword, 10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { passwordHash, emailVerified: new Date() },
    create: {
      email: userEmail,
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
      role: "admin",
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      firstName: "Admin",
      lastName: "User",
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
      role: "admin",
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
    update: { isArchived: false },
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

  await prisma.productVariant.updateMany({
    where: { productId: camiseta.id },
    data: { stock: 10 },
  });

  // Producto 2 — Pantalón (para tests de admin: archivar/desarchivar)
  await prisma.product.upsert({
    where: { slug: "pantalon-test-e2e" },
    update: { isArchived: false, name: "Pantalón Test E2E" },
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

  // Producto 3 — Zapatillas (para test de devolución)
  await prisma.product.upsert({
    where: { slug: "zapatillas-test-e2e" },
    update: { isArchived: false },
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

  // ── 5. PEDIDOS PRE-CREADOS PARA TESTS E2E ──────────────────────────────────
  // Se borran y recrean siempre para garantizar estado limpio en cada ejecución
  console.log("📦 Limpiando y recreando pedidos de prueba E2E...");

  await prisma.order.deleteMany({
    where: {
      stripePaymentIntentId: {
        in: ["pi_e2e_test_return", "pi_e2e_test_fulfillment"],
      },
    },
  });

  const zapatillas = await prisma.product.findUnique({
    where: { slug: "zapatillas-test-e2e" },
    include: { variants: true },
  });

  const pantalon = await prisma.product.findUnique({
    where: { slug: "pantalon-test-e2e" },
    include: { variants: true },
  });

  if (zapatillas && pantalon) {
    const zapatillasVariant = zapatillas.variants[0];
    const pantalonVariant = pantalon.variants[0];

    // Pedido 1: PAID + DELIVERED — para returns.spec.ts
    // ID fijo para poder navegar directo en el test sin buscar por la lista
    await prisma.order.create({
      data: {
        id: "e2e-order-return",
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
        email: userEmail,
        firstName: "Test",
        lastName: "Return",
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
              variantId: zapatillasVariant.id,
              nameSnapshot: "Zapatillas Test E2E",
              priceMinorSnapshot: 5999,
              sizeSnapshot: zapatillasVariant.size,
              colorSnapshot: zapatillasVariant.color,
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

    // Pedido 2: PAID + UNFULFILLED — para admin-orders.spec.ts (ciclo logístico)
    // El apellido "Fulfillment" permite localizarlo en la tabla admin
    await prisma.order.create({
      data: {
        stripePaymentIntentId: "pi_e2e_test_fulfillment",
        paymentStatus: "PAID",
        fulfillmentStatus: "UNFULFILLED",
        isCancelled: false,
        currency: "EUR",
        itemsTotalMinor: 3999,
        shippingCostMinor: 0,
        taxMinor: 0,
        totalMinor: 3999,
        paymentMethod: "card",
        email: userEmail,
        firstName: "Test",
        lastName: "Fulfillment",
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
              productId: pantalon.id,
              variantId: pantalonVariant.id,
              nameSnapshot: "Pantalón Test E2E",
              priceMinorSnapshot: 3999,
              sizeSnapshot: pantalonVariant.size,
              colorSnapshot: pantalonVariant.color,
              subtotalMinor: 3999,
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
  console.log(`   - Usuario: ${userEmail}`);
  console.log(`   - Admin:   ${adminEmail}`);
  console.log(`   - 3 productos creados`);
  console.log(
    `   - Pedido "pi_e2e_test_return"      → PAID + DELIVERED (returns.spec.ts)`,
  );
  console.log(
    `   - Pedido "pi_e2e_test_fulfillment" → PAID + UNFULFILLED (admin-orders.spec.ts)`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed E2E:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
