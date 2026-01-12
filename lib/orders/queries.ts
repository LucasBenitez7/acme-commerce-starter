import "server-only";

import { type Prisma, type OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

import {
  type GetOrdersParams,
  type AdminOrderListItem,
  type AdminOrderDetail,
} from "./types";

export async function getAdminOrders({
  page = 1,
  limit = 20,
  statusTab,
  statusFilter,
  sort,
  query,
}: GetOrdersParams) {
  const skip = (page - 1) * limit;

  // 1. Construcción del WHERE
  const where: Prisma.OrderWhereInput = {};

  // A. Búsqueda por texto (ID, Email, Nombre)
  if (query) {
    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  // B. Filtros de Estado (Prioridad: Filtro explícito > Tabs)
  if (statusFilter && statusFilter.length > 0) {
    where.status = { in: statusFilter };
  } else if (statusTab) {
    if (statusTab === "PAID") {
      where.status = { in: ["PAID", "RETURN_REQUESTED"] };
    } else if (statusTab === "RETURNS") {
      where.OR = [
        { status: "RETURN_REQUESTED" },
        { status: "RETURNED" },
        {
          status: "PAID",
          items: { some: { quantityReturned: { gt: 0 } } },
        },
      ];
    } else {
      where.status = statusTab as OrderStatus;
    }
  }

  // 2. Ordenamiento
  let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
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
  }

  // 3. Consulta a DB
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
      },
    }),
    prisma.order.count({ where }),
  ]);

  const orders: AdminOrderListItem[] = ordersRaw.map((o) => {
    const refundedAmount = o.items.reduce(
      (acc, item) => acc + item.priceMinorSnapshot * item.quantityReturned,
      0,
    );

    return {
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
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
    };
  });

  return { orders, total, totalPages: Math.ceil(total / limit) };
}

// --- Detalle de Orden ---
export async function getAdminOrderById(
  id: string,
): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
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

export async function getOrderFullDetails(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: {
                orderBy: { sort: "asc" },
                select: { url: true, color: true },
              },
            },
          },
        },
      },

      history: { orderBy: { createdAt: "desc" } },
    },
  });
}

// --- Query Ligera para Pantalla de Devolución ---
export async function getOrderForReturn(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) return null;

  return order;
}
