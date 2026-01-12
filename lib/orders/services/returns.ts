import "server-only";
import { type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

import type { HistoryDetailsJson } from "../types";

export type ReturnItemInput = {
  itemId: string;
  qtyToReturn: number;
};

export type ReturnRequestItem = {
  itemId: string;
  qty: number;
};

// --- ADMIN: Procesar Devolución (Aprobar y devolver stock) ---
export async function processOrderReturn(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
  rejectionNote?: string,
  actorName: string = "Admin",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    let totalOriginalQty = 0;
    let totalReturnedSoFar = 0;
    const historyItems: HistoryDetailsJson["items"] = [];

    for (const item of order.items) {
      totalOriginalQty += item.quantity;
      totalReturnedSoFar += item.quantityReturned;
    }

    for (const input of itemsToReturn) {
      if (input.qtyToReturn <= 0) continue;

      const dbItem = order.items.find((i) => i.id === input.itemId);
      if (!dbItem) continue;

      const maxReturnable =
        dbItem.quantityReturnRequested > 0
          ? dbItem.quantityReturnRequested
          : dbItem.quantity - dbItem.quantityReturned;

      if (input.qtyToReturn > maxReturnable) {
        throw new Error(`Cantidad excesiva para ${dbItem.nameSnapshot}`);
      }

      await tx.orderItem.update({
        where: { id: input.itemId },
        data: {
          quantityReturned: { increment: input.qtyToReturn },
          quantityReturnRequested: 0,
        },
      });

      totalReturnedSoFar += input.qtyToReturn;

      if (dbItem.variantId) {
        await tx.productVariant.update({
          where: { id: dbItem.variantId },
          data: { stock: { increment: input.qtyToReturn } },
        });
      }

      const variantLabel = [dbItem.sizeSnapshot, dbItem.colorSnapshot]
        .filter(Boolean)
        .join(" / ");

      historyItems.push({
        name: dbItem.nameSnapshot,
        quantity: input.qtyToReturn,
        variant: variantLabel || null,
      });
    }

    await tx.orderItem.updateMany({
      where: { orderId, quantityReturnRequested: { gt: 0 } },
      data: { quantityReturnRequested: 0 },
    });

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

    const historyPayload: HistoryDetailsJson = { items: historyItems };
    await tx.orderHistory.create({
      data: {
        orderId,
        status: finalStatus,
        actor: actorName,
        reason: "Devolución procesada y stock restaurado",
        details: historyPayload as any,
      },
    });

    if (rejectionNote) {
      await tx.orderHistory.create({
        data: {
          orderId,
          status: finalStatus,
          actor: actorName,
          reason: "Nota de rechazo parcial",
          details: { note: rejectionNote },
        },
      });
    }
  });
}

// --- ADMIN: Rechazar Devolución Totalmente ---
export async function rejectOrderReturnRequest(
  orderId: string,
  reason: string,
  actorName: string = "Admin",
) {
  return prisma.$transaction(async (tx) => {
    await tx.orderItem.updateMany({
      where: { orderId, quantityReturnRequested: { gt: 0 } },
      data: { quantityReturnRequested: 0 },
    });

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
        actor: actorName,
        reason: "Solicitud de devolución rechazada",
        details: { note: reason },
      },
    });
  });
}

// --- USER: Solicitar Devolución ---
export async function requestOrderReturn(
  orderId: string,
  userId: string,
  reason: string,
  items: ReturnRequestItem[],
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.userId !== userId)
      throw new Error("No tienes permiso para gestionar este pedido");

    if (order.status !== "PAID" && order.status !== "RETURN_REQUESTED") {
      throw new Error("El estado del pedido no permite devoluciones.");
    }

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
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "RETURN_REQUESTED",
        returnReason: reason,
      },
    });

    await tx.orderHistory.create({
      data: {
        orderId,
        status: "RETURN_REQUESTED",
        actor: "user",
        reason: reason,
        details: items,
      },
    });
  });
}
