"use server";

import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { type SupportedCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { createOrderSchema } from "@/lib/orders/schema";
import { createOrder, updateOrderAddress } from "@/lib/orders/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover",
});

export type CheckoutActionState = {
  error?: string;
  success?: boolean;
  orderId?: string;
  clientSecret?: string;
  isStripe?: boolean;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const session = await auth();
  const rawData: Record<string, any> = {};

  const existingOrderId = formData.get("existingOrderId") as string | null;

  formData.forEach((value, key) => {
    if (key === "cartItems") {
      try {
        rawData[key] = JSON.parse(value as string);
      } catch {
        rawData[key] = [];
      }
    } else {
      if (value === "true") rawData[key] = true;
      else if (value === "false") rawData[key] = false;
      else if (value === "") rawData[key] = null;
      else {
        rawData[key] = typeof value === "string" ? value.trim() : value;
      }
    }
  });

  if (!rawData.shippingType) rawData.shippingType = "home";

  const validation = createOrderSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    let order;

    if (existingOrderId) {
      order = await updateOrderAddress(existingOrderId, validation.data);
    } else {
      order = await createOrder(validation.data, session?.user?.id);
    }

    if (!order?.id) {
      return { error: "Error al procesar el pedido." };
    }

    if (validation.data.paymentMethod === "card") {
      let clientSecret = "";

      if (order.stripePaymentIntentId) {
        const intent = await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId,
        );
        clientSecret = intent.client_secret as string;
      } else {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: order.totalMinor,
          currency: "EUR",
          automatic_payment_methods: { enabled: true },
          metadata: { orderId: order.id },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { stripePaymentIntentId: paymentIntent.id },
        });
        clientSecret = paymentIntent.client_secret as string;
      }

      return {
        success: true,
        orderId: order.id,
        clientSecret: clientSecret,
        isStripe: true,
      };
    }

    return { success: true, orderId: order.id, isStripe: false };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: error.message || "Error procesando el pedido." };
  }
}
