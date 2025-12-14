"use server";

import { prisma } from "@/lib/db";

import { type CartItemMini } from "@/store/cart.types";

export async function validateStockAction(items: CartItemMini[]) {
  try {
    const variantIds = items.map((i) => i.variantId);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { name: true } } },
    });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant || !variant.isActive) {
        return {
          success: false,
          error: `Un producto de tu cesta ya no está disponible.`,
        };
      }

      if (variant.stock === 0) {
        return {
          success: false,
          error: `Stock insuficiente para "${variant.product.name} (${variant.size}/${variant.color})" quedan ${variant.stock} unidades.`,
        };
      }

      if (variant.stock < item.qty) {
        const msg =
          variant.stock === 1
            ? "queda disponible 1 unidad"
            : `quedan disponibles ${variant.stock} unidades`;
        return {
          success: false,
          error: `Stock insuficiente para "${variant.product.name} (${variant.size}/${variant.color})" ${msg}.`,
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al verificar el inventario.",
    };
  }
}
