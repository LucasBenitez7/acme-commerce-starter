"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type ReturnItemRequest = {
  itemId: string;
  qty: number;
};

export async function cancelOrderUserAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Pedido no encontrado");

      if (order.userId !== session.user.id)
        throw new Error("No tienes permiso");

      if (order.status !== "PENDING_PAYMENT") {
        throw new Error("Solo se pueden cancelar pedidos pendientes de pago.");
      }

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    });

    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al cancelar pedido" };
  }
}

export async function requestReturnUserAction(
  orderId: string,
  reason: string,
  items: ReturnItemRequest[],
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  if (!reason || reason.trim().length < 5) {
    return { error: "Por favor, indica un motivo para la devolución." };
  }
  if (!items || items.length === 0) {
    return { error: "Selecciona al menos un producto para devolver." };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.userId !== session.user.id) throw new Error("No tienes permiso");
    if (order.status !== "PAID") {
      throw new Error("Solo se pueden devolver pedidos ya pagados.");
    }

    await prisma.$transaction(async (tx) => {
      for (const req of items) {
        const item = order.items.find((i) => i.id === req.itemId);
        if (!item) continue;
        const maxReturnable = item.quantity - item.quantityReturned;
        if (req.qty > maxReturnable) {
          throw new Error(`Cantidad incorrecta para ${item.nameSnapshot}`);
        }

        if (req.qty > 0) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { quantityReturnRequested: req.qty },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURN_REQUESTED",
          returnReason: reason,
        },
      });
    });

    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al solicitar devolución" };
  }
}
