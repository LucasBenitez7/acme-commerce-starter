import "server-only";
import { prisma } from "@/lib/db";

import { normalizeImages } from "./utils";

import type { ProductListItem, ProductDetail } from "./types";
import type { SupportedCurrency } from "@/lib/currency";
import type { Prisma } from "@prisma/client";

/* --- Helpers --- */
function toListItem(row: any): ProductListItem {
  const totalStock = row.variants.reduce(
    (acc: number, v: any) => acc + v.stock,
    0,
  );
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: row.priceCents,
    totalStock,
    currency: (row.currency ?? "EUR") as SupportedCurrency,
    thumbnail: row.images[0]?.url ?? null,
    images: row.images.map((img: any) => ({
      url: img.url,
      color: img.color,
    })),
    variants: row.variants,
    category: row.category,
    isArchived: row.isArchived,
  };
}

/* --- Queries --- */
export const productListSelect = {
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
    select: { id: true, size: true, color: true, stock: true, colorHex: true },
  },
} satisfies Prisma.ProductSelect;

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
      where: { ...where, isArchived: false },
      orderBy: [{ createdAt: "desc" }],
      take: perPage,
      skip: (page - 1) * perPage,
      select: productListSelect,
    }),
    prisma.product.count({ where: { ...where, isArchived: false } }),
  ]);
  return { rows: rows.map(toListItem), total };
}

export async function getProductFullBySlug(
  slug: string,
): Promise<ProductDetail | null> {
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
      images: {
        orderBy: [{ sort: "asc" }],
        select: { url: true, alt: true, sort: true, color: true },
      },
      category: { select: { id: true, slug: true, name: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          color: true,
          size: true,
          priceCents: true,
          stock: true,
          colorHex: true,
          isActive: true,
        },
        orderBy: { size: "asc" },
      },
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    isArchived: p.isArchived,
    category: p.category,
    currency: (p.currency ?? "EUR") as SupportedCurrency,
    images: normalizeImages(p.name, p.images),
    variants: p.variants,
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
