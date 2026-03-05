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
    console.error(`Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // --- CASO DE ÉXITO ---
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
            },
          });

          if (order) {
            // 1. Obtener detalles del método de pago (si existen)
            let paymentMethodString = "Tarjeta de Crédito";

            try {
              // Recuperamos el PaymentIntent expandido para asegurar que tenemos los datos del cargo y método de pago
              const extendedPaymentIntent =
                await stripe.paymentIntents.retrieve(paymentIntent.id, {
                  expand: ["payment_method"],
                });

              const pm =
                extendedPaymentIntent.payment_method as Stripe.PaymentMethod;
              const cardDetails = pm?.card;

              if (cardDetails) {
                const brandRaw = cardDetails.brand || "Tarjeta";
                const brand =
                  brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
                paymentMethodString = `${brand} •••• ${cardDetails.last4}`;
              }
            } catch (stripeError) {
              console.error("Error retrieving Stripe details:", stripeError);
              // Fallback to default string
            }

            // 2. Actualizar estado y método de pago
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: orderId },
                data: {
                  paymentStatus: "PAID",
                  fulfillmentStatus: "PREPARING",
                  paymentMethod: paymentMethodString,
                },
              });

              await tx.orderHistory.create({
                data: {
                  orderId,
                  type: "STATUS_CHANGE",
                  snapshotStatus: "Pagado y Preparando",
                  actor: "system",
                  reason: `Pago confirmado por Stripe (${paymentMethodString})`,
                },
              });
            });

            // 2. Enviar email de confirmación
            try {
              const { resend } = await import("@/lib/email/client");
              const { OrderSuccessEmail } = await import(
                "@/lib/email/templates/OrderSuccessEmail"
              );
              const { formatOrderForDisplay } = await import(
                "@/lib/orders/utils"
              );

              const displayOrder = formatOrderForDisplay(order);
              displayOrder.paymentMethod = paymentMethodString;
              displayOrder.paymentStatus = "PAID";

              await resend.emails.send({
                from: process.env.EMAIL_FROM || "onboarding@resend.dev",
                to: order.email,
                subject: `Pedido realizado con éxito`,
                react: OrderSuccessEmail({ order: displayOrder }),
              });
            } catch (emailError) {
              console.error("Error sending order email:", emailError);
            }
          }
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
