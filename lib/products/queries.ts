import "server-only";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

import { type PublicProductListItem } from "./types";

const publicListSelect = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  currency: true,
  isArchived: true,
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ sort: "asc" }, { id: "asc" }],
    select: { url: true, color: true },
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      size: true,
      color: true,
      colorHex: true,
      stock: true,
      priceCents: true,
    },
  },
} satisfies Prisma.ProductSelect;

/* --- HELPERS DE TRANSFORMACIÓN --- */
function toPublicListItem(row: any): PublicProductListItem {
  const totalStock = row.variants.reduce(
    (acc: number, v: any) => acc + v.stock,
    0,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: row.priceCents,
    currency: (row.currency ?? "EUR") as any,
    isArchived: row.isArchived,
    category: row.category,
    thumbnail: row.images[0]?.url ?? null,
    images: row.images,
    totalStock,
    variants: row.variants,
  };
}

/* =========================================
   1. QUERIES PARA EL ADMIN (Dashboard)
   ========================================= */

type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  query?: string;
  sort?: string;
  categories?: string[];
  status?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getAdminProducts({
  page = 1,
  limit = 15,
  query,
  sort,
  categories = [],
  status,
  minPrice,
  maxPrice,
}: GetAdminProductsParams) {
  const skip = (page - 1) * limit;
  const isArchived = status === "archived";

  // Filtros dinámicos
  const where: Prisma.ProductWhereInput = {
    isArchived,
    ...(categories.length > 0 && { categoryId: { in: categories } }),
    priceCents: { gte: minPrice, lte: maxPrice },
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }),
  };

  // Ordenamiento
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  const isStockSort = sort === "stock_asc" || sort === "stock_desc";

  if (!isStockSort && sort) {
    switch (sort) {
      case "date_asc":
        orderBy = { createdAt: "asc" };
        break;
      case "price_asc":
        orderBy = { priceCents: "asc" };
        break;
      case "price_desc":
        orderBy = { priceCents: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
    }
  }

  const [productsRaw, totalCount, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sort: "asc" }, take: 1 },
      },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Cálculo de stock para el admin
  const products = productsRaw.map((p) => ({
    ...p,
    _totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
  }));

  if (sort === "stock_asc")
    products.sort((a, b) => a._totalStock - b._totalStock);
  if (sort === "stock_desc")
    products.sort((a, b) => b._totalStock - a._totalStock);

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    allCategories,
    grandTotalStock: products.reduce((acc, p) => acc + p._totalStock, 0),
  };
}

// Query para EDITAR un producto en el Admin (necesita todos los datos)
export async function getProductForEdit(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sort: "asc" } },
      variants: { orderBy: { size: "asc" } },
      _count: { select: { orderItems: true } },
    },
  });
}

/* =========================================
   2. QUERIES PÚBLICAS (Tienda)
   ========================================= */

// Catálogo / Grid
export async function getPublicProducts({
  page = 1,
  limit = 12,
  categorySlug,
}: {
  page?: number;
  limit?: number;
  categorySlug?: string;
}) {
  const where: Prisma.ProductWhereInput = {
    isArchived: false,
    ...(categorySlug && { category: { slug: categorySlug } }),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      select: publicListSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return { rows: rows.map(toPublicListItem), total };
}

// Ficha de Producto (Slug)
export async function getProductFullBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      currency: true,
      isArchived: true,
      category: { select: { id: true, slug: true, name: true } },
      images: {
        orderBy: [{ sort: "asc" }],
        select: { id: true, url: true, alt: true, sort: true, color: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
        select: {
          id: true,
          color: true,
          size: true,
          priceCents: true,
          stock: true,
          colorHex: true,
          isActive: true,
        },
      },
    },
  });

  if (!p) return null;

  if (p.isArchived) return null;

  return {
    ...p,
    description: p.description ?? "",
    currency: (p.currency ?? "EUR") as any,
  };
}

export async function getProductSlugs(limit = 1000) {
  return prisma.product.findMany({
    where: { isArchived: false },
    select: { slug: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductMetaBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      images: {
        orderBy: [{ sort: "asc" }],
        select: { url: true, color: true },
      },
    },
  });
}

export async function getMaxPrice() {
  const product = await prisma.product.findFirst({
    orderBy: { priceCents: "desc" },
    select: { priceCents: true },
  });

  return product ? product.priceCents / 100 : 0;
}
