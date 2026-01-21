import "server-only";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const [
    totalOrders,
    totalProducts,
    activeProducts,
    totalUsers,
    pendingOrders,
    totalVariants,
    stockAgg,
    outOfStockCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.count({ where: { isArchived: false } }),
    prisma.user.count(),
    prisma.order.count({
      where: { paymentStatus: "PENDING", isCancelled: false },
    }),

    prisma.productVariant.count({
      where: { product: { isArchived: false } },
    }),

    prisma.productVariant.aggregate({
      _sum: { stock: true },
      where: { product: { isArchived: false } },
    }),

    prisma.productVariant.count({
      where: { stock: 0, product: { isArchived: false } },
    }),
  ]);

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
    grossRevenue,
    totalRefunds,
    netRevenue,

    totalOrders,
    pendingOrders,
    totalUsers,
    returnedItemsCount,

    totalProducts,
    activeProducts,
    archivedProducts: totalProducts - activeProducts,

    totalVariants,
    totalStock: stockAgg._sum.stock || 0,
    outOfStockVariants: outOfStockCount,
  };
}

export async function getAdminUsers({
  page = 1,
  limit = 10,
  query,
  role,
  sort,
}: {
  page?: number;
  limit?: number;
  query?: string;
  role?: string;
  sort?: string;
}) {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { id: { equals: query } },
      ],
    }),
    ...(role && {
      role: role,
    }),
  };

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

  if (sort) {
    const [field, direction] = sort.split("-");
    if (field === "name") {
      orderBy = { name: direction as "asc" | "desc" };
    } else if (field === "createdAt") {
      orderBy = { createdAt: direction as "asc" | "desc" };
    }
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getAdminUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: { isDefault: "desc" },
      },
      orders: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!user) return null;

  const totalSpentAgg = await prisma.order.aggregate({
    where: {
      userId: userId,
      paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] },
      isCancelled: false,
    },
    _sum: { totalMinor: true },
  });

  return {
    user,
    stats: {
      totalOrders: user._count.orders,
      totalSpentMinor: totalSpentAgg._sum.totalMinor || 0,
    },
  };
}
