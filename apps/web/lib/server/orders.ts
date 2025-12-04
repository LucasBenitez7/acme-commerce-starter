import "server-only";

import { parseCurrency, type SupportedCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export type CartLineInput = {
  slug: string;
  variantId: string;
  qty: number;
};

export type OrderItemDraft = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName: string;
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

  // Agrupar por variantId
  const qtyByVariant = new Map<string, number>();

  for (const line of lines) {
    if (!line.variantId) continue;
    if (line.qty <= 0) continue;

    const current = qtyByVariant.get(line.variantId) ?? 0;
    qtyByVariant.set(line.variantId, current + line.qty);
  }

  const variantIds = Array.from(qtyByVariant.keys());

  if (!variantIds.length) {
    return {
      currency: getSiteCurrency(),
      items: [],
      totalMinor: 0,
    };
  }

  // Buscamos las variantes con su producto padre
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: {
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
        },
      },
    },
  });

  const siteCurrency = getSiteCurrency();
  const firstCurrency = variants[0]?.product.currency
    ? parseCurrency(variants[0].product.currency)
    : siteCurrency;

  const items: OrderItemDraft[] = [];

  for (const v of variants) {
    const qty = qtyByVariant.get(v.id) ?? 0;
    const p = v.product;

    const unitPriceMinor = p.priceCents;
    const subtotalMinor = unitPriceMinor * qty;

    items.push({
      productId: p.id,
      variantId: v.id,
      slug: p.slug,
      name: p.name,
      variantName: `${v.size} / ${v.color}`,
      unitPriceMinor,
      quantity: qty,
      subtotalMinor,
      imageUrl: p.images[0]?.url ?? null,
      stock: v.stock,
    });
  }

  const totalMinor = items.reduce((acc, item) => acc + item.subtotalMinor, 0);

  return {
    currency: firstCurrency,
    items,
    totalMinor,
  };
}
