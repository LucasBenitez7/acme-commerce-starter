"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(text: string) {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

  const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);

  return `${base}_${randomSuffix}`;
}

// Esquema de validación
const productSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  slug: z.string().optional(),
  description: z.string().min(10, "Descripción muy corta"),
  priceCents: z.coerce.number().min(1, "Precio inválido"),
  categoryId: z.string().min(1, "Selecciona categoría"),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        color: z.string().optional().nullable(),
      }),
    )
    .min(1, "Mínimo 1 imagen"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().min(1),
        color: z.string().min(1),
        colorHex: z.string().optional().nullable(),
        stock: z.coerce.number().min(0),
      }),
    )
    .min(1, "Mínimo 1 variante"),
});

export type ProductFormState = {
  errors?: any;
  message?: string;
};

// --- CREAR PRODUCTO ---
export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { message: "No autorizado" };

  const rawImages = JSON.parse(String(formData.get("imagesJson") || "[]"));
  const rawVariants = JSON.parse(String(formData.get("variantsJson") || "[]"));
  const name = String(formData.get("name") || "").trim();

  const slug = slugify(name);

  const validated = productSchema.safeParse({
    name,
    slug,
    description: formData.get("description"),
    priceCents: formData.get("priceCents"),
    categoryId: formData.get("categoryId"),
    images: rawImages,
    variants: rawVariants,
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación. Revisa los campos.",
    };
  }

  const { data } = validated;

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug!,
        description: data.description,
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        images: {
          create: data.images.map((img, index) => ({
            url: img.url,
            alt: data.name,
            sort: index,
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
  } catch (error: any) {
    console.error(error);
    return { message: "Error interno al crear el producto." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  prevState: ProductFormState,
  formData: FormData,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { message: "No autorizado" };

  const rawImages = JSON.parse(String(formData.get("imagesJson") || "[]"));
  const rawVariants = JSON.parse(String(formData.get("variantsJson") || "[]"));

  const validated = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    priceCents: formData.get("priceCents"),
    categoryId: formData.get("categoryId"),
    images: rawImages,
    variants: rawVariants,
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error validación",
    };
  }

  const { data } = validated;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Datos básicos
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          priceCents: data.priceCents,
          categoryId: data.categoryId,
        },
      });

      // 2. Imágenes (Recrear para actualizar orden y colores)
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: id,
          url: img.url,
          color: img.color || null,
          alt: data.name,
          sort: idx,
        })),
      });

      // 3. Variantes (Sincronización inteligente)
      const existingIds = data.variants.filter((v) => v.id).map((v) => v.id);
      await tx.productVariant.deleteMany({
        where: { productId: id, id: { notIn: existingIds as string[] } },
      });

      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || null,
              stock: v.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || null,
              stock: v.stock,
            },
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return { message: "Error al guardar cambios." };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

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
    revalidatePath("/admin/products/archived"); // Nueva ruta
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

    if (usageCount === 1) {
      return {
        error: `No se puede eliminar este producto porque ha sido vendido ${usageCount} vez. Si quieres eliminarlo, usa la opcion de 'Archivar' para ocultarlo de la tienda sin romper el historial de ventas.`,
      };
    }

    if (usageCount > 1) {
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
