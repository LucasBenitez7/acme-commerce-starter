import "server-only";

import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";

import {
  type GetOrdersParams,
  type AdminOrderListItem,
  type AdminOrderDetail,
} from "./types";

export async function getAdminOrders({
  page = 1,
  limit = 20,
  statusTab,
  paymentFilter,
  fulfillmentFilter,
  sort,
  query,
}: GetOrdersParams) {
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  const hasPaymentFilter = paymentFilter && paymentFilter.length > 0;

  if (!statusTab && !hasPaymentFilter && !query) {
    where.paymentStatus = { not: "PENDING" };
  }

  if (query) {
    if (!statusTab && !hasPaymentFilter) delete where.paymentStatus;

    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  if (hasPaymentFilter) {
    const expandedFilter = new Set(paymentFilter);
    if (expandedFilter.has("PAID")) {
      expandedFilter.add("REFUNDED");
      expandedFilter.add("PARTIALLY_REFUNDED");
    }
    where.paymentStatus = { in: Array.from(expandedFilter) };
  }
  if (fulfillmentFilter && fulfillmentFilter.length > 0) {
    where.fulfillmentStatus = { in: fulfillmentFilter };
  }

  if (statusTab) {
    switch (statusTab) {
      // A. PENDIENTES DE PAGO
      case "PENDING_PAYMENT":
        where.paymentStatus = "FAILED";
        where.isCancelled = false;
        break;

      // B. EN PROCESO
      case "ACTIVE":
        where.paymentStatus = "PAID";
        where.isCancelled = false;
        where.fulfillmentStatus = {
          in: ["UNFULFILLED", "PREPARING", "READY_FOR_PICKUP", "SHIPPED"],
        };
        break;

      // C. ENTREGADOS
      case "COMPLETED":
        where.fulfillmentStatus = "DELIVERED";
        where.isCancelled = false;
        break;

      // D. DEVOLUCIONES / REEMBOLSOS
      case "RETURNS":
        where.isCancelled = false;
        where.OR = [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { fulfillmentStatus: "RETURNED" },
          {
            history: {
              some: {
                snapshotStatus: SYSTEM_MSGS.RETURN_REQUESTED,
              },
            },
          },
        ];
        break;

      // E. EXPIRADOS
      case "EXPIRED":
        where.isCancelled = true;
        where.paymentStatus = "FAILED";
        where.fulfillmentStatus = "UNFULFILLED";
        break;

      // F. CANCELADOS
      case "CANCELLED":
        where.isCancelled = true;
        where.OR = [
          { fulfillmentStatus: "RETURNED" },
          { paymentStatus: { not: "FAILED" } },
        ];
        break;
    }
  }

  // 5. ORDENAMIENTO
  let orderBy:
    | Prisma.OrderOrderByWithRelationInput
    | Prisma.OrderOrderByWithRelationInput[] = { createdAt: "desc" };

  switch (sort) {
    case "date_asc":
      orderBy = { createdAt: "asc" };
      break;
    case "total_desc":
      orderBy = { totalMinor: "desc" };
      break;
    case "total_asc":
      orderBy = { totalMinor: "asc" };
      break;
    case "customer_asc":
      orderBy = [{ firstName: "asc" }, { lastName: "asc" }];
      break;
    case "customer_desc":
      orderBy = [{ firstName: "desc" }, { lastName: "desc" }];
      break;
  }

  // 6. EJECUCIÓN DB
  const [ordersRaw, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      include: {
        user: { select: { name: true, email: true, image: true } },
        items: {
          select: { priceMinorSnapshot: true, quantityReturned: true },
        },
        history: {
          select: { snapshotStatus: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  // 7. MAPEO A DTO (Formato para la tabla)
  const orders: AdminOrderListItem[] = ordersRaw.map((o) => {
    const refundedAmount = o.items.reduce(
      (acc, item) => acc + item.priceMinorSnapshot * item.quantityReturned,
      0,
    );

    return {
      id: o.id,
      createdAt: o.createdAt,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      isCancelled: o.isCancelled,
      totalMinor: o.totalMinor,
      currency: o.currency,
      itemsCount: o.items.length,
      refundedAmountMinor: refundedAmount,
      netTotalMinor: o.totalMinor - refundedAmount,
      user: o.user
        ? {
            name: o.user.name,
            email: o.user.email,
            image: o.user.image,
          }
        : null,
      guestInfo: {
        firstName: o.firstName,
        lastName: o.lastName,
        email: o.email,
      },
      history: o.history,
    };
  });

  return { orders, total, totalPages: Math.ceil(total / limit) };
}

// --- DETALLE DE PEDIDO (ADMIN) ---
export async function getAdminOrderById(
  id: string,
): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              compareAtPrice: true,
              images: {
                select: { url: true, color: true },
                orderBy: { sort: "asc" },
              },
            },
          },
        },
      },
      user: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return null;

  const returnedAmountMinor = order.items.reduce(
    (acc, item) => acc + item.priceMinorSnapshot * item.quantityReturned,
    0,
  );
  const originalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const returnedQty = order.items.reduce(
    (acc, i) => acc + i.quantityReturned,
    0,
  );

  return {
    ...order,
    summary: {
      originalQty,
      returnedQty,
      refundedAmountMinor: returnedAmountMinor,
      netTotalMinor: order.totalMinor - returnedAmountMinor,
    },
  };
}

// Helper para devoluciones
export async function getOrderForReturn(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              images: {
                select: { url: true, color: true },
                orderBy: { sort: "asc" },
              },
            },
          },
        },
      },
    },
  });
  return order;
}
