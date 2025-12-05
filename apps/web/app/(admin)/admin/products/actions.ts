"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function deleteProductAction(productId: string) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return { error: "No autorizado" };
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      error:
        "No se pudo eliminar el producto. Puede que tenga pedidos asociados.",
    };
  }
}
