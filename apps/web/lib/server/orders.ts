import "server-only";

import { parseCurrency, type SupportedCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export type CartLineInput = {
  slug: string;
  qty: number;
};

export type OrderItemDraft = {
  productId: string;
  slug: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
  subtotalMinor: number;
  imageUrl?: string | null;
  stock: number;
};

export type OrderDraft = {
  currency: SupportedCurrency;
  items: OrderItemDraft[];
  totalMinor: number;
};

function getSiteCurrency(): SupportedCurrency {
  return parseCurrency(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY);
}

export async function buildOrderDraftFromCart(
  lines: CartLineInput[],
): Promise<OrderDraft> {
  if (!lines.length) {
    return {
      currency: getSiteCurrency(),
      items: [],
      totalMinor: 0,
    };
  }

  const qtyBySlug = new Map<string, number>();

  for (const line of lines) {
    if (!line.slug) continue;
    if (line.qty <= 0) continue;

    const current = qtyBySlug.get(line.slug) ?? 0;
    qtyBySlug.set(line.slug, current + line.qty);
  }

  const uniqueSlugs = Array.from(qtyBySlug.keys());

  if (!uniqueSlugs.length) {
    return {
      currency: getSiteCurrency(),
      items: [],
      totalMinor: 0,
    };
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: uniqueSlugs } },
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      stock: true,
      currency: true,
      images: {
        orderBy: [{ sort: "asc" }, { id: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  });

  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  const siteCurrency = getSiteCurrency();

  const firstCurrency: SupportedCurrency =
    products.length > 0 && products[0].currency
      ? parseCurrency(products[0].currency)
      : siteCurrency;

  const currency = firstCurrency;

  const items: OrderItemDraft[] = [];

  for (const [slug, qty] of qtyBySlug.entries()) {
    const product = productsBySlug.get(slug);
    if (!product) {
      continue;
    }

    const unitPriceMinor = product.priceCents;
    const subtotalMinor = unitPriceMinor * qty;

    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPriceMinor,
      quantity: qty,
      subtotalMinor,
      imageUrl: product.images[0]?.url ?? null,
      stock: product.stock,
    });
  }

  const totalMinor = items.reduce((acc, item) => acc + item.subtotalMinor, 0);

  return {
    currency,
    items,
    totalMinor,
  };
}
