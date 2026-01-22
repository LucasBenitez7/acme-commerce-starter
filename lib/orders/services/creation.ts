import "server-only";
import { PaymentStatus, FulfillmentStatus, ShippingType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { SHIPPING_TYPE_MAP } from "@/lib/locations";

import type { CreateOrderInput } from "../schema";

export async function createOrder(input: CreateOrderInput, userId?: string) {
  const { cartItems, email, firstName, lastName, phone, shippingType } = input;

  return await prisma.$transaction(async (tx) => {
    let calculatedTotal = 0;
    const orderItemsData = [];

    // --- 1. Procesar Items ---
    for (const item of cartItems) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new Error(`El producto con ID ${item.variantId} ya no existe.`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${variant.product.name} (${variant.size}). Disponibles: ${variant.stock}`,
        );
      }

      const unitPriceCents = variant.priceCents ?? variant.product.priceCents;

      const subtotal = unitPriceCents * item.quantity;
      calculatedTotal += subtotal;

      orderItemsData.push({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        subtotalMinor: subtotal,
        nameSnapshot: variant.product.name,
        priceMinorSnapshot: unitPriceCents,
        sizeSnapshot: variant.size,
        colorSnapshot: variant.color,
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // --- 2. Mapear Dirección ---
    const dbShippingType = SHIPPING_TYPE_MAP[shippingType] || ShippingType.HOME;

    let street: string | null = null;
    let addressExtra: string | null = null;
    let postalCode: string | null = null;
    let city: string | null = null;
    let province: string | null = null;
    let storeLocationId: string | null = null;
    let pickupLocationId: string | null = null;

    if (input.shippingType === "home") {
      street = input.street;
      addressExtra = input.details ?? null;
      postalCode = input.postalCode;
      city = input.city;
      province = input.province;

      if (!input.country) input.country = "España";
    } else if (input.shippingType === "store") {
      storeLocationId = input.storeLocationId;
    } else if (input.shippingType === "pickup") {
      pickupLocationId = input.pickupLocationId;
    }

    // --- 3. Crear Orden ---
    const newOrder = await tx.order.create({
      data: {
        userId: userId,
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        email,
        currency: "EUR",
        itemsTotalMinor: calculatedTotal,
        shippingCostMinor: 0,
        taxMinor: 0,
        totalMinor: calculatedTotal,
        firstName,
        lastName,
        phone,
        paymentMethod: input.paymentMethod,
        shippingType: dbShippingType,
        street,
        addressExtra,
        postalCode,
        city,
        province,
        country: input.country || "España",
        storeLocationId,
        pickupLocationId,
        items: {
          create: orderItemsData,
        },
      },
    });

    await tx.orderHistory.create({
      data: {
        orderId: newOrder.id,
        type: "STATUS_CHANGE",
        snapshotStatus: "Pedido Creado",
        actor: userId ? "user" : "guest",
        reason: "Creación del pedido",
      },
    });

    return newOrder;
  });
}
