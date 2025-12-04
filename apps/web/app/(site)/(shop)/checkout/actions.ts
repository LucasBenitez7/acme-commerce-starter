"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

<<<<<<< HEAD
import { auth } from "@/lib/auth";
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
import { prisma } from "@/lib/db";
import { CART_COOKIE_NAME, parseCartCookie } from "@/lib/server/cart-cookie";
import { buildOrderDraftFromCart } from "@/lib/server/orders";
import {
  isValidEmail,
  isNonEmptyMin,
  isValidPhone,
  isValidPostalCodeES,
} from "@/lib/validation/checkout";

import type { ShippingType as ShippingTypeDb } from "@prisma/client";

export type CheckoutActionState = {
  error?: string;
};

type ShippingType = "home" | "store" | "pickup";

export async function createOrderAction(
  prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
<<<<<<< HEAD
  const session = await auth();
  let userId: string | null = null;

  if (session?.user?.id) {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (userExists) {
      userId = userExists.id;
    } else {
      console.warn(
        "Usuario de sesión no encontrado en DB. Creando orden como invitado.",
      );
    }
  }

=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  const cookieStore = await cookies();
  const rawCart = cookieStore.get(CART_COOKIE_NAME)?.value;
  const lines = parseCartCookie(rawCart);

  if (!lines.length) {
    return {
      error:
        "Tu cesta está vacía. Añade algunos productos antes de finalizar el pedido.",
    };
  }

<<<<<<< HEAD
  // 2. Recoger datos del formulario
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const addressExtra = String(formData.get("addressExtra") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  const shippingTypeRaw = String(formData.get("shippingType") ?? "home").trim();

  let shippingType: ShippingType = "home";
  if (shippingTypeRaw === "store" || shippingTypeRaw === "pickup") {
    shippingType = shippingTypeRaw;
  }

  const shippingTypeDb: ShippingTypeDb =
    shippingType === "home"
      ? "HOME"
      : shippingType === "store"
        ? "STORE"
        : "PICKUP";

  const storeLocationId = String(formData.get("storeLocationId") ?? "").trim();
<<<<<<< HEAD
  const pickupLocationId = String(
    formData.get("pickupLocationId") ?? "",
  ).trim();
  const pickupSearch = String(formData.get("pickupSearch") ?? "").trim();
  const paymentMethodRaw = String(
    formData.get("paymentMethod") ?? "card",
  ).trim();
  const paymentMethod = paymentMethodRaw === "card" ? "card" : "card";

  // 3. Validaciones de campos
  if (!isNonEmptyMin(firstName, 2)) return { error: "Introduce tu nombre." };
  if (!isNonEmptyMin(lastName, 2)) return { error: "Introduce tus apellidos." };
  if (!isValidEmail(email)) return { error: "Introduce un email válido." };
  if (!isValidPhone(phone)) return { error: "Introduce un teléfono válido." };

  if (shippingType === "home") {
    if (!isNonEmptyMin(street, 5))
      return { error: "Introduce una dirección completa." };
    if (!isValidPostalCodeES(postalCode))
      return { error: "Código postal inválido." };
    if (!isNonEmptyMin(province, 2) || !isNonEmptyMin(city, 2))
      return { error: "Falta ciudad o provincia." };
  } else if (shippingType === "store" && !storeLocationId) {
    return { error: "Selecciona una tienda." };
  } else if (shippingType === "pickup" && !pickupLocationId) {
    return { error: "Selecciona un punto de recogida." };
  }

  // 4. Construir borrador del pedido (Aquí se validan existencias generales)
=======

  const pickupLocationId = String(
    formData.get("pickupLocationId") ?? "",
  ).trim();

  const storeSearch = String(formData.get("storeSearch") ?? "").trim();
  const pickupSearch = String(formData.get("pickupSearch") ?? "").trim();

  const paymentMethodRaw = String(
    formData.get("paymentMethod") ?? "card",
  ).trim();

  // Por ahora sólo aceptamos "card", pero dejamos preparado para el futuro
  const paymentMethod = paymentMethodRaw === "card" ? "card" : "card";

  // ------------------------
  // Validaciones básicas
  // ------------------------
  if (!isNonEmptyMin(firstName, 2)) {
    return { error: "Introduce tu nombre." };
  }

  if (!isNonEmptyMin(lastName, 2)) {
    return { error: "Introduce tus apellidos." };
  }

  if (!isValidEmail(email)) {
    return { error: "Introduce un correo electrónico válido." };
  }

  if (!isValidPhone(phone)) {
    return {
      error:
        "Introduce un número de teléfono válido (solo números y signos habituales).",
    };
  }

  // ------------------------
  // Validaciones según tipo de envío
  // ------------------------
  if (shippingType === "home") {
    if (!isNonEmptyMin(street, 5)) {
      return {
        error:
          "Introduce una dirección de envío más detallada (calle y número).",
      };
    }

    if (!isValidPostalCodeES(postalCode)) {
      return {
        error: "Introduce un código postal español válido (5 dígitos).",
      };
    }

    if (!isNonEmptyMin(province, 2) || !isNonEmptyMin(city, 2)) {
      return {
        error: "Revisa que hayas completado correctamente provincia y ciudad.",
      };
    }
  } else if (shippingType === "store") {
    if (!storeLocationId) {
      return {
        error: "Selecciona una tienda para recoger tu pedido.",
      };
    }
  } else if (shippingType === "pickup") {
    if (!pickupLocationId) {
      return {
        error: "Selecciona un punto de recogida para tu pedido.",
      };
    }

    if (!isNonEmptyMin(pickupSearch, 3)) {
      return {
        error: "Introduce un código postal o zona para el punto de recogida.",
      };
    }
  }

  // ------------------------
  // Recalcular pedido a partir del cesta
  // ------------------------
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  const draft = await buildOrderDraftFromCart(lines);

  if (!draft.items.length || draft.totalMinor <= 0) {
    return {
      error:
<<<<<<< HEAD
        "No hemos podido recalcular tu pedido. Revisa tu cesta o actualiza la página.",
    };
  }

  // 5. TRANSACCIÓN: Validar Stock real, Restar y Crear Orden
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of draft.items) {
        // A) Buscar la variante específica para asegurar stock
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, size: true, color: true },
        });

        if (!variant) {
          throw new Error(
            `El producto "${item.name}" (${item.variantName}) ya no está disponible.`,
          );
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${item.name} (${item.variantName})". Solo quedan ${variant.stock} unidades.`,
          );
        }

        // B) Restar stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // C) Crear la orden
      return await tx.order.create({
        data: {
          userId,
          email,
          currency: draft.currency,
          totalMinor: draft.totalMinor,
          status: "PENDING_PAYMENT",
          shippingType: shippingTypeDb,
          firstName,
          lastName,
          phone,
          street,
          addressExtra,
          postalCode,
          province,
          city,
          storeLocationId: storeLocationId || null,
          pickupLocationId: pickupLocationId || null,
          pickupSearch: pickupSearch || null,
          paymentMethod,

          items: {
            create: draft.items.map((item) => {
              const parts = item.variantName.split(" / ");
              const size = parts[0] || "";
              const color = parts[1] || "";

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
        },
      });
    });
  } catch (e: any) {
    console.error("[createOrderAction] Error:", e);
    // Mostrar mensaje amigable si es error de stock, sino genérico
    const message = e.message.includes("Stock insuficiente")
      ? e.message
      : "Ha ocurrido un error al procesar tu pedido. Inténtalo de nuevo.";
    return { error: message };
  }

  // 6. Limpiar cookie y redirigir
=======
        "No hemos podido recalcular tu pedido. Revisa tu cesta o actualiza la página e inténtalo de nuevo.",
    };
  }

  // ------------------------
  // Crear pedido en base de datos
  // ------------------------
  let order;
  try {
    order = await prisma.order.create({
      data: {
        email,
        currency: draft.currency,
        totalMinor: draft.totalMinor,
        status: "PENDING_PAYMENT",
        shippingType: shippingTypeDb,
        firstName,
        lastName,
        phone,
        street,
        addressExtra,
        postalCode,
        province,
        city,
        storeLocationId: storeLocationId || null,
        pickupLocationId: pickupLocationId || null,
        pickupSearch: pickupSearch || null,
        paymentMethod,

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

  // Vaciar cesta
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  cookieStore.set(CART_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}
