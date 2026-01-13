import "server-only";
import { type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

const STATUS_READABLE: Record<string, string> = {
  PAID: "Pago confirmado",
  PENDING_PAYMENT: "Marcado como pendiente",
  CANCELLED: "Pedido cancelado",
  SENT: "Pedido enviado",
  DELIVERED: "Pedido entregado",
  RETURNED: "Devolución completada",
};

// --- ADMIN: Actualizar Estado (Genérico) ---
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorName: string = "Admin",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    if (
      newStatus === "CANCELLED" &&
      !["CANCELLED", "RETURNED", "EXPIRED"].includes(order.status)
    ) {
      for (const item of order.items) {
        const remainingQty = item.quantity - item.quantityReturned;
        if (remainingQty > 0 && item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: remainingQty } },
          });
        }
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await tx.orderHistory.create({
      data: {
        orderId,
        status: newStatus,
        actor: actorName,
        reason: STATUS_READABLE[newStatus]
          ? `Estado actualizado: ${STATUS_READABLE[newStatus]}`
          : `Estado actualizado a ${newStatus}`,
      },
    });
  });
}

// --- USER / ADMIN: Cancelación Específica ---
export async function cancelOrder(
  orderId: string,
  userId?: string,
  actor = "system",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    if (userId && order.userId !== userId) throw new Error("No autorizado");

    if (order.status !== "PENDING_PAYMENT") {
      if (actor === "user")
        throw new Error("Solo puedes cancelar pedidos pendientes");
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

    await tx.orderHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
        actor,
        reason:
          actor === "user" ? "Cancelado por cliente" : "Cancelado por admin",
      },
    });
  });
}
