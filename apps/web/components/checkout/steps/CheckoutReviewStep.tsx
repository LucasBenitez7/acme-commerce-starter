import {
  buildContactSummary,
  buildShippingSummary,
} from "@/components/checkout/shared/checkout-summary";
import { findPaymentMethod } from "@/components/checkout/shared/methods";

import type { CheckoutFormState } from "@/hooks/use-checkout-form";

type ReviewStepProps = {
  form: CheckoutFormState;
<<<<<<< HEAD
  onEditShipping: () => void;
  onEditContact: () => void;
  onEditPayment: () => void;
};

export function CheckoutReviewStep({
  form,
  onEditShipping,
  onEditContact,
  onEditPayment,
}: ReviewStepProps) {
=======
};

export function CheckoutReviewStep({ form }: ReviewStepProps) {
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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

<<<<<<< HEAD
  const PaymentIcon = paymentOption?.icon;
=======
  const PaymentIcon = paymentOption?.icon ?? "";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

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
<<<<<<< HEAD
      <div className="space-y-4 pb-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Datos de contacto</p>
            <button
              type="button"
              className="text-xs font-semibold fx-underline-anim mr-1"
              onClick={onEditContact}
            >
              Editar
            </button>
          </div>
          <div className="flex flex-col space-y-1.5 text-sm text-foreground font-normal border rounded-xs p-3">
            <dd>{contact.fullName || "—"}</dd>
            <dd>{contact.phone || "—"}</dd>
=======
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
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          </div>
        </div>

        <div>
<<<<<<< HEAD
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
=======
          <p className="text-base font-semibold">Método de pago</p>
          <p className="flex items-center font-medium text-sm text-foreground">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
