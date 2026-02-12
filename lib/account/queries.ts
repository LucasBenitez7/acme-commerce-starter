import "server-only";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";

// --- DIRECCIONES ---
export async function getUserAddresses(userId: string) {
  return await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

// --- PEDIDOS (LISTADO) ---
export async function getUserOrders(
  userId: string,
  page = 1,
  limit = 5,
  statusTab?: string,
  query?: string,
) {
  const skip = (page - 1) * limit;

  const baseWhere: Prisma.OrderWhereInput = {
    userId,
    paymentStatus: {
      not: "PENDING",
    },
    ...(query && {
      OR: [
        { id: { contains: query, mode: "insensitive" } },
        {
          items: {
            some: {
              nameSnapshot: { contains: query, mode: "insensitive" },
            },
          },
        },
      ],
    }),
  };

  const currentTabWhere: Prisma.OrderWhereInput = { ...baseWhere };

  if (statusTab) {
    switch (statusTab) {
      case "PENDING_PAYMENT":
        currentTabWhere.paymentStatus = "FAILED";
        currentTabWhere.isCancelled = false;
        break;

      case "ACTIVE":
        currentTabWhere.paymentStatus = "PAID";
        currentTabWhere.isCancelled = false;
        currentTabWhere.fulfillmentStatus = {
          in: ["UNFULFILLED", "PREPARING", "READY_FOR_PICKUP", "SHIPPED"],
        };
        break;

      case "COMPLETED":
        currentTabWhere.fulfillmentStatus = "DELIVERED";
        currentTabWhere.isCancelled = false;
        break;

      case "RETURNS":
        currentTabWhere.isCancelled = false;

        const returnsConditions = [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { fulfillmentStatus: "RETURNED" },
          { items: { some: { quantityReturnRequested: { gt: 0 } } } },
          {
            history: {
              some: { snapshotStatus: SYSTEM_MSGS.RETURN_REQUESTED },
            },
          },
        ];

        if (query) {
          currentTabWhere.AND = [
            { OR: baseWhere.OR },
            { OR: returnsConditions as any },
          ];
          delete (currentTabWhere as any).OR;
        } else {
          currentTabWhere.OR = returnsConditions as any;
        }
        break;

      case "EXPIRED":
        currentTabWhere.isCancelled = true;
        currentTabWhere.paymentStatus = "FAILED";
        currentTabWhere.fulfillmentStatus = "UNFULFILLED";
        break;

      case "CANCELLED":
        currentTabWhere.isCancelled = true;
        const cancelledConditions = [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { fulfillmentStatus: "RETURNED" },
        ];

        if (query) {
          currentTabWhere.AND = [
            { OR: baseWhere.OR },
            { OR: cancelledConditions as any },
          ];
          delete currentTabWhere.OR;
        } else {
          currentTabWhere.OR = cancelledConditions as any;
        }
        break;
    }
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: currentTabWhere,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                compareAtPrice: true,
                images: {
                  select: { url: true, color: true },
                  orderBy: { sort: "asc" },
                },
              },
            },
          },
        },
      },
    }),

    prisma.order.count({ where: currentTabWhere }),
  ]);

  return {
    orders,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

// --- PEDIDO (DETALLE SIMPLE) ---
export async function getUserOrderById(userId: string, orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

// --- PEDIDO (DETALLE COMPLETO) ---
export async function getUserOrderFullDetails(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              compareAtPrice: true,
              images: {
                select: { url: true, color: true },
                orderBy: { sort: "asc" },
              },
            },
          },
        },
      },
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order || order.userId !== userId) {
    return null;
  }
  const originalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);

  let returnedQty = order.items.reduce((acc, i) => acc + i.quantityReturned, 0);

  let refundedAmountMinor = order.items.reduce(
    (acc, item) => acc + item.priceMinorSnapshot * item.quantityReturned,
    0,
  );

  if (order.paymentStatus === "REFUNDED" && refundedAmountMinor === 0) {
    refundedAmountMinor = order.totalMinor;
    returnedQty = originalQty;
  }

  return {
    ...order,
    summary: {
      originalQty,
      returnedQty,
      refundedAmountMinor,
      netTotalMinor: order.totalMinor - refundedAmountMinor,
    },
  };
}

// --- PEDIDO (SUCCESS PAGE) ---
export async function getOrderSuccessDetails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              compareAtPrice: true,
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
