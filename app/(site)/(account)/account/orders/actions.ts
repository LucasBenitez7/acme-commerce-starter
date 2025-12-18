"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 1. CANCELAR PEDIDO (STOCK RETURN)
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
        throw new Error("Solo se pueden cancelar pedidos pendientes.");
      }

      // Devolver Stock
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Actualizar Pedido
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Guardar Historial
      await tx.orderHistory.create({
        data: {
          orderId,
          status: "CANCELLED",
          actor: "user",
          reason: "Cancelado por el usuario",
        },
      });
    });

    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al cancelar" };
  }
}

type ReturnItemRequest = { itemId: string; qty: number };

// 2. SOLICITAR DEVOLUCIÓN (Sin cambios de stock, solo estado)
export async function requestReturnUserAction(
  orderId: string,
  reason: string,
  items: ReturnItemRequest[],
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  if (!reason || reason.trim().length < 5)
    return { error: "Indica un motivo válido." };
  if (!items.length) return { error: "Selecciona productos." };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.userId !== session.user.id)
        throw new Error("Error de acceso");
      if (order.status !== "PAID" && order.status !== "RETURN_REQUESTED") {
        throw new Error("Estado inválido para devolución.");
      }

      for (const req of items) {
        const item = order.items.find((i) => i.id === req.itemId);
        if (!item) continue;

        const maxReturnable =
          item.quantity - item.quantityReturned - item.quantityReturnRequested;
        if (req.qty > maxReturnable) {
          throw new Error(
            `Cantidad inválida para ${item.nameSnapshot}. Máximo: ${maxReturnable}`,
          );
        }

        await tx.orderItem.update({
          where: { id: item.id },
          data: { quantityReturnRequested: { increment: req.qty } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURN_REQUESTED",
          returnReason: reason,
        },
      });

      // Historial
      await tx.orderHistory.create({
        data: {
          orderId,
          status: "RETURN_REQUESTED",
          actor: "user",
          reason,
          details: items,
        },
      });
    });

    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
