"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/checkout/schema";
import { prisma } from "@/lib/db";

export type CheckoutActionState = {
  error?: string;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  // 1. Identificar Usuario (si existe)
  const session = await auth();
  let userId: string | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) userId = user.id;
  }

  // 2. Procesar Datos del Formulario
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

  // 3. Validar con Zod
  const validation = checkoutSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Error validación checkout:", validation.error);
    return {
      error: "Datos incorrectos: " + validation.error.issues[0].message,
    };
  }

  const data = validation.data;

  // 4. Procesar Pedido (Transacción Atómica)
  let orderId: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      let itemsTotalMinor = 0;
      const dbOrderItems = [];

      // A) Iterar items para validar Stock y Precio
      for (const itemRequest of data.cartItems) {
        const product = await tx.product.findUnique({
          where: { id: itemRequest.productId },
          include: { variants: true },
        });

        if (!product)
          throw new Error(
            `Producto ${itemRequest.productId} no encontrado o descatalogado.`,
          );

        const variant = product.variants.find(
          (v) => v.id === itemRequest.variantId,
        );

        if (!variant)
          throw new Error(`Variante no disponible para ${product.name}.`);

        if (variant.stock < itemRequest.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name} (${variant.size}). Quedan ${variant.stock}.`,
          );
        }

        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: itemRequest.quantity } },
        });

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

      // B) Calcular Totales Finales
      const shippingCostMinor = 0;
      const taxMinor = Math.round(itemsTotalMinor * 0.21);
      const totalMinor = itemsTotalMinor + shippingCostMinor;

      // C) Crear la Orden en DB
      const order = await tx.order.create({
        data: {
          userId,
          email: data.email,
          currency: "EUR",
          status: "PAID",

          itemsTotalMinor,
          shippingCostMinor,
          taxMinor,
          totalMinor,

          // Dirección
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

          paymentMethod: data.paymentMethod,

          // Relación con Items
          items: {
            create: dbOrderItems,
          },

          // Historial inicial
          history: {
            create: {
              status: "PAID",
              actor: "system",
              reason: "Pedido creado vía web",
            },
          },
        },
      });

      orderId = order.id;
    });
  } catch (error: any) {
    console.error("Checkout Transaction Error:", error);
    return { error: error.message || "Error al procesar el pedido." };
  }

  // 5. Redirección Exitosa
  if (orderId) {
    redirect(`/checkout/success?orderId=${orderId}`);
  }

  return { error: "Error desconocido." };
}
