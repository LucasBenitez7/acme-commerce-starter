import {
  findPickupLocation,
  findStoreLocation,
} from "@/components/checkout/shared/locations";

import type { ShippingType } from "@/hooks/use-checkout-form";

export type ContactSummaryInput = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type ContactSummary = {
  fullName: string;
  email: string;
  phone: string;
};

export function buildContactSummary(
  input: ContactSummaryInput,
): ContactSummary {
  const { firstName, lastName, email, phone } = input;

  const fullNameRaw =
    (firstName ?? "").trim() || (lastName ?? "").trim()
      ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
      : "";

  return {
    fullName: fullNameRaw || "—",
    email: (email ?? "").trim() || "—",
    phone: (phone ?? "").trim() || "—",
  };
}

export type ShippingSummaryInput = {
  shippingType: ShippingType;
  street?: string | null;
  addressExtra?: string | null;
  postalCode?: string | null;
  province?: string | null;
  city?: string | null;
  storeLocationId?: string | null;
  pickupLocationId?: string | null;
  pickupSearch?: string | null;
};

export type ShippingSummary = {
  label: string;
  details: string;
};

export function buildShippingSummary(
  input: ShippingSummaryInput,
): ShippingSummary {
  const {
    shippingType,
    street,
    addressExtra,
    postalCode,
    province,
    city,
    storeLocationId,
    pickupLocationId,
    pickupSearch,
  } = input;

  if (shippingType === "store") {
    const store = findStoreLocation(storeLocationId ?? undefined);

    if (store) {
      return {
        label: "Recogida en tienda",
        details: `${store.name} · ${store.addressLine1} · ${store.addressLine2}`,
      };
    }

    if (storeLocationId) {
      return {
        label: "Recogida en tienda",
        details: `Tienda seleccionada: ${storeLocationId}`,
      };
    }

    return {
      label: "Recogida en tienda",
      details: "Todavía no has elegido tienda.",
    };
  }

  if (shippingType === "pickup") {
    const pickup = findPickupLocation(pickupLocationId ?? undefined);

    if (pickup) {
      const base = `${pickup.name} · ${pickup.addressLine1} · ${pickup.addressLine2}`;
      return {
        label: "Punto de recogida",
        details: pickupSearch ? `Zona: ${pickupSearch} · ${base}` : base,
      };
    }

    if (pickupSearch) {
      return {
        label: "Punto de recogida",
        details: `Zona: ${pickupSearch} (sin punto de recogida seleccionado).`,
      };
    }

    return {
      label: "Punto de recogida",
      details: "Todavía no has indicado zona ni punto de recogida.",
    };
  }

  // default → home
  const line1 = street ?? "";
  const line2 = addressExtra ?? "";
  const line3Parts = [postalCode ?? "", city ?? "", province ?? ""].filter(
    Boolean,
  );
  const line3 = line3Parts.join(" ");

  const details =
    [line1, line2, line3].filter((part) => part.trim() !== "").join(" · ") ||
    "Dirección de entrega no completada.";

  return {
    label: "Envío a domicilio",
    details,
  };
}
