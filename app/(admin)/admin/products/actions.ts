"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createProductInDb,
  updateProductInDb,
} from "@/lib/services/product.service";
import { productSchema } from "@/lib/validation/product";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Acceso denegado: Se requieren permisos de administrador.");
  }
}

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// --- ACCIÓN UNIFICADA ---
export async function upsertProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await assertAdmin();

    // 2. Extracción limpia de datos
    const rawData = {
      id: formData.get("id") as string | null,
      name: formData.get("name"),
      description: formData.get("description"),
      priceCents: formData.get("priceCents"),
      categoryId: formData.get("categoryId"),
      isArchived: formData.get("isArchived") === "true",
      slug: formData.get("slug") || undefined,
      // Parseamos los JSONs que vienen del frontend
      images: JSON.parse(String(formData.get("imagesJson") || "[]")),
      variants: JSON.parse(String(formData.get("variantsJson") || "[]")),
    };

    // 3. Validación Zod
    const validated = productSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        errors: validated.error.flatten().fieldErrors,
        message: "Error de validación. Revisa los campos marcados en rojo.",
      };
    }

    // 4. Delegar a la Capa de Servicio
    if (rawData.id) {
      await updateProductInDb(rawData.id, validated.data);
    } else {
      await createProductInDb(validated.data);
    }
  } catch (error: any) {
    console.error("Error en upsertProduct:", error);
    return {
      message:
        error.message || "Ocurrió un error inesperado al guardar el producto.",
    };
  }

  // 5. Revalidación y Redirección (fuera del try/catch para evitar conflictos con redirect de Next.js)
  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  redirect("/admin/products");
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
