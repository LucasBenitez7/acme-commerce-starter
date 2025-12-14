import "server-only";
import { prisma } from "@/lib/db";

import type { OrderStatus } from "@prisma/client";

export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      history: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 1,
        include: { product: true },
      },
    },
  });
}

export async function getAdminOrders(
  page = 1,
  perPage = 20,
  status?: OrderStatus,
) {
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total };
}
