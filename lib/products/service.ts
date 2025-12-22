import { prisma } from "@/lib/db";

import { type ProductFormValues } from "./schema";

function generateSlug(name: string, explicitSlug?: string) {
  const base = (explicitSlug || name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
  return `${base}_${Math.floor(Math.random() * 1000)}`;
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
    // 1. Actualizar Datos Básicos
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description || "",
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        isArchived: data.isArchived,
      },
    });

    // 2. Reemplazar Imágenes (Estrategia simple: borrar y crear)
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

    // 3. Gestionar Variantes (Smart Update)
    const incomingIds = data.variants
      .map((v) => v.id)
      .filter(Boolean) as string[];

    // A. Desactivar variantes no enviadas (Soft Delete)
    await tx.productVariant.updateMany({
      where: { productId: id, id: { notIn: incomingIds } },
      data: { isActive: false, stock: 0 },
    });

    // B. Actualizar o Crear variantes
    for (const v of data.variants) {
      const variantData = {
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
          data: variantData,
        });
      } else {
        await tx.productVariant.create({
          data: { ...variantData, productId: id },
        });
      }
    }
  });
}

// Helper para obtener los datos que necesita el formulario (Categorías + Sugerencias)
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
