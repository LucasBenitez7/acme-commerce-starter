import "server-only";
import { prisma } from "@/lib/db";

import type { Prisma } from "@prisma/client";

export const productListSelect = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  currency: true,
  images: {
    orderBy: [{ sort: "asc" }, { id: "asc" }],
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string | null;
  images: { url: string }[];
};

export async function fetchNewest({ take }: { take: number }) {
  return prisma.product.findMany({
    select: productListSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function fetchProductsPage({
  page,
  perPage,
  where,
}: {
  page: number;
  perPage: number;
  where?: Prisma.ProductWhereInput;
}) {
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: perPage,
      skip: (page - 1) * perPage,
      select: productListSelect,
    }),
    prisma.product.count({ where }),
  ]);
  return { rows, total };
}
