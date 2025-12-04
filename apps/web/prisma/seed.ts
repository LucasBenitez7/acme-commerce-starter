import { type Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "chaquetas", name: "Chaquetas", type: "clothing" },
  { slug: "pantalones", name: "Pantalones", type: "clothing" },
  { slug: "vestidos", name: "Vestidos", type: "clothing" },
  { slug: "jeans", name: "Jeans", type: "clothing" },
  { slug: "jerseys", name: "Jerseys", type: "clothing" },
  { slug: "camisetas", name: "Camisetas", type: "clothing" },
  { slug: "ropa-interior", name: "Ropa interior", type: "clothing" },
  { slug: "zapatillas", name: "Zapatillas", type: "shoes" },
] as const;

// Definimos variantes posibles
const CLOTHING_SIZES = ["XXS", "XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["37", "38", "39", "40", "41", "42", "43", "44"];
const COLORS = ["Negro", "Blanco", "Azul Marino", "Beige", "Rojo"];

type SeedVariant = {
  size: string;
  color: string;
  stock: number;
};

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  categorySlug: string;
  categoryType: "clothing" | "shoes";
  images: Array<{ url: string; alt: string; sort: number }>;
};

function euros(n: number) {
  return Math.round(n * 100);
}

// Generador de variantes aleatorias para un producto
function generateVariants(type: "clothing" | "shoes"): SeedVariant[] {
  const sizes = type === "clothing" ? CLOTHING_SIZES : SHOE_SIZES;
  const variants: SeedVariant[] = [];

  const numColors = Math.floor(Math.random() * 3) + 2;
  const productColors = COLORS.sort(() => 0.5 - Math.random()).slice(
    0,
    numColors,
  );

  for (const color of productColors) {
    for (const size of sizes) {
      const hasStock = Math.random() > 0.2;
      const stock = hasStock ? Math.floor(Math.random() * 20) + 1 : 0;

      variants.push({ size, color, stock });
    }
  }
  return variants;
}

function makeProducts(): SeedProduct[] {
  const base: SeedProduct[] = [];
  let i = 1;
  for (const cat of CATEGORIES) {
    for (let k = 0; k < 8; k++) {
      const id = i++;
      const name = `Producto ${id}`;
      const price = ((id * 3.99) % 200) + 9.99;

      base.push({
        slug: `producto-${id}`,
        name,
        description: `Descripción del ${name}.`,
        priceCents: euros(price),
        categorySlug: cat.slug,
        categoryType: cat.type as "clothing" | "shoes",
        images: [
          {
            url: `https://plus.unsplash.com/premium_photo-1756137116701-ee9391c4bf62?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687&title=${encodeURIComponent(
              name,
            )}`,
            alt: name,
            sort: 0,
          },
        ],
      });
    }
  }
  return base;
}

async function main() {
  console.log("Seeding con Variantes...");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1) Upsert Categorías
    const cats: Record<string, string> = {};
    for (const [index, c] of CATEGORIES.entries()) {
      const r = await tx.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, sort: index },
        create: { slug: c.slug, name: c.name, sort: index },
      });
      cats[c.slug] = r.id;
    }

    // 2) Productos y Variantes
    const products: SeedProduct[] = makeProducts();

    for (const p of products) {
      const categoryId = cats[p.categorySlug];
      if (!categoryId) continue;

      const variantsData = generateVariants(p.categoryType);

      const product = await tx.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: "EUR",
          categoryId,
        },
        create: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: "EUR",
          categoryId,
          images: {
            create: p.images.map((img) => ({
              url: img.url,
              alt: img.alt,
              sort: img.sort,
            })),
          },
        },
      });

      // Buscamos si ya tiene variantes
      const existingVariants = await tx.productVariant.count({
        where: { productId: product.id },
      });

      if (existingVariants === 0) {
        await tx.productVariant.createMany({
          data: variantsData.map((v) => ({
            productId: product.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
          })),
        });
      }
    }
  });

  const [countProducts, countVariants] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(
    `OK: ${countProducts} productos y ${countVariants} variantes creadas.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
