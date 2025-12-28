"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/checkout/schema";
import { prisma } from "@/lib/db";

export type CheckoutActionState = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const session = await auth();

  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (key === "cartItems") {
      try {
        rawData[key] = JSON.parse(value as string);
      } catch {
        rawData[key] = [];
      }
    } else {
      rawData[key] = value;
    }
  });

  const validation = checkoutSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const data = validation.data;
  let orderId: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      let itemsTotalMinor = 0;
      const dbOrderItems = [];

      // A) Procesar Items (VALIDACIÓN DE STOCK ATÓMICA)
      for (const itemRequest of data.cartItems) {
        const product = await tx.product.findUnique({
          where: { id: itemRequest.productId },
          include: { variants: true },
        });

        if (!product)
          throw new Error(`Producto ${itemRequest.productId} no disponible.`);

        const variant = product.variants.find(
          (v) => v.id === itemRequest.variantId,
        );
        if (!variant) throw new Error(`Variante no encontrada.`);

        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            stock: { gte: itemRequest.quantity },
          },
          data: {
            stock: { decrement: itemRequest.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Stock insuficiente para ${product.name} (${variant.size}).`,
          );
        }

        const unitPrice = variant.priceCents ?? product.priceCents;
        const subtotal = unitPrice * itemRequest.quantity;
        itemsTotalMinor += subtotal;

        dbOrderItems.push({
          productId: product.id,
          variantId: variant.id,
          nameSnapshot: product.name,
          sizeSnapshot: variant.size,
          colorSnapshot: variant.color,
          priceMinorSnapshot: unitPrice,
          quantity: itemRequest.quantity,
          subtotalMinor: subtotal,
        });
      }

      // B) Crear Orden
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id,
          email: data.email,
          currency: "EUR",
          status: "PAID",

          itemsTotalMinor,
          shippingCostMinor: 0,
          taxMinor: Math.round(itemsTotalMinor * 0.21),
          totalMinor: itemsTotalMinor,

          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          street: data.street,
          addressExtra: data.details,
          postalCode: data.postalCode,
          city: data.city,
          province: data.province,
          country: data.country,

          shippingType:
            data.shippingType === "store"
              ? "STORE"
              : data.shippingType === "pickup"
                ? "PICKUP"
                : "HOME",

          storeLocationId: data.storeLocationId,
          pickupLocationId: data.pickupLocationId,
          paymentMethod: data.paymentMethod,

          items: { create: dbOrderItems },
          history: {
            create: {
              status: "PAID",
              actor: "system",
              reason: "Pedido web (Simulación)",
            },
          },
        },
      });

      orderId = order.id;
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: error.message || "Error al procesar el pedido." };
  }

  if (orderId) {
    return { success: true, orderId };
  }

  return { error: "Error desconocido al crear la orden." };
}
