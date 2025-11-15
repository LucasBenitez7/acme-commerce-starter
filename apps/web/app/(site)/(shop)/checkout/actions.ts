"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { CART_COOKIE_NAME, parseCartCookie } from "@/lib/server/cart-cookie";
import { buildOrderDraftFromCart } from "@/lib/server/orders";

export async function createOrderAction(formData: FormData) {
  const cookieStore = await cookies();
  const rawCart = cookieStore.get(CART_COOKIE_NAME)?.value;

  const lines = parseCartCookie(rawCart);

  if (!lines.length) {
    redirect("/cart");
  }

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email) {
    // Para MVP, si falta email volvemos al checkout.
    redirect("/checkout?error=missing_email");
  }

  const draft = await buildOrderDraftFromCart(lines);

  if (!draft.items.length || draft.totalMinor <= 0) {
    redirect("/cart");
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        email,
        currency: draft.currency,
        totalMinor: draft.totalMinor,
        status: "PENDING_PAYMENT", // enum OrderStatus
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

    return created;
  });

  // Limpia la cookie del carrito
  cookieStore.set(CART_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}
