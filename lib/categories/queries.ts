import "server-only";

import { type Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

import { type AdminCategoryFilters } from "./types";

export const getHeaderCategories = unstable_cache(
  async () => {
    const cats = await prisma.category.findMany({
      orderBy: { sort: "asc" },
      select: { slug: true, name: true },
    });
    return cats.map((c) => ({ slug: c.slug, label: c.name }));
  },
  ["header-categories-key"],
  {
    revalidate: 3600,
    tags: ["header-categories"],
  },
);
export async function getCategoryBySlug(slug: string) {
  if (!slug) return null;
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
}

export async function getAdminCategories({
  page = 1,
  limit = 20,
  query,
  sortBy = "sort",
  sortOrder = "asc",
  filter = "all",
}: AdminCategoryFilters) {
  const skip = (page - 1) * limit;

  // 1. Construir WHERE
  const where: Prisma.CategoryWhereInput = {};

  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  if (filter === "with_products") {
    where.products = { some: {} };
  } else if (filter === "empty") {
    where.products = { none: {} };
  } else if (filter === "featured") {
    where.isFeatured = true;
  }

  // 2. Construir ORDER BY
  let orderBy: Prisma.CategoryOrderByWithRelationInput = {};
  if (sortBy === "products") {
    orderBy = { products: { _count: sortOrder } };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { products: true } },
      },
      take: limit,
      skip,
    }),
    prisma.category.count({ where }),
  ]);

  return {
    categories,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getCategoryForEdit(id: string) {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryOrderList() {
  return prisma.category.findMany({
    select: { id: true, name: true, sort: true, isFeatured: true },
    orderBy: { sort: "asc" },
  });
}
