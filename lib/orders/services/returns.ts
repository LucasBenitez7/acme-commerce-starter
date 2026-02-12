import "server-only";
import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";

import type { HistoryDetailsJson, OrderActionActor } from "../types";

export type ReturnItemInput = {
  itemId: string;
  qtyToReturn: number;
};

export type ReturnRequestItem = {
  itemId: string;
  qty: number;
};

function getHistoryItem(dbItem: any, qty: number) {
  const variantLabel = [dbItem.sizeSnapshot, dbItem.colorSnapshot]
    .filter(Boolean)
    .join(" / ");

  return {
    name: dbItem.nameSnapshot,
    quantity: qty,
    variant: variantLabel || null,
  };
}

// 1. ADMIN: Procesar Devolución (Aprobar y devolver stock)
export async function processOrderReturn(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
  rejectionNote?: string,
  actorName: OrderActionActor = "admin",
) {
  return prisma.$transaction(async (tx) => {
    // A. Obtener items actuales
    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
    });

    if (orderItems.length === 0) throw new Error("Pedido sin items");

    let totalOriginalQty = 0;
    let totalReturnedSoFar = 0;
    let currentReturnQty = 0;

    const acceptedHistoryItems: HistoryDetailsJson["items"] = [];
    const rejectedHistoryItems: HistoryDetailsJson["items"] = [];

    // Calcular totales previos
    for (const item of orderItems) {
      totalOriginalQty += item.quantity;
      totalReturnedSoFar += item.quantityReturned;
    }

    // B. Procesar cada item devuelto
    for (const input of itemsToReturn) {
      if (input.qtyToReturn <= 0) continue;

      const dbItem = orderItems.find((i) => i.id === input.itemId);
      if (!dbItem) continue;

      const maxReturnable =
        dbItem.quantityReturnRequested > 0
          ? dbItem.quantityReturnRequested
          : dbItem.quantity - dbItem.quantityReturned;

      if (input.qtyToReturn > maxReturnable) {
        throw new Error(`Cantidad excesiva para ${dbItem.nameSnapshot}`);
      }

      // Actualizar Item
      await tx.orderItem.update({
        where: { id: input.itemId },
        data: {
          quantityReturned: { increment: input.qtyToReturn },
          quantityReturnRequested: 0,
        },
      });

      currentReturnQty += input.qtyToReturn;

      // Devolver Stock
      if (dbItem.variantId) {
        await tx.productVariant.update({
          where: { id: dbItem.variantId },
          data: { stock: { increment: input.qtyToReturn } },
        });
      }

      acceptedHistoryItems.push(getHistoryItem(dbItem, input.qtyToReturn));
    }

    // C. Rechazar lo que sobró (si había solicitud y no se aceptó todo)
    for (const dbItem of orderItems) {
      if (dbItem.quantityReturnRequested > 0) {
        const processed = itemsToReturn.find((i) => i.itemId === dbItem.id);
        const acceptedQty = processed ? processed.qtyToReturn : 0;
        const rejectedQty = dbItem.quantityReturnRequested - acceptedQty;

        if (rejectedQty > 0) {
          rejectedHistoryItems.push(getHistoryItem(dbItem, rejectedQty));

          if (!processed) {
            await tx.orderItem.update({
              where: { id: dbItem.id },
              data: { quantityReturnRequested: 0 },
            });
          }
        }
      }
    }

    // --- D. CÁLCULO DE NUEVOS ESTADOS ---
    const finalTotalReturned = totalReturnedSoFar + currentReturnQty;
    const isTotalReturn = finalTotalReturned >= totalOriginalQty;

    const newPaymentStatus = isTotalReturn ? "REFUNDED" : "PARTIALLY_REFUNDED";
    const newFulfillmentStatus = isTotalReturn ? "RETURNED" : "DELIVERED";

    await tx.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: newFulfillmentStatus,
        paymentStatus: newPaymentStatus,
        ...(rejectionNote ? { rejectionReason: rejectionNote } : {}),
        returnReason: null,
      },
    });

    // --- E. Historial ---
    if (acceptedHistoryItems.length > 0) {
      await tx.orderHistory.create({
        data: {
          orderId,
          type: "INCIDENT",
          snapshotStatus: isTotalReturn
            ? "Devolución Completada"
            : "Devolución Aceptada",
          actor: actorName,
          reason: SYSTEM_MSGS.RETURN_ACCEPTED,
          details: { items: acceptedHistoryItems } as any,
        },
      });
    }

    if (rejectedHistoryItems.length > 0) {
      await tx.orderHistory.create({
        data: {
          orderId,
          type: "INCIDENT",
          snapshotStatus: "Solicitud Rechazada (Parcial)",
          actor: actorName,
          reason: SYSTEM_MSGS.RETURN_PARTIAL_REJECTED,
          details: {
            note: rejectionNote || "Cantidad no aceptada",
            items: rejectedHistoryItems,
          } as any,
        },
      });
    }
  });
}

// 2. ADMIN: Rechazar Devolución Totalmente
export async function rejectOrderReturnRequest(
  orderId: string,
  reason: string,
  actorName: OrderActionActor = "admin",
) {
  return prisma.$transaction(async (tx) => {
    const requestedItems = await tx.orderItem.findMany({
      where: { orderId, quantityReturnRequested: { gt: 0 } },
    });

    if (requestedItems.length === 0) {
      throw new Error("No hay solicitud activa para rechazar");
    }

    const historyItems = requestedItems.map((item) =>
      getHistoryItem(item, item.quantityReturnRequested),
    );

    await tx.orderItem.updateMany({
      where: { orderId, quantityReturnRequested: { gt: 0 } },
      data: { quantityReturnRequested: 0 },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        rejectionReason: reason,
        returnReason: null,
      },
    });

    await tx.orderHistory.create({
      data: {
        orderId,
        type: "INCIDENT",
        snapshotStatus: "Solicitud Rechazada",
        actor: actorName,
        reason: SYSTEM_MSGS.RETURN_REJECTED,
        details: {
          note: reason,
          items: historyItems,
        } as any,
      },
    });
  });
}

// 3. USER: Solicitar Devolución
export async function requestOrderReturn(
  orderId: string,
  userId: string | null,
  reason: string,
  items: ReturnRequestItem[],
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    if (userId && order.userId !== userId)
      throw new Error("No tienes permiso para gestionar este pedido");

    if (order.isCancelled) {
      throw new Error("No puedes devolver un pedido cancelado.");
    }
    if (
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "PARTIALLY_REFUNDED"
    ) {
      throw new Error(
        "El pedido no cumple condiciones de pago para devolución.",
      );
    }
    if (order.fulfillmentStatus !== "DELIVERED") {
      throw new Error(
        "El pedido debe estar entregado para solicitar devolución.",
      );
    }

    const historyItems: HistoryDetailsJson["items"] = [];

    for (const req of items) {
      const item = order.items.find((i) => i.id === req.itemId);
      if (!item) continue;

      const maxReturnable =
        item.quantity - item.quantityReturned - item.quantityReturnRequested;

      if (req.qty > maxReturnable) {
        throw new Error(
          `Cantidad inválida para ${item.nameSnapshot}. Máximo disponible: ${maxReturnable}`,
        );
      }

      await tx.orderItem.update({
        where: { id: item.id },
        data: { quantityReturnRequested: { increment: req.qty } },
      });

      historyItems.push(getHistoryItem(item, req.qty));
    }

    if (historyItems.length === 0) {
      throw new Error("Debes seleccionar al menos un producto para devolver.");
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        returnReason: reason,
        rejectionReason: null,
      },
    });

    await tx.orderHistory.create({
      data: {
        orderId,
        type: "INCIDENT",
        snapshotStatus: SYSTEM_MSGS.RETURN_REQUESTED,
        actor: "user",
        reason: reason,
        details: { items: historyItems } as any,
      },
    });
  });
}
