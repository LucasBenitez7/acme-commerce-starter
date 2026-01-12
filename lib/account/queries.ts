import "server-only";
import { prisma } from "@/lib/db";

import type { UserAddress } from "@prisma/client";

// --- DIRECCIONES ---
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  return await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

// --- PEDIDOS (LISTADO) ---
export async function getUserOrders(userId: string, page = 1, limit = 5) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        items: {
          include: {
            product: { select: { slug: true } },
          },
        },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    totalPages: Math.ceil(total / limit),
  };
}

// --- PEDIDO (DETALLE) ---
export async function getUserOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
    include: { items: true },
  });
  return order;
}
