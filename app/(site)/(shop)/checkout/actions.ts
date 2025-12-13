"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CART_COOKIE_NAME, parseCartCookie } from "@/lib/server/cart-cookie";
import { buildOrderDraftFromCart } from "@/lib/server/orders";
import { InventoryService } from "@/lib/services/inventory.service";
import { checkoutSchema } from "@/lib/validation/checkout";

export type CheckoutActionState = {
  error?: string;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  // 1. Obtener usuario (si existe)
  const session = await auth();
  let userId: string | null = null;

  if (session?.user?.id) {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (userExists) userId = userExists.id;
  }

  // 2. Obtener carrito
  const cookieStore = await cookies();
  const rawCart = cookieStore.get(CART_COOKIE_NAME)?.value;
  const lines = parseCartCookie(rawCart);

  if (!lines.length) {
    return { error: "Tu carrito está vacío." };
  }

  // 3. Validar Datos con Zod (¡Usando tu esquema nuevo!)
  const rawData = Object.fromEntries(formData.entries());
  const validation = checkoutSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const data = validation.data;

  // 4. Construir borrador de orden (cálculos de precio)
  const draft = await buildOrderDraftFromCart(lines);

  // 5. Crear Orden + Transacción Atómica
  let orderId: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      const itemsToCheck = draft.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      await InventoryService.validateStock(itemsToCheck);

      await InventoryService.updateStock(itemsToCheck, "decrement", tx);

      let shippingTypeDb: "HOME" | "STORE" | "PICKUP" = "HOME";
      if (data.shippingType === "store") shippingTypeDb = "STORE";
      if (data.shippingType === "pickup") shippingTypeDb = "PICKUP";

      // C) Crear la Orden
      const order = await tx.order.create({
        data: {
          userId,
          status: "PAID",
          totalMinor: draft.totalMinor,
          currency: draft.currency,

          // Datos validados
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,

          shippingType: shippingTypeDb,
          street: data.street || null,
          addressExtra: data.addressExtra || null,
          postalCode: data.postalCode || null,
          province: data.province || null,
          city: data.city || null,
          storeLocationId: data.storeLocationId || null,
          pickupLocationId: data.pickupLocationId || null,
          pickupSearch: data.pickupSearch || null,

          paymentMethod: data.paymentMethod,

          items: {
            create: draft.items.map((item) => {
              const parts = item.variantName
                ? item.variantName.split(" / ")
                : [];
              const size = parts[0] || null;
              const color = parts[1] || null;

              return {
                productId: item.productId,
                variantId: item.variantId,
                nameSnapshot: item.name,
                sizeSnapshot: size,
                colorSnapshot: color,
                priceMinorSnapshot: item.unitPriceMinor,
                quantity: item.quantity,
                subtotalMinor: item.subtotalMinor,
              };
            }),
          },

          // Historial inicial
          history: {
            create: {
              status: "PAID",
              reason: "Pedido creado correctamente",
              actor: "system",
            },
          },
        },
      });

      orderId = order.id;
    });
  } catch (e: any) {
    console.error("[CreateOrder] Error:", e);
    if (e.message && e.message.includes("Stock insuficiente")) {
      return { error: e.message };
    }
    return {
      error: "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.",
    };
  }

  // 6. Limpiar cookie y redirigir (fuera del try/catch)
  if (orderId) {
    cookieStore.set(CART_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    redirect(`/checkout/success?orderId=${orderId}`);
  }

  return { error: "Error desconocido al crear el pedido." };
}
