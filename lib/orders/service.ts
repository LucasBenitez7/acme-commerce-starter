import "server-only";

import { OrderStatus, ShippingType } from "@prisma/client";

import { SHIPPING_TYPE_MAP } from "@/lib/constants";
import { prisma } from "@/lib/db";

import type { CreateOrderInput } from "./schema";

export async function createOrder(input: CreateOrderInput) {
  const { items, email, firstName, lastName, phone, shippingType } = input;

  return await prisma.$transaction(async (tx) => {
    let calculatedTotal = 0;
    const orderItemsData = [];

    // --- 1. Procesar Items y Stock ---
    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new Error(`Variante no encontrada: ${item.variantId}`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${variant.product.name}. Disponibles: ${variant.stock}`,
        );
      }

      const price = variant.priceCents ?? 0;
      const subtotal = price * item.quantity;
      calculatedTotal += subtotal;

      orderItemsData.push({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        subtotalMinor: subtotal,

        nameSnapshot: variant.product.name,
        priceMinorSnapshot: price,
        sizeSnapshot: variant.size,
        colorSnapshot: variant.color,
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // --- 2. Mapear Dirección y Tipo de Envío ---
    const dbShippingType =
      SHIPPING_TYPE_MAP[shippingType as keyof typeof SHIPPING_TYPE_MAP] ||
      ShippingType.HOME;

    let street: string | null = null;
    let addressExtra: string | null = null;
    let postalCode: string | null = null;
    let city: string | null = null;
    let province: string | null = null;
    let storeLocationId: string | null = null;
    let pickupLocationId: string | null = null;

    if (shippingType === "home") {
      street = input.street;
      addressExtra = input.addressExtra ?? null;
      postalCode = input.postalCode;
      city = input.city;
      province = input.province;
    } else if (shippingType === "store") {
      storeLocationId = input.storeLocationId ?? null;
    } else if (shippingType === "pickup") {
      pickupLocationId = input.pickupLocationId ?? null;
    }

    // --- 3. Crear la Orden ---
    const newOrder = await tx.order.create({
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        email: email,
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
        country: "España",
        storeLocationId,
        pickupLocationId,

        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return newOrder;
  });
}
