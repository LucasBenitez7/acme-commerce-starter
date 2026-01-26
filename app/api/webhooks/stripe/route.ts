import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !endpointSecret) {
      return new NextResponse("Webhook Error", { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // --- CASO DE ÉXITO ---
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: "PAID",
                fulfillmentStatus: "PREPARING",
              },
            });

            await tx.orderHistory.create({
              data: {
                orderId,
                type: "STATUS_CHANGE",
                snapshotStatus: "Pagado y Preparando",
                actor: "system",
                reason: `Pago confirmado por Stripe`,
              },
            });
          });
        }
        break;
      }

      // --- CASO DE FALLO (Tarjeta rechazada, fondos insuficientes...) ---
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        const errorMessage =
          paymentIntent.last_payment_error?.message ||
          "La tarjeta fue rechazada por el banco.";

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
            },
          });

          await prisma.orderHistory.create({
            data: {
              orderId,
              type: "STATUS_CHANGE",
              snapshotStatus: "Pago Fallido",
              actor: "system",
              reason: `Error: ${errorMessage}`,
            },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
