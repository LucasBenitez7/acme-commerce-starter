"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InventoryService } from "@/lib/services/inventory.service";

import type { OrderStatus } from "@prisma/client";

type ReturnItemInput = {
  itemId: string;
  qtyToReturn: number;
};

function formatHistoryDetails(
  orderItems: any[],
  actionItems: ReturnItemInput[],
) {
  const map: Record<string, number> = {};
  actionItems.forEach((i) => (map[i.itemId] = i.qtyToReturn));

  return orderItems
    .filter((item) => map[item.id] > 0)
    .map((item) => ({
      name: item.nameSnapshot,
      quantity: map[item.id],
      variant:
        item.sizeSnapshot || item.colorSnapshot
          ? `${item.sizeSnapshot || ""} ${
              item.colorSnapshot ? "/ " + item.colorSnapshot : ""
            }`
          : null,
    }));
}

// --- 1. ACTUALIZAR ESTADO GENERAL ---
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
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

      // Lógica de cancelación: Devolver stock
      if (
        newStatus === "CANCELLED" &&
        !["CANCELLED", "EXPIRED", "RETURNED"].includes(order.status)
      ) {
        // Preparamos items para el servicio de inventario
        const itemsToRestock: { variantId: string; quantity: number }[] = [];

        for (const item of order.items) {
          const remainingQty = item.quantity - item.quantityReturned;

          if (remainingQty > 0 && item.variantId) {
            itemsToRestock.push({
              variantId: item.variantId,
              quantity: remainingQty,
            });

            // Actualizamos el item de la orden para reflejar la devolución
            await tx.orderItem.update({
              where: { id: item.id },
              data: { quantityReturned: item.quantity },
            });
          }
        }

        // LLAMADA AL SERVICIO (Limpieza de código)
        if (itemsToRestock.length > 0) {
          await InventoryService.updateStock(itemsToRestock, "increment", tx);
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
          actor: "admin",
          reason: `Estado del pedido: ${newStatus}`,
        },
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

// ... (Mantén rejectReturnAction igual) ...
export async function rejectReturnAction(orderId: string, reason: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  if (!reason || reason.trim().length < 3) {
    return { error: "Debes indicar un motivo de rechazo." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("No encontrado");

      // Limpiar cantidades solicitadas
      for (const item of order.items) {
        if (item.quantityReturnRequested > 0) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { quantityReturnRequested: 0 },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          rejectionReason: reason,
        },
      });

      await tx.orderHistory.create({
        data: {
          orderId,
          status: "PAID",
          actor: "admin",
          reason: `Solicitud rechazada. Motivo: ${reason}`,
        },
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error) {
    return { error: "Error al rechazar devolución" };
  }
}

// --- 3. PROCESAR DEVOLUCIÓN PARCIAL ---
export async function processPartialReturnAction(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
  rejectionNote?: string,
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

      let totalReturnedSoFar = 0;
      let totalOriginalQty = 0;
      const itemsToRestock: { variantId: string; quantity: number }[] = [];

      // Calcular totales
      for (const item of order.items) {
        totalOriginalQty += item.quantity;
        totalReturnedSoFar += item.quantityReturned;
      }

      // Procesar items aceptados
      for (const input of itemsToReturn) {
        if (input.qtyToReturn <= 0) continue;

        const dbItem = order.items.find((i) => i.id === input.itemId);
        if (!dbItem) continue;

        const maxLimit =
          dbItem.quantityReturnRequested > 0
            ? dbItem.quantityReturnRequested
            : dbItem.quantity - dbItem.quantityReturned;

        if (input.qtyToReturn > maxLimit) {
          throw new Error(
            `Error: Intentando devolver más de lo permitido para ${dbItem.nameSnapshot}`,
          );
        }

        // A) Actualizar Item
        await tx.orderItem.update({
          where: { id: input.itemId },
          data: {
            quantityReturned: { increment: input.qtyToReturn },
            quantityReturnRequested: 0,
          },
        });

        totalReturnedSoFar += input.qtyToReturn;

        // B) Preparar para restaurar Stock (SOLO AGREGAMOS AL ARRAY)
        if (dbItem.variantId) {
          itemsToRestock.push({
            variantId: dbItem.variantId,
            quantity: input.qtyToReturn,
          });
        }
      }

      // LLAMADA AL SERVICIO (Restauración masiva y segura)
      if (itemsToRestock.length > 0) {
        await InventoryService.updateStock(itemsToRestock, "increment", tx);
      }

      // Limpieza general
      await tx.orderItem.updateMany({
        where: { orderId: orderId, quantityReturnRequested: { gt: 0 } },
        data: { quantityReturnRequested: 0 },
      });

      // C) Decidir Estado Final
      let finalStatus: OrderStatus = "PAID";
      if (totalReturnedSoFar >= totalOriginalQty) {
        finalStatus = "RETURNED";
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: finalStatus,
          ...(rejectionNote && { rejectionReason: rejectionNote }),
        },
      });

      // Historial...
      const acceptedDetails = formatHistoryDetails(order.items, itemsToReturn);
      await tx.orderHistory.create({
        data: {
          orderId,
          status: finalStatus,
          actor: "admin",
          reason: "Productos aceptados:",
          details: acceptedDetails,
        },
      });

      if (rejectionNote) {
        await tx.orderHistory.create({
          data: {
            orderId,
            status: finalStatus,
            actor: "admin",
            reason: `Nota sobre productos no aceptados: ${rejectionNote}`,
          },
        });
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al procesar devolución" };
  }
}
