import {
  buildContactSummary,
  buildShippingSummary,
} from "@/components/checkout/shared/checkout-summary";
import { findPaymentMethod } from "@/components/checkout/shared/methods";

import type { CheckoutFormState } from "@/hooks/use-checkout-form";

type ReviewStepProps = {
  form: CheckoutFormState;
};

export function CheckoutReviewStep({ form }: ReviewStepProps) {
  const {
    firstName,
    lastName,
    email,
    phone,
    street,
    addressExtra,
    postalCode,
    province,
    city,
    shippingType,
    storeLocationId,
    pickupLocationId,
    storeSearch,
    pickupSearch,
    paymentMethod,
  } = form;

  const paymentOption = findPaymentMethod(paymentMethod);

  const paymentLabel =
    paymentOption?.title ??
    (paymentMethod === "cash" ? "Pago en efectivo" : "Método de pago");

  const PaymentIcon = paymentOption?.icon ?? "";

  const contact = buildContactSummary({
    firstName,
    lastName,
    email,
    phone,
  });

  const shipping = buildShippingSummary({
    shippingType,
    street,
    addressExtra,
    postalCode,
    province,
    city,
    storeLocationId,
    pickupLocationId,
    pickupSearch,
  });

  return (
    <div>
      <div className="space-y-4 pb-4 pt-2">
        <div>
          <p className="text-base font-semibold">Contacto</p>
          <div className="flex flex-col gap-1 text-xs text-foreground">
            <dd className="gap-2 font-medium">
              {contact.fullName || "—"} ·{" "}
              <span className="text-xs">{contact.phone || "—"}</span>
            </dd>
            <dd className="font-medium">
              {shipping.label} {shipping.details}
            </dd>
          </div>
        </div>

        <div>
          <p className="text-base font-semibold">Método de pago</p>
          <p className="flex items-center font-medium text-sm text-foreground">
            {paymentLabel}
            {PaymentIcon && <PaymentIcon className="ml-2 inline h-4 w-4" />}
          </p>
        </div>
      </div>

      {/* Inputs ocultos para enviar los datos al servidor en el submit */}
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="street" value={street} />
      <input type="hidden" name="addressExtra" value={addressExtra} />
      <input type="hidden" name="postalCode" value={postalCode} />
      <input type="hidden" name="province" value={province} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="shippingType" value={shippingType} />
      <input type="hidden" name="storeLocationId" value={storeLocationId} />
      <input type="hidden" name="pickupLocationId" value={pickupLocationId} />
      <input type="hidden" name="storeSearch" value={storeSearch} />
      <input type="hidden" name="pickupSearch" value={pickupSearch} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
    </div>
  );
}
