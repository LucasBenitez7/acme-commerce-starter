"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { CART_COOKIE_NAME, parseCartCookie } from "@/lib/server/cart-cookie";
import { buildOrderDraftFromCart } from "@/lib/server/orders";
import {
  isValidEmail,
  isNonEmptyMin,
  isValidPhone,
} from "@/lib/validation/checkout";

export type CheckoutActionState = {
  error?: string;
};

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const cookieStore = await cookies();
  const rawCart = cookieStore.get(CART_COOKIE_NAME)?.value;
  const lines = parseCartCookie(rawCart);

  if (!lines.length) {
    return {
      error:
        "Tu carrito está vacío. Añade algunos productos antes de finalizar el pedido.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  // Preparado para el futuro (card | whatsapp | manual, etc.)
  const paymentMethodRaw = String(
    formData.get("paymentMethod") ?? "card",
  ).trim();
  const paymentMethod = paymentMethodRaw === "card" ? "card" : "card";

  if (!isValidEmail(email)) {
    return { error: "Introduce un correo electrónico válido." };
  }

  if (!isNonEmptyMin(fullName, 3)) {
    return { error: "Introduce tu nombre y apellidos." };
  }

  if (!isNonEmptyMin(address, 5) || !isNonEmptyMin(city, 2)) {
    return {
      error: "Revisa que hayas completado correctamente tu dirección y ciudad.",
    };
  }

  if (!isValidPhone(phone)) {
    return {
      error:
        "El número de teléfono debe contener solo números y signos habituales (+, espacios, guiones).",
    };
  }

  const draft = await buildOrderDraftFromCart(lines);

  if (!draft.items.length || draft.totalMinor <= 0) {
    return {
      error:
        "No hemos podido recalcular tu pedido. Revisa tu carrito o actualiza la página e inténtalo de nuevo.",
    };
  }

  let order;
  try {
    order = await prisma.order.create({
      data: {
        email,
        currency: draft.currency,
        totalMinor: draft.totalMinor,
        status: "PENDING_PAYMENT",
        items: {
          create: draft.items.map((item) => ({
            productId: item.productId,
            nameSnapshot: item.name,
            priceMinorSnapshot: item.unitPriceMinor,
            quantity: item.quantity,
            subtotalMinor: item.subtotalMinor,
          })),
        },
      },
    });
  } catch (e) {
    console.error("[createOrderAction] Error al crear pedido:", e);
    return {
      error:
        "Ha ocurrido un error al procesar tu pedido. Inténtalo de nuevo en unos minutos.",
    };
  }

  cookieStore.set(CART_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}
