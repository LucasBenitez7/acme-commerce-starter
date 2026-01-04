import { prisma } from "@/lib/db";

import { type ProductFormValues } from "./schema";

// Generador de slug simple y seguro
function generateSlug(name: string, explicitSlug?: string) {
  const base = (explicitSlug || name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");

  return `${base}-${Math.floor(Math.random() * 10000)}`;
}

export async function createProductInDb(data: ProductFormValues) {
  const slug = generateSlug(data.name, data.slug);

  return prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description || "",
      priceCents: data.priceCents,
      categoryId: data.categoryId,
      isArchived: data.isArchived,
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
          priceCents: v.priceCents || null,
          stock: v.stock,
          isActive: true,
        })),
      },
    },
  });
}

export async function updateProductInDb(id: string, data: ProductFormValues) {
  const slug = data.slug ? generateSlug(data.name, data.slug) : undefined;

  return prisma.$transaction(async (tx) => {
    // 1. Update Básico
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        ...(slug && { slug }),
        description: data.description || "",
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        isArchived: data.isArchived,
      },
    });

    // 2. Imágenes (Borrar y Recrear es lo más seguro para el orden)
    await tx.productImage.deleteMany({ where: { productId: id } });
    if (data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: id,
          url: img.url,
          alt: img.alt || data.name,
          color: img.color || null,
          sort: idx,
        })),
      });
    }

    // 3. Variantes (Smart Sync)
    const incomingIds = data.variants
      .map((v) => v.id)
      .filter(Boolean) as string[];

    // A. Soft Delete de las que ya no vienen
    await tx.productVariant.updateMany({
      where: { productId: id, id: { notIn: incomingIds } },
      data: { isActive: false, stock: 0 },
    });

    // B. Upsert (Actualizar o Crear)
    for (const v of data.variants) {
      const variantPayload = {
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
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

// Helper para el formulario
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
