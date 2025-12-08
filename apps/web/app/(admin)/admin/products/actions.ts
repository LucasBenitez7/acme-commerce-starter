"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
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

  // Generación automática de slug si viene vacío
  let slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!slug && name) {
    slug = slugify(name);
  }

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
    // Verificar si el slug existe ANTES de crear para dar mejor error
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return {
        errors: { slug: ["Este slug ya está en uso. Cámbialo."] },
        message: "El slug ya existe.",
      };
    }

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
  const slug = String(formData.get("slug") || "").trim();

  const validated = productSchema.safeParse({
    name: formData.get("name"),
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
          slug: data.slug,
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

export async function deleteProductAction(productId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };
  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (e) {
    return { error: "Error al eliminar. Verifica si tiene pedidos activos." };
  }
}
