import {
  findPickupLocation,
  findStoreLocation,
} from "@/components/checkout/shared/locations";

export type ShippingType = "home" | "store" | "pickup";

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
  lines?: string[];
  methodTitle?: string;
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

  // 1. TIENDA
  if (shippingType === "store") {
    const store = findStoreLocation(storeLocationId ?? undefined);

    if (store) {
      return {
        label: "Recogida en tienda",
        details: `${store.name}\n${store.addressLine1}\n${store.addressLine2}`,
        methodTitle: store.name,
        lines: [store.addressLine1, store.addressLine2],
      };
    }

    if (storeLocationId) {
      return {
        label: "Recogida en tienda",
        details: `Tienda ID: ${storeLocationId}`,
        methodTitle: "Tienda seleccionada",
        lines: [],
      };
    }

    return {
      label: "Recogida en tienda",
      details: "Todavía no has elegido tienda.",
      methodTitle: "Sin seleccionar",
      lines: [],
    };
  }

  // 2. PUNTO DE RECOGIDA
  if (shippingType === "pickup") {
    const pickup = findPickupLocation(pickupLocationId ?? undefined);

    if (pickup) {
      return {
        label: "Punto de recogida",
        details: `${pickup.name}\n${pickup.addressLine1}\n${pickup.addressLine2}`,
        methodTitle: pickup.name,
        lines: [pickup.addressLine1, pickup.addressLine2],
      };
    }

    return {
      label: "Punto de recogida",
      details: pickupSearch
        ? `Buscando zona: ${pickupSearch}`
        : "Sin seleccionar punto.",
      methodTitle: "Punto de recogida",
      lines: [],
    };
  }

  // 3. DOMICILIO (Default)
  const line1 = street ?? "";
  const line2 = addressExtra ? `(${addressExtra})` : "";
  const line3Parts = [postalCode ?? "", city ?? "", province ?? ""].filter(
    Boolean,
  );
  const line3 = line3Parts.join(", ");

  const fullDetails = [line1, line2, line3].filter(Boolean).join("\n");

  return {
    label: "Envío a domicilio",
    details: fullDetails || "Dirección incompleta",
    methodTitle: "Mi Dirección",
    lines: [line1, line2, line3].filter(Boolean),
  };
}
