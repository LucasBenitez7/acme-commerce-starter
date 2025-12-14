"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validation/product";

// Helper para slug
function slugify(text: string) {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

  const randomSuffix = Math.floor(Math.random() * 10000);

  return `${base}_${randomSuffix}`;
}

export type ProductFormState = {
  errors?: any;
  message?: string;
};

// --- CREAR / ACTUALIZAR (Unificado en lógica interna) ---
async function upsertProduct(id: string | null, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { message: "No autorizado" };

  // 1. Parsear datos complejos del FormData
  const rawImages = JSON.parse(String(formData.get("imagesJson") || "[]"));
  const rawVariants = JSON.parse(String(formData.get("variantsJson") || "[]"));

  // 2. Preparar objeto para validación
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    priceCents: formData.get("priceCents"),
    categoryId: formData.get("categoryId"),
    isArchived: formData.get("isArchived") === "true",
    slug: formData.get("slug") || undefined,
    images: rawImages,
    variants: rawVariants,
  };

  // 3. Validar con Zod
  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación. Revisa los campos.",
    };
  }

  const { data } = validated;
  const finalSlug = data.slug || slugify(data.name);

  try {
    if (id) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description || "",
            priceCents: data.priceCents,
            categoryId: data.categoryId,
            isArchived: data.isArchived,
          },
        });

        // Reemplazar imágenes
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

        // Sincronizar Variantes (Smart Sync)
        const incomingIds = data.variants
          .map((v) => v.id)
          .filter(Boolean) as string[];
        await tx.productVariant.deleteMany({
          where: { productId: id, id: { notIn: incomingIds } },
        });

        for (const v of data.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                size: v.size,
                color: v.color,
                colorHex: v.colorHex,
                stock: v.stock,
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
              },
            });
          }
        }
      });
    } else {
      // --- CREAR ---
      await prisma.product.create({
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description || "",
          priceCents: data.priceCents,
          categoryId: data.categoryId,
          isArchived: data.isArchived,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              alt: data.name,
              sort: idx,
              color: img.color || null,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || null,
              stock: v.stock,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
    return { message: "Error interno de base de datos." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  redirect("/admin/products");
}

export async function createProductAction(
  state: ProductFormState,
  formData: FormData,
) {
  return upsertProduct(null, formData);
}

export async function updateProductAction(
  id: string,
  state: ProductFormState,
  formData: FormData,
) {
  return upsertProduct(id, formData);
}

// --- ARCHIVAR PRODUCTO ---
export async function toggleProductArchive(
  productId: string,
  isArchived: boolean,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isArchived },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/archived");
    revalidatePath("/catalogo");

    return { success: true };
  } catch (error) {
    return { error: "Error al cambiar el estado del producto." };
  }
}

// --- ELIMINAR PRODUCTO ---
export async function deleteProductAction(productId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    // 1. Verificación estricta: ¿Está en algún pedido?
    const usageCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (usageCount > 0 && usageCount < 2) {
      return {
        error: `No se puede eliminar este producto porque ha sido vendido ${usageCount} vez. Si quieres eliminarlo, usa la opcion de 'Archivar' para ocultarlo de la tienda sin romper el historial de ventas.`,
      };
    } else if (usageCount > 1) {
      return {
        error: `No se puede eliminar este producto porque ha sido vendido ${usageCount} veces. Si quieres eliminarlo, usa la opcion de 'Archivar' para ocultarlo de la tienda sin romper el historial de ventas.`,
      };
    }

    // 2. Si está limpio, borramos permanentemente
    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/archived");
    revalidatePath("/catalogo");

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar:", error);
    return { error: `Error técnico: ${error.message}` };
  }
}
