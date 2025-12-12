import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export class InventoryService {
  // Verifica stock.
  static async validateStock(items: { variantId: string; quantity: number }[]) {
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, product: { select: { name: true } } },
      });

      if (!variant) {
        throw new Error(`Variante ${item.variantId} no encontrada`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${variant.product.name}. Disponible: ${variant.stock}, Solicitado: ${item.quantity}`,
        );
      }
    }
    return true;
  }

  // Actualiza el stock. Soporta transacciones externas (tx).
  static async updateStock(
    items: { variantId: string; quantity: number }[],
    type: "increment" | "decrement",
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx || prisma;

    const operations = items.map((item) =>
      db.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            [type]: item.quantity,
          },
        },
      }),
    );

    // Si ya estamos en una transacción, devolvemos las promesas para que el padre las espere.
    // Si no, iniciamos una transacción nueva.
    if (tx) {
      return Promise.all(operations);
    } else {
      return prisma.$transaction(operations);
    }
  }

  static async getStockForVariant(variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    return variant?.stock || 0;
  }
}
