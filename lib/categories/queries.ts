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

  const where: Prisma.CategoryWhereInput = {};

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

  // Si hay query, traer más resultados para filtrar en memoria
  const fetchLimit = query ? 100 : limit;
  const fetchSkip = query ? 0 : skip;

  const [categoriesRaw, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { products: true } },
      },
      take: fetchLimit,
      skip: fetchSkip,
    }),
    prisma.category.count({ where }),
  ]);

  // Filtrar por query en memoria si existe
  let categoriesFiltered = categoriesRaw;
  if (query) {
    const { filterByWordMatch } = await import("@/lib/products/utils");
    categoriesFiltered = filterByWordMatch(categoriesRaw, query, (category) => [
      category.name,
    ]);
  }

  // Paginar resultados filtrados
  const totalFiltered = categoriesFiltered.length;
  const categories = query
    ? categoriesFiltered.slice((page - 1) * limit, page * limit)
    : categoriesFiltered;

  return {
    categories,
    totalCount: query ? totalFiltered : totalCount,
    totalPages: Math.ceil((query ? totalFiltered : totalCount) / limit),
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
