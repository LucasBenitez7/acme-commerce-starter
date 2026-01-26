"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaCreditCard } from "react-icons/fa6";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { type CreateOrderInput } from "@/lib/orders/schema";

import { StripeEmbedForm } from "./StripeEmbedForm";

type Props = {
  isOpen: boolean;
  stripeData: { clientSecret: string; orderId: string } | null;
};

export function PaymentSection({ isOpen = false, stripeData }: Props) {
  const { setValue, watch } = useFormContext<CreateOrderInput>();
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (paymentMethod !== "card") {
      setValue("paymentMethod", "card");
    }
  }, [paymentMethod, setValue]);

  return (
    <Card
      className={`p-4 transition-all duration-300 ${
        !isOpen ? "bg-neutral-50/50 opacity-60" : "bg-white opacity-100"
      }`}
    >
      <CardHeader className="px-0 pt-2">
        <CardTitle
          className={`text-base flex items-center gap-2 ${
            !isOpen ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          <FaCreditCard /> Método de pago
        </CardTitle>
      </CardHeader>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="px-0 pt-2 space-y-4">
            {stripeData && (
              <StripeEmbedForm
                clientSecret={stripeData.clientSecret}
                orderId={stripeData.orderId}
              />
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
