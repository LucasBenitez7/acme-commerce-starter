"use server";

import { prisma } from "@/lib/db";

import { type CartItemMini } from "@/store/cart.types";

export async function validateStockAction(items: CartItemMini[]) {
  try {
    const slugs = items.map((i) => i.slug);

    // 1. Buscamos los productos en DB para ver su stock real
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        stock: true,
        name: true,
      },
    });

    // 2. Comparamos lo que pide el usuario vs lo que hay en DB
    for (const item of items) {
      const product = products.find((p) => p.slug === item.slug);

      if (!product) {
        return {
          success: false,
          error: `El producto con referencia "${item.slug}" ya no existe. Elimínalo para continuar.`,
        };
      }

      if (product.stock === 0) {
        return {
          success: false,
          error: `Stock insuficiente para "${product.name}". Quedan ${product.stock} unidades, elimínalo para continuar.`,
        };
      }

      if (product.stock < item.qty && product.stock > 0) {
        return {
          success: false,
          error: `Stock insuficiente para "${product.name}". Nos quedan disponibles ${product.stock} unidades.`,
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
