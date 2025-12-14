import "server-only";

import { parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import type { CartItemRef } from "@/types/cart";
import type { OrderDraft, OrderItemDraft } from "@/types/order";

function getSiteCurrency() {
  return parseCurrency(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY);
}

export async function buildOrderDraftFromCart(
  lines: CartItemRef[],
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
    where: {
      id: { in: variantIds },
      isActive: true,
    },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          priceCents: true,
          currency: true,
          isArchived: true,
          images: {
            orderBy: [{ sort: "asc" }, { id: "asc" }],
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });

  const items: OrderItemDraft[] = [];
  const siteCurrency = getSiteCurrency();
  const firstCurrency = variants[0]?.product.currency
    ? parseCurrency(variants[0].product.currency)
    : siteCurrency;

  for (const v of variants) {
    if (v.product.isArchived) continue;

    const qty = qtyByVariant.get(v.id) ?? 0;
    const unitPriceMinor = v.product.priceCents;

    items.push({
      productId: v.product.id,
      variantId: v.id,
      slug: v.product.slug,
      name: v.product.name,
      variantName: `${v.size} / ${v.color}`,
      unitPriceMinor,
      quantity: qty,
      subtotalMinor: unitPriceMinor * qty,
      imageUrl: v.product.images[0]?.url,
      stock: v.stock,
    });
  }

  const totalMinor = items.reduce((acc, i) => acc + i.subtotalMinor, 0);

  return {
    currency: firstCurrency,
    items,
    totalMinor,
  };
}
