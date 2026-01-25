import "server-only";
import { type FulfillmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { FULFILLMENT_STATUS_CONFIG, SYSTEM_MSGS } from "@/lib/orders/constants";

import type { OrderActionActor } from "@/lib/orders/types";

// 2. ADMIN: Actualizar Estado de LOGÍSTICA (La Caja)
export async function updateFulfillmentStatus(
  orderId: string,
  newStatus: FulfillmentStatus,
  actorName: OrderActionActor = "admin",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Pedido no encontrado");

    if (
      newStatus === "PREPARING" ||
      newStatus === "SHIPPED" ||
      newStatus === "DELIVERED"
    ) {
      if (order.paymentStatus !== "PAID") {
        throw new Error("NO SE PUEDE ENVIAR: El pedido aún no ha sido pagado.");
      }
    }

    const dataToUpdate: any = { fulfillmentStatus: newStatus };

    if (newStatus === "DELIVERED") {
      dataToUpdate.deliveredAt = new Date();
    }

    await tx.order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    const readableLabel =
      FULFILLMENT_STATUS_CONFIG[newStatus]?.label || newStatus;

    await tx.orderHistory.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        snapshotStatus: readableLabel,
        actor: actorName,
        reason: `Estado: ${readableLabel}`,
      },
    });
  });
}

// 3. USER / ADMIN: Cancelar Pedido
export async function cancelOrder(
  orderId: string,
  userId?: string,
  actor: OrderActionActor = "system",
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    if (userId && order.userId !== userId) throw new Error("No autorizado");

    if (order.isCancelled) {
      throw new Error("El pedido ya está cancelado.");
    }

    if (
      order.fulfillmentStatus === "SHIPPED" ||
      order.fulfillmentStatus === "DELIVERED"
    ) {
      throw new Error(
        "El pedido ya ha sido enviado/entregado. No se puede cancelar, debe procesarse como devolución.",
      );
    }

    if (actor === "user") {
      if (order.paymentStatus !== "PENDING") {
        throw new Error(
          "No puedes cancelar un pedido pagado. Contacta con soporte.",
        );
      }
      if (order.fulfillmentStatus !== "UNFULFILLED") {
        throw new Error(
          "El pedido ya se está preparando. No se puede cancelar.",
        );
      }
    }

    // --- PROCESO DE CANCELACIÓN ---
    // A. Devolución de Stock
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // B. Calcular nuevo estado de pago
    let newPaymentStatus = order.paymentStatus;
    if (
      actor !== "user" &&
      (order.paymentStatus === "PAID" ||
        order.paymentStatus === "PARTIALLY_REFUNDED")
    ) {
      newPaymentStatus = "REFUNDED";
    } else if (order.paymentStatus === "PENDING") {
      newPaymentStatus = "FAILED";
    }

    // C. Actualizar Order
    await tx.order.update({
      where: { id: orderId },
      data: {
        isCancelled: true,
        paymentStatus: newPaymentStatus,
        fulfillmentStatus: "RETURNED",
      },
    });

    let historyReason = "";

    if (actor === "user") {
      historyReason = SYSTEM_MSGS.CANCELLED_BY_USER;
    } else if (newPaymentStatus === "REFUNDED") {
      historyReason = SYSTEM_MSGS.CANCELLED_BY_ADMIN_REFUND;
    } else {
      historyReason = SYSTEM_MSGS.CANCELLED_BY_ADMIN;
    }

    await tx.orderHistory.create({
      data: {
        orderId,
        type: "INCIDENT",
        snapshotStatus: "Cancelado",
        actor,
        reason: historyReason,
      },
    });
  });
}
