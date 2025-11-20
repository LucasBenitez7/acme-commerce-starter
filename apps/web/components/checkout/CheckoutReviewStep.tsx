import { findPaymentMethod } from "@/components/checkout/payment/methods";
import {
  findPickupLocation,
  findStoreLocation,
} from "@/components/checkout/shipping/locations";

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

  const fullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : "";

  let shippingTypeLabel = "";
  let shippingDetails = "";

  if (shippingType === "home") {
    shippingTypeLabel = "Envío a domicilio";

    const line1 = street || "";
    const line2 = addressExtra || "";
    const line3Parts = [postalCode, city, province].filter(Boolean);
    const line3 = line3Parts.join(" ");

    shippingDetails =
      [line1, line2, line3].filter((part) => part.trim() !== "").join(" · ") ||
      "Dirección de entrega no completada.";
  } else if (shippingType === "store") {
    shippingTypeLabel = "Recogida en tienda";

    const store = findStoreLocation(storeLocationId);

    if (store) {
      shippingDetails = `${store.name} · ${store.addressLine1} · ${store.addressLine2}`;
    } else {
      shippingDetails = "Todavía no has elegido tienda.";
    }
  } else {
    // pickup
    shippingTypeLabel = "Punto de recogida";

    const pickup = findPickupLocation(pickupLocationId);

    if (pickup) {
      const base = `${pickup.name} · ${pickup.addressLine1} · ${pickup.addressLine2}`;

      shippingDetails = pickupSearch ? `Zona: ${pickupSearch} · ${base}` : base;
    } else if (pickupSearch) {
      shippingDetails = `Zona: ${pickupSearch} (sin punto de recogida seleccionado).`;
    } else {
      shippingDetails = "Todavía no has indicado zona ni punto de recogida.";
    }
  }

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
              <dd className="font-medium">{fullName || "—"}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                E-mail:
              </dt>
              <dd className="font-medium">{email || "—"}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Teléfono:
              </dt>
              <dd className="font-medium">{phone || "—"}</dd>
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
              <dd className="font-medium">{shippingTypeLabel}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="shrink-0 font-medium text-foreground text-sm">
                Detalles:
              </dt>
              <dd className="font-medium">{shippingDetails}</dd>
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
