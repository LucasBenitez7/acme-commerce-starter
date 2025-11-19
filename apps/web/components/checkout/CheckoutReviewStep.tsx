import { FaCreditCard } from "react-icons/fa6";

import {
  findPickupLocation,
  findStoreLocation,
} from "@/components/checkout/shipping/locations";

import type { CheckoutFormState } from "@/hooks/use-checkout-form";

type ReviewStepProps = {
  form: CheckoutFormState;
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
    <div className="space-y-4">
      <div className="space-y-3 rounded-lb text-sm">
        <div>
          <div className="flex items-center pt-3 justify-between border-t">
            <p className="text-base font-semibold">Envío</p>
            <button
              type="button"
              className="text-xs font-medium fx-underline-anim"
              onClick={onEditShipping}
            >
              Editar
            </button>
          </div>

          <dl className="mt-2 space-y-1 text-xs text-foreground">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground text-sm">
                Tipo
              </dt>
              <dd>{shippingTypeLabel}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground text-sm">
                Detalles
              </dt>
              <dd>{shippingDetails}</dd>
            </div>
          </dl>
        </div>
        <div className="h-px w-full bg-border" />
        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Datos de contacto</p>
            <button
              type="button"
              className="text-xs font-medium fx-underline-anim"
              onClick={onEditContact}
            >
              Editar
            </button>
          </div>
          <dl className="mt-2 space-y-1 text-xs text-foreground">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground text-sm">
                Nombre
              </dt>
              <dd>{fullName || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground text-sm">
                E-mail
              </dt>
              <dd>{email || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground text-sm">
                Teléfono
              </dt>
              <dd>{phone || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Método de pago</p>
            <button
              type="button"
              className="text-xs font-medium fx-underline-anim"
              onClick={onEditPayment}
            >
              Editar
            </button>
          </div>
          <p className="items-center font-medium flex text-foreground text-sm">
            {paymentMethod === "card"
              ? "Pago online con tarjeta"
              : "Método de pago seleccionado"}
            <FaCreditCard className="ml-2  inline text-sm" />
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
