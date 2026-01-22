import "server-only";

import { type Prisma } from "@prisma/client";

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
  paymentFilter,
  fulfillmentFilter,
  sort,
  query,
}: GetOrdersParams) {
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  // --- 1. BUSCADOR GLOBAL ---
  if (query) {
    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  // --- 2. FILTROS DEL TOOLBAR (Payment / Logistics) ---
  // Solo aplicamos esto si NO estamos en un Tab especial que sobrescriba la lógica
  if (paymentFilter && paymentFilter.length > 0) {
    where.paymentStatus = { in: paymentFilter };
  }
  if (fulfillmentFilter && fulfillmentFilter.length > 0) {
    where.fulfillmentStatus = { in: fulfillmentFilter };
  }

  // --- 3. LÓGICA DE TABS (Aquí estaba el fallo) ---
  if (statusTab) {
    switch (statusTab) {
      // A. PENDIENTES DE PAGO
      case "PENDING_PAYMENT":
        where.paymentStatus = "PENDING";
        where.isCancelled = false;
        break;

      // B. EN PROCESO (OJO: Aquí corregí "IN_PROGRESS" por "ACTIVE")
      case "ACTIVE":
        where.paymentStatus = "PAID";
        where.isCancelled = false;
        // Solo mostramos lo que NO ha sido entregado ni devuelto
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
      // Solo mostramos pedidos que fueron PAGADOS y luego Reembolsados
      case "RETURNS":
        where.isCancelled = false; // Si está cancelado manual, va al otro tab
        where.paymentStatus = { in: ["REFUNDED", "PARTIALLY_REFUNDED"] };
        break;

      // E. EXPIRADOS (Lógica del Cron)
      // Cancelado + Fallido + Logística SIN TOCAR (Unfulfilled)
      case "EXPIRED":
        where.isCancelled = true;
        where.paymentStatus = "FAILED";
        where.fulfillmentStatus = "UNFULFILLED";
        break;

      // F. CANCELADOS (Manuales)
      // Aquí entran los que tú cancelaste a mano siendo pendientes.
      // (Si cancelas uno pagado, se convierte en REFUNDED y va al tab RETURNS)
      case "CANCELLED":
        where.isCancelled = true;
        // Para diferenciarlo del expirado: El manual tiene "RETURNED" en logística
        // o si permites cancelar sin reembolso (raro), lo cazamos aquí.
        where.OR = [
          { fulfillmentStatus: "RETURNED" },
          { paymentStatus: { not: "FAILED" } }, // Por si acaso hay un cancelado raro
        ];
        break;
    }
  }

  // 4. Ordenamiento
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

  // 5. Ejecución
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

  // 6. Mapeo a DTO (Igual que tenías)
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
    };
  });

  return { orders, total, totalPages: Math.ceil(total / limit) };
}

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

// Helper ligero para devoluciones
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
