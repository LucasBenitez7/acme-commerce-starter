import { prisma } from "@/lib/db";
import { type ProductFormValues } from "@/lib/products/schema";

// --- HELPERS ---
function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const randomId = Math.floor(100000000 + Math.random() * 900000000);

  return `${base}_${randomId}`;
}

// --- CREAR PRODUCTO ---
export async function createProductInDb(data: ProductFormValues) {
  const slug = generateSlug(data.name);

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description || "",
      priceCents: data.priceCents,
      categoryId: data.categoryId,
      isArchived: data.isArchived,
      sortOrder: data.sortOrder,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt || data.name,
          color: img.color || null,
          sort: idx,
        })),
      },
      variants: {
        create: data.variants.map((v) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          colorOrder: v.colorOrder ?? 0,
          priceCents: v.priceCents || null,
          stock: v.stock,
          isActive: true,
        })),
      },
    },
  });
}

// --- ACTUALIZAR PRODUCTO ---
export async function updateProductInDb(id: string, data: ProductFormValues) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || "",
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        isArchived: data.isArchived,
        sortOrder: data.sortOrder,
      },
    });

    // 2. GESTIÓN DE IMÁGENES
    const incomingImageIds = data.images
      .map((img) => img.id)
      .filter((id): id is string => !!id);

    await tx.productImage.deleteMany({
      where: {
        productId: id,
        id: { notIn: incomingImageIds },
      },
    });

    await tx.productImage.updateMany({
      where: { productId: id },
      data: { sort: { increment: 1000 } },
    });

    for (const [idx, img] of data.images.entries()) {
      if (img.id) {
        await tx.productImage.update({
          where: { id: img.id },
          data: {
            url: img.url,
            alt: img.alt || data.name,
            color: img.color || null,
            sort: idx,
          },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: id,
            url: img.url,
            alt: img.alt || data.name,
            color: img.color || null,
            sort: idx,
          },
        });
      }
    }

    // 3. GESTIÓN DE VARIANTES
    const incomingVariantIds = data.variants
      .map((v) => v.id)
      .filter((id): id is string => !!id);

    await tx.productVariant.deleteMany({
      where: {
        productId: id,
        id: { notIn: incomingVariantIds },
      },
    });

    for (const v of data.variants) {
      const variantPayload = {
        size: v.size,
        color: v.color,
        colorHex: v.colorHex || null,
        colorOrder: v.colorOrder ?? 0,
        priceCents: v.priceCents || null,
        stock: v.stock,
        isActive: true,
      };

      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: variantPayload,
        });
      } else {
        await tx.productVariant.create({
          data: { ...variantPayload, productId: id },
        });
      }
    }
  });
}

// --- DEPENDENCIAS DEL FORMULARIO ---
export async function getProductFormDependencies() {
  const [categories, variantsData] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.productVariant.findMany({
      select: { size: true, color: true },
      distinct: ["size", "color"],
    }),
  ]);

  const existingSizes = Array.from(
    new Set(variantsData.map((v) => v.size)),
  ).sort();
  const existingColors = Array.from(
    new Set(variantsData.map((v) => v.color)),
  ).sort();

  return { categories, existingSizes, existingColors };
}
