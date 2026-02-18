"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/products/schema";
import { createProductInDb, updateProductInDb } from "@/lib/products/service";

// --- HELPERS ---
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Acceso denegado: Se requieren permisos de administrador.");
  }
}

function safeJsonParse(jsonString: string | null, fallback: any) {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// --- TIPOS ---
export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function upsertProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await assertAdmin();

    const rawData = {
      id: formData.get("id") as string | null,
      name: formData.get("name"),
      description: formData.get("description"),
      priceCents: Number(formData.get("priceCents")),
      compareAtPrice: Number(formData.get("compareAtPrice")) || null,
      categoryId: formData.get("categoryId"),
      isArchived: formData.get("isArchived") === "true",
      sortOrder: Number(formData.get("sortOrder")) || null,
      slug: formData.get("slug") || undefined,
      images: safeJsonParse(String(formData.get("imagesJson")), []),
      variants: safeJsonParse(String(formData.get("variantsJson")), []),
    };

    const validated = productSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        errors: validated.error.flatten().fieldErrors,
        message: "Error de validación. Revisa los campos marcados.",
      };
    }

    if (rawData.id) {
      await updateProductInDb(rawData.id, validated.data);
    } else {
      await createProductInDb(validated.data);
    }
  } catch (error: any) {
    console.error("Error en upsertProduct:", error);
    const isAuthError = error.message.includes("Acceso denegado");
    return {
      message: isAuthError
        ? error.message
        : "Ocurrió un error inesperado al guardar el producto. Intenta nuevamente.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  redirect("/admin/products");
}

export async function toggleProductArchive(
  productId: string,
  isArchived: boolean,
) {
  try {
    await assertAdmin();

    await prisma.product.update({
      where: { id: productId },
      data: { isArchived },
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalogo");

    return { success: true };
  } catch (error) {
    return {
      error:
        "No se pudo cambiar el estado. Verifica tus permisos o la conexión.",
    };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await assertAdmin();

    const usageCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (usageCount > 0) {
      const plural = usageCount > 1 ? "veces" : "vez";
      return {
        error: `No se puede eliminar: Este producto fue vendido ${usageCount} ${plural}. Utiliza la opción de 'Archivar' para ocultarlo sin romper el historial contable.`,
      };
    }

    // 1. Obtener las imágenes del producto antes de borrarlo
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return { error: "Producto no encontrado" };
    }

    // 2. Borrar el producto (las imágenes se borran automáticamente por onDelete: Cascade)
    await prisma.product.delete({ where: { id: productId } });

    // 3. Borrar imágenes de Cloudinary (en segundo plano, no bloqueante)
    if (product.images.length > 0) {
      const imageUrls = product.images.map((img) => img.url);
      // Importar dinámicamente para evitar errores si no está configurado
      import("@/lib/cloudinary/utils")
        .then(({ deleteImagesFromCloudinary }) => {
          deleteImagesFromCloudinary(imageUrls).then((result) => {
            if (result.deleted > 0) {
              console.log(
                `✓ Borradas ${result.deleted} imágenes de Cloudinary para producto ${productId}`,
              );
            }
            if (result.errors.length > 0) {
              console.warn(
                "Errores al borrar algunas imágenes:",
                result.errors,
              );
            }
          });
        })
        .catch((err) => {
          console.warn("No se pudieron borrar imágenes de Cloudinary:", err);
        });
    }

    revalidatePath("/admin/products");
    revalidatePath("/catalogo");

    return { success: true };
  } catch (error: any) {
    if (error.message.includes("Acceso denegado")) {
      return { error: error.message };
    }
    console.error("Error al eliminar:", error);
    return { error: "Error técnico al eliminar el producto." };
  }
}
