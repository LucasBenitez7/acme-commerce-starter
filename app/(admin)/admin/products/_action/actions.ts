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
      categoryId: formData.get("categoryId"),
      isArchived: formData.get("isArchived") === "true",
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

    await prisma.product.delete({ where: { id: productId } });

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
