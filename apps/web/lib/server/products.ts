import "server-only";
import { prisma } from "@/lib/db";

import { type SupportedCurrency } from "../currency";

import type {
  ProductDetail,
  ProductImage,
  ProductListItem,
} from "@/types/catalog";
import type { Prisma } from "@prisma/client";

/* ----------------------------- Helpers ----------------------------- */
function normalizeImages(
  productName: string,
  images: Array<{ url: string; alt: string | null; sort: number | null }>,
  fallbackUrl = "/og/default-products.jpg",
): ProductImage[] {
  if (!images || images.length === 0) {
    return [
      {
        url: fallbackUrl,
        alt: `Imagen de ${productName}`,
        sort: 0,
      },
    ];
  }
  return images.map((img, idx) => ({
    url: img.url,
    alt: img.alt && img.alt.trim() ? img.alt : `Imagen de ${productName}`,
    ...(typeof img.sort === "number" ? { sort: img.sort } : { sort: idx }),
  }));
}

function toListItem(row: {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string | null;
  images: { url: string }[];
}): ProductListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: row.priceCents,
    currency: (row.currency ?? "EUR") as SupportedCurrency,
    thumbnail: row.images[0]?.url ?? null,
  };
}

/* ------------------------ Selects / Proyecciones ------------------------ */
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

/* ------------------------------- Queries ------------------------------- */
export async function fetchNewest({
  take,
}: {
  take: number;
}): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    select: productListSelect,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toListItem);
}

export async function fetchProductsPage({
  page,
  perPage,
  where,
}: {
  page: number;
  perPage: number;
  where?: Prisma.ProductWhereInput;
}): Promise<{ rows: ProductListItem[]; total: number }> {
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
  return { rows: rows.map(toListItem), total };
}

export async function getProductMetaBySlug(slug: string): Promise<{
  name: string;
  description: string;
  images: ProductImage[];
} | null> {
  if (!slug) return null;

  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      images: {
        select: { url: true, alt: true, sort: true },
        orderBy: [{ sort: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!p) return null;

  return {
    name: p.name,
    description: p.description,
    images: normalizeImages(p.name, p.images as any),
  };
}

export async function getProductFullBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  if (!slug) return null;

  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      currency: true,
      images: {
        orderBy: [{ sort: "asc" }, { id: "asc" }],
        select: { url: true, alt: true, sort: true },
      },
      category: { select: { slug: true, name: true } },
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    currency: (p.currency ?? "EUR") as SupportedCurrency,
    images: normalizeImages(p.name, p.images as any),
    category: p.category,
  };
}

export async function getProductSlugs(limit = 1000) {
  return prisma.product.findMany({
    select: { slug: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
