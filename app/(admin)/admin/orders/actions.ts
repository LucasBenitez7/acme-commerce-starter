"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  updateOrderStatus,
  rejectOrderReturnRequest,
  processOrderReturn,
  type ReturnItemInput,
} from "@/lib/orders/service";

import type { OrderStatus } from "@prisma/client";

// --- 1. Cambio de Estado ---
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await updateOrderStatus(orderId, newStatus, "Admin");

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar" };
  }
}

// --- 2. Rechazar Devolución ---
export async function rejectReturnAction(orderId: string, reason: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  if (!reason || reason.trim().length < 3) return { error: "Motivo requerido" };

  try {
    await rejectOrderReturnRequest(orderId, reason, "Admin");

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error: any) {
    return { error: "Error al rechazar" };
  }
}

// --- 3. Procesar Devolución ---
export async function processPartialReturnAction(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
  rejectionNote?: string,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await processOrderReturn(orderId, itemsToReturn, rejectionNote, "Admin");

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al procesar devolución" };
  }
}
