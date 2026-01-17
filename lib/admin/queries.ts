import "server-only";
import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  // 1. Consultas Generales
  const [totalOrders, totalProducts, totalUsers, pendingOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({
        where: {
          paymentStatus: "PENDING",
          isCancelled: false,
        },
      }),
    ]);

  // 2. Consulta Financiera (Ingresos Brutos)
  const financialOrders = await prisma.order.findMany({
    where: {
      paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] },
      isCancelled: false,
    },
    select: {
      totalMinor: true,
      items: {
        select: {
          priceMinorSnapshot: true,
          quantityReturned: true,
        },
      },
    },
  });

  // 3. Cálculos
  let grossRevenue = 0;
  let totalRefunds = 0;
  let returnedItemsCount = 0;

  for (const order of financialOrders) {
    grossRevenue += order.totalMinor;

    const orderRefundValue = order.items.reduce((acc, item) => {
      returnedItemsCount += item.quantityReturned;
      return acc + item.priceMinorSnapshot * item.quantityReturned;
    }, 0);

    totalRefunds += orderRefundValue;
  }

  const netRevenue = grossRevenue - totalRefunds;

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
    grossRevenue,
    totalRefunds,
    netRevenue,
    returnedItemsCount,
  };
}
