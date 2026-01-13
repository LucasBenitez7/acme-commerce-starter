import {
  getShippingLabel,
  findStoreLocation,
  findPickupLocation,
} from "@/lib/locations";

import type { Order, OrderItem } from "@prisma/client";

type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: {
      slug: string;
      images: { url: string; color: string | null }[];
    };
  })[];
};

export function formatHistoryReason(reason: string | null | undefined) {
  if (!reason) return "Evento registrado";

  if (reason.includes("actualizado a PAID")) return "Pago confirmado";
  if (reason.includes("actualizado a CANCELLED")) return "Pedido cancelado";
  if (reason.includes("actualizado a SENT"))
    return "Pedido marcado como enviado";
  if (reason.includes("Devolución procesada"))
    return "Devolución aceptada y stock restaurado";

  return reason;
}

export function getOrderShippingDetails(order: Order) {
  const label = getShippingLabel(order.shippingType?.toLowerCase());
  let lines: string[] = [];

  if (order.shippingType === "HOME") {
    const line1 = [order.street, order.addressExtra, order.postalCode]
      .filter(Boolean)
      .join(", ");

    const line2 = [order.city, order.province, order.country]
      .filter(Boolean)
      .join(", ");

    lines = [line1, line2];
  } else if (order.shippingType === "STORE") {
    const store = findStoreLocation(order.storeLocationId);

    lines = [
      "Tienda seleccionada:",
      store ? store.name : order.storeLocationId || "Ubicación desconocida",
      store ? store.addressLine1 : "",
    ];
  } else if (order.shippingType === "PICKUP") {
    const pickup = findPickupLocation(order.pickupLocationId);

    lines = [
      "Punto de entrega:",
      pickup
        ? pickup.name
        : order.pickupSearch || order.pickupLocationId || "Sin información",
    ];
  }

  return { label, addressLines: lines.filter(Boolean) };
}

export function formatOrderForDisplay(order: OrderWithDetails) {
  return {
    id: order.id,
    email: order.email,
    createdAt: order.createdAt,
    status: order.status,

    totals: {
      subtotal: order.itemsTotalMinor,
      shipping: order.shippingCostMinor,
      total: order.totalMinor,
    },

    shippingInfo: getOrderShippingDetails(order),

    contact: {
      name: `${order.firstName || ""} ${order.lastName || ""}`.trim(),
      phone: order.phone || "",
      email: order.email,
    },

    items: order.items.map((item) => {
      const purchasedColor = item.colorSnapshot;
      const allImages = item.product.images;

      const matchingImage = allImages.find(
        (img) => img.color === purchasedColor,
      );

      const finalImageUrl = matchingImage?.url || allImages[0]?.url || null;

      return {
        id: item.id,
        name: item.nameSnapshot,
        slug: item.product.slug,
        subtitle: [item.sizeSnapshot, item.colorSnapshot]
          .filter(Boolean)
          .join(" / "),
        quantity: item.quantity,
        price: item.priceMinorSnapshot,
        image: finalImageUrl,
      };
    }),
  };
}

export type DisplayOrder = ReturnType<typeof formatOrderForDisplay>;
