"use server";

import { prisma } from "@/lib/db";

import { type CartItemMini } from "@/store/cart.types";

export async function validateStockAction(items: CartItemMini[]) {
  try {
    const variantIds = items.map((i) => i.variantId);

    // Buscamos las variantes
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { name: true } } },
    });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant) {
        return {
          success: false,
          error: `Un producto de tu cesta ya no está disponible.`,
        };
      }

      if (variant.stock === 0) {
        return {
          success: false,
          error: `Stock insuficiente para "${variant.product.name}". Quedan ${variant.stock} unidades, elimínalo para continuar.`,
        };
      }

      if (variant.stock < item.qty && variant.stock > 0) {
        return {
          success: false,
          error: `Stock insuficiente para "${variant.product.name}". Nos quedan disponibles ${variant.stock} unidades.`,
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al verificar el inventario. Inténtalo de nuevo.",
    };
  }
}
