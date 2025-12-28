import { SHIPPING_METHOD_LABELS } from "@/lib/constants";

import type { Order, OrderItem } from "@prisma/client";

type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: {
      slug: string;
      images: { url: string; color: string | null }[];
    };
  })[];
};

export function getOrderShippingDetails(order: Order) {
  let label = "Envío";
  let lines: string[] = [];

  if (order.shippingType === "HOME") {
    label = SHIPPING_METHOD_LABELS.home || "A Domicilio";

    const line1 = [order.street, order.addressExtra, order.postalCode]
      .filter(Boolean)
      .join(", ");

    const line2 = [order.city, order.province, order.country]
      .filter(Boolean)
      .join(", ");

    // 3. Guardamos solo las líneas que tengan contenido
    lines = [line1, line2].filter(Boolean);
  } else if (order.shippingType === "STORE") {
    label = SHIPPING_METHOD_LABELS.store || "Recogida en Tienda";
    lines = [
      "Tienda seleccionada:",
      order.storeLocationId || "Ubicación no disponible",
    ];
  } else if (order.shippingType === "PICKUP") {
    label = SHIPPING_METHOD_LABELS.pickup || "Punto de Entrega";
    lines = [
      "Punto de entrega:",
      order.pickupSearch || order.pickupLocationId || "Sin información",
    ];
  }

  return { label, addressLines: lines };
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
