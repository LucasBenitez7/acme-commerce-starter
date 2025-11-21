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
      <div className="space-y-4 pb-4 pt-2 text-sm">
        <div>
          <p className="text-base font-semibold">Datos de contacto</p>
          <dl className="space-y-1 text-xs text-foreground">
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Nombre:
              </dt>
              <dd className="font-medium">{contact.fullName || "—"}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                E-mail:
              </dt>
              <dd className="font-medium">{contact.email || "—"}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Teléfono:
              </dt>
              <dd className="font-medium">{contact.phone || "—"}</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="text-base font-semibold">Envío</p>
          <dl className="space-y-1 text-xs text-foreground">
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Tipo:
              </dt>
              <dd className="font-medium">{shipping.label}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Detalles:
              </dt>
              <dd className="font-medium">{shipping.details}</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="text-base font-semibold">Método de pago</p>

          <p className="flex items-center text-sm font-medium text-foreground">
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
