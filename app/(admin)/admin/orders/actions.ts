"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import type { OrderStatus } from "@prisma/client";

type ReturnItemInput = {
  itemId: string;
  qtyToReturn: number;
};

// Helper para formatear historial de aceptación
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

// --- 1. ACTUALIZAR ESTADO GENERAL (Pagar, Cancelar manualmente) ---
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

      // Lógica de cancelación completa (Devuelve TODO el stock restante)
      if (
        newStatus === "CANCELLED" &&
        order.status !== "CANCELLED" &&
        order.status !== "EXPIRED" &&
        order.status !== "RETURNED"
      ) {
        for (const item of order.items) {
          const remainingQty = item.quantity - item.quantityReturned;
          if (remainingQty > 0 && item.variantId) {
            // Devolver stock
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: remainingQty } },
            });
            // Marcar items como devueltos (para consistencia contable)
            await tx.orderItem.update({
              where: { id: item.id },
              data: { quantityReturned: item.quantity },
            });
          }
        }
      }

      // Actualizar estado
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      // Historial
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

// --- 2. RECHAZAR SOLICITUD DE DEVOLUCIÓN ---
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

      // Limpiar cantidades solicitadas en los items (resetear solicitud)
      for (const item of order.items) {
        if (item.quantityReturnRequested > 0) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { quantityReturnRequested: 0 },
          });
        }
      }

      // Volver a estado PAID y guardar motivo en la orden principal
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          rejectionReason: reason,
        },
      });

      // Historial con el motivo del rechazo
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

// --- 3. PROCESAR DEVOLUCIÓN PARCIAL (Aceptar y Restaurar Stock) ---
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

      // Calcular totales previos
      for (const item of order.items) {
        totalOriginalQty += item.quantity;
        totalReturnedSoFar += item.quantityReturned;
      }

      // Procesar items aceptados
      for (const input of itemsToReturn) {
        if (input.qtyToReturn <= 0) continue;

        const dbItem = order.items.find((i) => i.id === input.itemId);
        if (!dbItem) continue;

        // Validar contra lo solicitado o lo disponible
        const maxLimit =
          dbItem.quantityReturnRequested > 0
            ? dbItem.quantityReturnRequested
            : dbItem.quantity - dbItem.quantityReturned;

        if (input.qtyToReturn > maxLimit) {
          throw new Error(
            `Error: Intentando devolver más de lo permitido para ${dbItem.nameSnapshot}`,
          );
        }

        // A) Actualizar Item: Sumar a returned, limpiar requested
        await tx.orderItem.update({
          where: { id: input.itemId },
          data: {
            quantityReturned: { increment: input.qtyToReturn },
            quantityReturnRequested: 0,
          },
        });

        totalReturnedSoFar += input.qtyToReturn;

        // B) Restaurar Stock a la variante
        if (dbItem.variantId) {
          await tx.productVariant.update({
            where: { id: dbItem.variantId },
            data: { stock: { increment: input.qtyToReturn } },
          });
        }
      }

      // Limpieza general: Cualquier otro item que tuviera solicitud pendiente pero no se incluyó en el paylo
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

      // --- HISTORIAL ---
      // 1. Entrada de Aceptación (Con lista de items JSON)
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

      // 2. Entrada de Rechazo Parcial (si hubo nota)
      if (rejectionNote) {
        await tx.orderHistory.create({
          data: {
            orderId,
            status: finalStatus,
            actor: "admin",
            reason: `Nota sobre productos no aceptados: ${rejectionNote}`,
            // details: [formatHistoryDetails(order.items, )],
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
