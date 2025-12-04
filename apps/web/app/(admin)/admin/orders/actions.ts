"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import type { OrderStatus } from "@prisma/client";

type ReturnItemInput = {
  itemId: string;
  qtyToReturn: number;
};

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return { error: "No autorizado" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Pedido no encontrado");

      if (
        newStatus === "CANCELLED" &&
        order.status !== "CANCELLED" &&
        order.status !== "EXPIRED" &&
        order.status !== "RETURNED"
      ) {
        for (const item of order.items) {
          const remainingQty = item.quantity - item.quantityReturned;
          if (remainingQty > 0 && item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: remainingQty } },
            });
            await tx.orderItem.update({
              where: { id: item.id },
              data: { quantityReturned: item.quantity },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al actualizar el pedido" };
  }
}

export async function processPartialReturnAction(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Pedido no encontrado");

      for (const input of itemsToReturn) {
        if (input.qtyToReturn <= 0) continue;

        const dbItem = order.items.find((i) => i.id === input.itemId);
        if (!dbItem) continue;

        if (dbItem.quantityReturned + input.qtyToReturn > dbItem.quantity) {
          throw new Error(
            `No puedes devolver más de lo comprado para ${dbItem.nameSnapshot}`,
          );
        }

        await tx.orderItem.update({
          where: { id: input.itemId },
          data: { quantityReturned: { increment: input.qtyToReturn } },
        });

        if (dbItem.variantId) {
          await tx.productVariant.update({
            where: { id: dbItem.variantId },
            data: { stock: { increment: input.qtyToReturn } },
          });
        }
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al procesar devolución" };
  }
}
