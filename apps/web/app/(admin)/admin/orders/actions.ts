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
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return { error: "Error al rechazar devolución" };
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

      let totalReturnedSoFar = 0;
      let totalOriginalQty = 0;

      for (const item of order.items) {
        totalOriginalQty += item.quantity;
        totalReturnedSoFar += item.quantityReturned;
      }

      for (const input of itemsToReturn) {
        if (input.qtyToReturn <= 0) continue;

        const dbItem = order.items.find((i) => i.id === input.itemId);
        if (!dbItem) continue;

        if (input.qtyToReturn > dbItem.quantityReturnRequested) {
          throw new Error(
            `Error de seguridad: Intentando devolver más de lo solicitado para ${dbItem.nameSnapshot}`,
          );
        }

        await tx.orderItem.update({
          where: { id: input.itemId },
          data: {
            quantityReturned: { increment: input.qtyToReturn },
            // Restamos de lo solicitado porque ya lo hemos atendido
            quantityReturnRequested: { decrement: input.qtyToReturn },
          },
        });

        totalReturnedSoFar += input.qtyToReturn;

        if (dbItem.variantId) {
          await tx.productVariant.update({
            where: { id: dbItem.variantId },
            data: { stock: { increment: input.qtyToReturn } },
          });
        }
      }

      let finalStatus: OrderStatus = "PAID";

      if (totalReturnedSoFar >= totalOriginalQty) {
        finalStatus = "RETURNED";
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: finalStatus },
      });
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al procesar devolución" };
  }
}
