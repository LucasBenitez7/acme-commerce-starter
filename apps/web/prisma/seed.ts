import { type Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "chaquetas", name: "Chaquetas" },
  { slug: "pantalones", name: "Pantalones" },
  { slug: "vestidos", name: "Vestidos" },
  { slug: "jeans", name: "Jeans" },
  { slug: "jerseys", name: "Jerseys" },
  { slug: "camisetas", name: "Camisetas" },
  { slug: "ropa-interior", name: "Ropa interior" },
  { slug: "zapatillas", name: "Zapatillas" },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  categorySlug: string;
  images: Array<{ url: string; alt: string; sort: number }>;
};

function euros(n: number) {
  return Math.round(n * 100);
}

function makeProducts(): SeedProduct[] {
  const base: SeedProduct[] = [];
  let i = 1;
  for (const cat of CATEGORIES) {
    for (let k = 0; k < 8; k++) {
      const id = i++;
      const name = `Producto ${id}`;
      const price = ((id * 3.99) % 200) + 9.99;
      const stock =
        Math.random() > 0.1 ? Math.floor(Math.random() * 50) + 1 : 0;

      base.push({
        slug: `producto-${id}`,
        name,
        description: `Descripción del ${name}.`,
        priceCents: euros(price),
        stock,
        categorySlug: cat.slug,
        images: [
          {
            url: `https://plus.unsplash.com/premium_photo-1756137116701-ee9391c4bf62?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687&title=${encodeURIComponent(
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
  console.log("Seeding…");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1) Upsert categorías
    const cats: Record<string, string> = {};
    for (const [index, c] of CATEGORIES.entries()) {
      const r = await tx.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, sort: index },
        create: { slug: c.slug, name: c.name, sort: index },
      });
      cats[c.slug] = r.id;
    }

    // 2) Productos
    const products: SeedProduct[] = makeProducts();

    for (const p of products) {
      const categoryId = cats[p.categorySlug];

      // Si por alguna razón la categoría no existe en el seed actual, saltamos (seguridad)
      if (!categoryId) {
        console.warn(
          `Categoría ${p.categorySlug} no encontrada para ${p.name}`,
        );
        continue;
      }

      await tx.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          stock: p.stock,
          currency: "EUR",
          categoryId,
        },
        create: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          stock: p.stock,
          currency: "EUR",
          categoryId,
          images: {
            create: p.images.map(
              (img: { url: string; alt: string; sort: number }) => ({
                url: img.url,
                alt: img.alt,
                sort: img.sort,
              }),
            ),
          },
        },
      });
    }
  });

  const [countProducts, countCats] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);
  console.log(`OK: ${countProducts} productos / ${countCats} categorías.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
