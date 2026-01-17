"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  cancelOrder,
  requestOrderReturn,
  type ReturnRequestItem,
} from "@/lib/orders/service";

// 1. CANCELAR PEDIDO
export async function cancelOrderUserAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  try {
    await cancelOrder(orderId, session.user.id, "user");

    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al cancelar el pedido" };
  }
}

// 2. SOLICITAR DEVOLUCIÓN
export async function requestReturnUserAction(
  orderId: string,
  reason: string,
  items: ReturnRequestItem[],
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  if (!reason || reason.trim().length < 5) {
    return {
      error: "Por favor, indica un motivo detallado (mínimo 5 caracteres).",
    };
  }
  if (!items || items.length === 0) {
    return { error: "Selecciona al menos un producto para devolver." };
  }

  try {
    await requestOrderReturn(orderId, session.user.id, reason, items);

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error al solicitar la devolución" };
  }
}
