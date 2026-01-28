import { redirect } from "next/navigation";
import Stripe from "stripe";

import { Container } from "@/components/ui";

import { getOrderSuccessDetails } from "@/lib/account/queries";
import { formatOrderForDisplay } from "@/lib/orders/utils";

import { SuccessClient } from "./SuccessClient";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

type Props = {
  searchParams: Promise<{ orderId?: string; payment_intent?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId, payment_intent } = await searchParams;

  if (!orderId) redirect("/");

  const order = await getOrderSuccessDetails(orderId);

  if (!order) redirect("/");

  const clientOrder = formatOrderForDisplay(order);

  if (payment_intent) {
    try {
      const intent = await stripe.paymentIntents.retrieve(payment_intent, {
        expand: ["payment_method"],
      });
      const pm = intent.payment_method as Stripe.PaymentMethod;
      const card = pm?.card;

      if (card) {
        const brandRaw = card.brand || "Tarjeta";
        const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
        clientOrder.paymentMethod = `${brand} •••• ${card.last4}`;

        if (intent.status === "succeeded") {
          clientOrder.paymentStatus = "PAID";
        }
      }
    } catch (error) {
      console.error("Error fetching payment intent on success page:", error);
    }
  }

  return (
    <Container className="py-6 px-4 lg:py-10">
      <SuccessClient order={clientOrder} />
    </Container>
  );
}
