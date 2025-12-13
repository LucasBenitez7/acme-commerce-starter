"use client";

import { useFormContext } from "react-hook-form";

import {
  buildContactSummary,
  buildShippingSummary,
} from "@/components/checkout/shared/checkout-summary";
import { findPaymentMethod } from "@/components/checkout/shared/methods";

import type { CheckoutFormValues } from "@/lib/validation/checkout";

type ReviewStepProps = {
  onEditShipping: () => void;
  onEditPayment: () => void;
  onEditContact?: () => void;
};

export function CheckoutReviewStep({
  onEditShipping,
  onEditPayment,
}: ReviewStepProps) {
  const values = useFormContext<CheckoutFormValues>().getValues();

  // 1. Preparamos el resumen de Contacto
  const contact = buildContactSummary({
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
  });

  // 2. Preparamos el resumen de Envío
  const shipping = buildShippingSummary({
    shippingType: values.shippingType,
    street: values.street,
    addressExtra: values.addressExtra,
    postalCode: values.postalCode,
    province: values.province,
    city: values.city,
    storeLocationId: values.storeLocationId,
    pickupLocationId: values.pickupLocationId,
  });

  const paymentOption = findPaymentMethod(values.paymentMethod);
  const PaymentIcon = paymentOption?.icon;

  return (
    <div>
      <div className="space-y-4 pb-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Datos de contacto</p>
            <button
              type="button"
              className="text-xs font-semibold fx-underline-anim mr-1"
              onClick={onEditShipping}
            >
              Editar
            </button>
          </div>
          <div className="flex flex-col space-y-1.5 text-sm text-foreground font-normal border rounded-xs p-3">
            <dd>{contact.fullName || "—"}</dd>
            <dd>{contact.phone || "—"}</dd>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">{shipping.label || "—"}</p>
            <button
              type="button"
              className="text-xs font-semibold fx-underline-anim mr-1"
              onClick={onEditShipping}
            >
              Editar
            </button>
          </div>
          <div className="flex flex-col space-y-1.5 text-sm text-foreground font-normal border rounded-xs p-3">
            <dd>{shipping.details || "—"}</dd>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Método de pago</p>
            <button
              type="button"
              className="text-xs font-semibold fx-underline-anim mr-1"
              onClick={onEditPayment}
            >
              Editar
            </button>
          </div>
          <p className="flex items-center border rounded-xs p-3 font-normal text-sm text-foreground">
            {paymentOption?.title || "—"}
            {PaymentIcon && <PaymentIcon className="ml-2 inline h-4 w-4" />}
          </p>
        </div>
      </div>
    </div>
  );
}
