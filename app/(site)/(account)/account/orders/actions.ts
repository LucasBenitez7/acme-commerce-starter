"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export async function getPaymentIntentAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) return { error: "Pedido no encontrado." };

    if (order.paymentStatus === "PAID") {
      return { error: "El pedido ya está pagado." };
    }

    let clientSecret = "";

    if (order.stripePaymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

      if (intent.status === "canceled") {
        const newIntent = await stripe.paymentIntents.create({
          amount: order.totalMinor,
          currency: order.currency.toLowerCase(),
          automatic_payment_methods: { enabled: true },
          metadata: { orderId: order.id },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { stripePaymentIntentId: newIntent.id },
        });
        clientSecret = newIntent.client_secret as string;
      } else {
        clientSecret = intent.client_secret as string;
      }
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalMinor,
        currency: order.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.id },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });
      clientSecret = paymentIntent.client_secret as string;
    }

    return { success: true, clientSecret };
  } catch (error: any) {
    console.error("PaymentIntent Error:", error);
    return { error: error.message || "Error al iniciar el pago." };
  }
}
