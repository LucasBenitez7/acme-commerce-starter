"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InventoryService } from "@/lib/services/inventory.service";

type ReturnItemRequest = {
  itemId: string;
  qty: number;
};

function formatHistoryDetails(
  items: any[],
  requestMap: Record<string, number>,
) {
  return items
    .filter((item) => requestMap[item.id] > 0)
    .map((item) => ({
      name: item.nameSnapshot,
      quantity: requestMap[item.id],
      variant:
        item.sizeSnapshot || item.colorSnapshot
          ? `${item.sizeSnapshot || ""} ${
              item.colorSnapshot ? "/ " + item.colorSnapshot : ""
            }`
          : null,
    }));
}

// 1. CANCELAR PEDIDO
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

      // 1. Preparamos items para devolver stock
      const itemsToRestock = order.items
        .filter((i) => i.variantId)
        .map((i) => ({
          variantId: i.variantId!,
          quantity: i.quantity,
        }));

      // 2. LLAMADA AL SERVICIO
      if (itemsToRestock.length > 0) {
        await InventoryService.updateStock(itemsToRestock, "increment", tx);
      }

      // 3. Actualizar Estado
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      await tx.orderHistory.create({
        data: {
          orderId,
          status: "CANCELLED",
          actor: "user",
          reason: "Pedido cancelado por el usuario.",
        },
      });
    });

    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al cancelar pedido" };
  }
}

// ... (Mantén requestReturnUserAction igual, ya que ese solo marca flags, no mueve stock) ...
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

    const requestMap: Record<string, number> = {};
    items.forEach((i) => (requestMap[i.itemId] = i.qty));

    await prisma.$transaction(async (tx) => {
      for (const req of items) {
        const item = order.items.find((i) => i.id === req.itemId);
        if (!item) continue;

        const maxReturnable = item.quantity - item.quantityReturned;
        if (req.qty > maxReturnable) {
          throw new Error(
            `Cantidad incorrecta para ${item.nameSnapshot}. Máximo devoluble: ${maxReturnable}`,
          );
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

      const historyDetails = formatHistoryDetails(order.items, requestMap);

      await tx.orderHistory.create({
        data: {
          orderId,
          status: "RETURN_REQUESTED",
          reason: reason,
          actor: "user",
          details: historyDetails,
        },
      });
    });

    revalidatePath("/account/orders");
    revalidatePath(`/admin/orders/${orderId}/history`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al solicitar devolución" };
  }
}
