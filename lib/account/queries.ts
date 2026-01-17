import "server-only";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

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
) {
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = { userId };

  if (statusTab) {
    switch (statusTab) {
      // A. PENDIENTES DE PAGO
      case "PENDING_PAYMENT":
        where.paymentStatus = "PENDING";
        where.isCancelled = false;
        break;

      // B. EN PROCESO (Activos)
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

      // D. DEVOLUCIONES
      case "RETURNS":
        where.isCancelled = false;
        where.OR = [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { fulfillmentStatus: "RETURNED" },
          { returnReason: { not: null } },
          { items: { some: { quantityReturnRequested: { gt: 0 } } } },
        ];
        break;

      // E. EXPIRADOS (Por el Cron)
      case "EXPIRED":
        where.isCancelled = true;
        where.paymentStatus = "FAILED";
        where.fulfillmentStatus = "UNFULFILLED";
        break;

      // F. CANCELADOS (Manualmente)
      case "CANCELLED":
        where.isCancelled = true;
        where.OR = [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { fulfillmentStatus: "RETURNED" },
        ];
        break;
    }
  }

  // 3. Ejecución
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
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
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    totalPages: Math.ceil(total / limit),
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
