import "server-only";
import { type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

import { type FilterOptions, type PublicProductListItem } from "./types";
import { centsToEuros, sortSizes } from "./utils";

const publicListSelect = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  compareAtPrice: true,
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
      colorOrder: true,
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
    compareAtPrice: row.compareAtPrice,
    isArchived: row.isArchived,
    category: row.category,
    thumbnail: row.images[0]?.url ?? null,
    images: row.images,
    totalStock,
    variants: row.variants,
  };
}

// 1. QUERIES PARA EL ADMIN (Dashboard)
type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  query?: string;
  sort?: string;
  categories?: string[];
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
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
  onSale,
}: GetAdminProductsParams) {
  const skip = (page - 1) * limit;
  const isArchived = status === "archived";

  const where: Prisma.ProductWhereInput = {
    isArchived,
    ...(categories.length > 0 && { categoryId: { in: categories } }),
    priceCents: { gte: minPrice, lte: maxPrice },
    ...(onSale && {
      compareAtPrice: { gt: prisma.product.fields.priceCents },
    }),
  };

  let orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };
  const isStockSort = sort === "stock_asc" || sort === "stock_desc";

  if (!isStockSort && sort) {
    switch (sort) {
      case "order_asc":
        orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }];
        break;
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

  // Si hay query, traer más resultados para filtrar en memoria
  const fetchLimit = query ? 200 : limit;
  const fetchSkip = query ? 0 : skip;

  const [productsRaw, totalCount, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sort: "asc" }, take: 1 },
      },
      take: fetchLimit,
      skip: fetchSkip,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  let productsWithStock = productsRaw.map((p) => ({
    ...p,
    _totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
  }));

  // Filtrar por query en memoria si existe
  if (query) {
    const { filterByWordMatch } = await import("@/lib/products/utils");
    productsWithStock = filterByWordMatch(
      productsWithStock,
      query,
      (product) => [product.name, product.description, product.category?.name],
    );
  }

  // Ordenar por stock si corresponde
  if (sort === "stock_asc")
    productsWithStock.sort((a, b) => a._totalStock - b._totalStock);
  if (sort === "stock_desc")
    productsWithStock.sort((a, b) => b._totalStock - a._totalStock);

  // Paginar resultados filtrados
  const totalFiltered = productsWithStock.length;
  const products = query
    ? productsWithStock.slice((page - 1) * limit, page * limit)
    : productsWithStock;

  return {
    products,
    totalCount: query ? totalFiltered : totalCount,
    totalPages: Math.ceil((query ? totalFiltered : totalCount) / limit),
    allCategories,
    grandTotalStock: products.reduce((acc, p) => acc + p._totalStock, 0),
  };
}

// Query para EDITAR un producto
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

// 2. QUERIES PÚBLICAS (Tienda)
export async function getPublicProducts({
  page = 1,
  limit = 12,
  categorySlug,
  sort,
  onlyOnSale,
  sizes,
  colors,
  minPrice,
  maxPrice,
  query,
}: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  onlyOnSale?: boolean;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sort?:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[];
}) {
  const where: Prisma.ProductWhereInput = {
    isArchived: false,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(onlyOnSale && {
      compareAtPrice: { gt: prisma.product.fields.priceCents },
    }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          priceCents: {
            gte: minPrice,
            lte: maxPrice,
          },
        }
      : {}),
    ...((sizes?.length || colors?.length) && {
      variants: {
        some: {
          isActive: true,
          ...(sizes?.length && { size: { in: sizes } }),
          ...(colors?.length && { color: { in: colors } }),
        },
      },
    }),
  };

  const orderBy = sort || [{ sortOrder: "asc" }, { createdAt: "desc" }];

  // Si hay query, traemos más resultados para filtrar por palabras
  const fetchLimit = query ? 200 : limit;
  const fetchSkip = query ? 0 : (page - 1) * limit;

  const [allRows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: fetchLimit,
      skip: fetchSkip,
      select: publicListSelect,
    }),
    prisma.product.count({ where }),
  ]);

  let filteredRows = allRows;
  if (query) {
    const queryWords = query.toLowerCase().trim().split(/\s+/);

    filteredRows = allRows.filter((product) => {
      const nameWords = product.name.toLowerCase().split(/\s+/);
      const categoryWords =
        product.category?.name.toLowerCase().split(/\s+/) || [];
      const allProductWords = [...nameWords, ...categoryWords];

      const matches = queryWords.every((queryWord) => {
        const variants = [queryWord];
        if (queryWord.endsWith("s") && queryWord.length > 2) {
          variants.push(queryWord.slice(0, -1));
        } else if (!queryWord.endsWith("s")) {
          variants.push(queryWord + "s");
        }

        const hasMatch = variants.some((variant) =>
          allProductWords.some((productWord) =>
            productWord.startsWith(variant),
          ),
        );

        return hasMatch;
      });

      return matches;
    });
  }

  // Paginar resultados filtrados
  const totalFiltered = filteredRows.length;
  const paginatedRows = query
    ? filteredRows.slice((page - 1) * limit, page * limit)
    : filteredRows;

  return {
    rows: paginatedRows.map(toPublicListItem),
    total: query ? totalFiltered : total,
  };
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
      compareAtPrice: true,
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
          colorOrder: true,
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

  return product ? centsToEuros(product.priceCents) : 0;
}

export async function getMaxDiscountPercentage() {
  const products = await prisma.product.findMany({
    where: {
      isArchived: false,
      compareAtPrice: { gt: prisma.product.fields.priceCents },
    },
    select: { priceCents: true, compareAtPrice: true },
  });

  if (products.length === 0) return 0;

  let maxDiscount = 0;

  for (const p of products) {
    if (p.compareAtPrice && p.compareAtPrice > p.priceCents) {
      const discount = Math.round(
        ((p.compareAtPrice - p.priceCents) / p.compareAtPrice) * 100,
      );
      if (discount > maxDiscount) maxDiscount = discount;
    }
  }

  return maxDiscount;
}

export async function getFilterOptions(
  categorySlug?: string,
): Promise<FilterOptions> {
  const where = {
    isArchived: false,
    ...(categorySlug && { category: { slug: categorySlug } }),
  };

  // 1. Obtener productos para extraer variantes y precios
  const products = await prisma.product.findMany({
    where,
    select: {
      priceCents: true,
      variants: {
        where: { isActive: true },
        select: {
          size: true,
          color: true,
          colorHex: true,
        },
      },
    },
  });

  const uniqueSizes = new Set<string>();
  const uniqueColorsMap = new Map<string, string>();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  if (products.length === 0) {
    return { sizes: [], colors: [], minPrice: 0, maxPrice: 0 };
  }

  for (const p of products) {
    if (p.priceCents < minPrice) minPrice = p.priceCents;
    if (p.priceCents > maxPrice) maxPrice = p.priceCents;

    for (const v of p.variants) {
      if (v.size) uniqueSizes.add(v.size);
      if (v.color) {
        if (!uniqueColorsMap.has(v.color)) {
          uniqueColorsMap.set(v.color, v.colorHex ?? "#000000");
        }
      }
    }
  }

  const sortedSizes = sortSizes(Array.from(uniqueSizes));

  const sortedColors = Array.from(uniqueColorsMap.entries())
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    sizes: sortedSizes,
    colors: sortedColors,
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice: maxPrice === -Infinity ? 0 : maxPrice,
  };
}
