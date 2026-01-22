"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  updatePaymentStatus,
  updateFulfillmentStatus,
  rejectOrderReturnRequest,
  processOrderReturn,
  cancelOrder,
  type ReturnItemInput,
} from "@/lib/orders/service";

import type { PaymentStatus, FulfillmentStatus } from "@prisma/client";

// --- 1. Cambio de Estado de PAGO ---
export async function updatePaymentStatusAction(
  orderId: string,
  newStatus: PaymentStatus,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await updatePaymentStatus(orderId, newStatus, "admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar pago" };
  }
}

// --- 2. Cambio de Estado de LOGÍSTICA ---
export async function updateFulfillmentStatusAction(
  orderId: string,
  newStatus: FulfillmentStatus,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await updateFulfillmentStatus(orderId, newStatus, "admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar envío" };
  }
}

// --- 3. Cancelar Pedido (Admin) ---
export async function cancelOrderAdminAction(orderId: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await cancelOrder(orderId, undefined, "admin");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al cancelar" };
  }
}

// --- 4. Rechazar Devolución ---
export async function rejectReturnAction(orderId: string, reason: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  if (!reason || reason.trim().length < 3) return { error: "Motivo requerido" };

  try {
    await rejectOrderReturnRequest(orderId, reason, "admin");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error: any) {
    return { error: "Error al rechazar solicitud" };
  }
}

// --- 5. Procesar Devolución (Stock + Reembolso) ---
export async function processPartialReturnAction(
  orderId: string,
  itemsToReturn: ReturnItemInput[],
  rejectionNote?: string,
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    await processOrderReturn(orderId, itemsToReturn, rejectionNote, "admin");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/history`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al procesar devolución" };
  }
}
