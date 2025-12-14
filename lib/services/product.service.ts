import { prisma } from "@/lib/db";
import { type ProductFormValues } from "@/lib/validation/product";

// Helper para generar slug único
function generateSlug(name: string, explicitSlug?: string) {
  const base =
    explicitSlug ||
    name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");

  const randomSuffix = Math.floor(Math.random() * 10000);

  return `${base}_${randomSuffix}`;
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

    // 3. Variantes con "Soft Delete" (Borrado Lógico)
    const incomingIds = data.variants
      .map((v) => v.id)
      .filter(Boolean) as string[];

    // B. DESACTIVAR variantes que NO vienen en el formulario (en lugar de deleteMany)
    await tx.productVariant.updateMany({
      where: {
        productId: id,
        id: { notIn: incomingIds },
      },
      data: {
        isActive: false,
        stock: 0,
      },
    });

    // C. ACTUALIZAR o CREAR variantes entrantes
    for (const v of data.variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            isActive: true,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            isActive: true,
          },
        });
      }
    }
  });
}
