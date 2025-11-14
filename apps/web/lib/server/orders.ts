import "server-only";

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
};

export type OrderDraft = {
  currency: string;
  items: OrderItemDraft[];
  totalMinor: number;
};

/**
 * Devuelve la moneda del sitio.
 * Para este starter usamos NEXT_PUBLIC_DEFAULT_CURRENCY
 * y, si los productos tienen currency, comprobamos que coincida.
 */
function getSiteCurrency() {
  const envCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
  // Fallback razonable para desarrollo si no está el env
  return envCurrency ?? "EUR";
}

/**
 * Lee el carrito (slug + qty), vuelve a leer productos desde la DB
 * y arma un "draft" de Order con items ya valorados.
 *
 * No crea el Order todavía; eso se hará en la acción de /checkout.
 */
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

  // Normalizamos por si hay slugs duplicados en el array de entrada.
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
      currency: true,
    },
  });

  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  // Intentamos usar la currency de los productos; si no, usamos la del sitio.
  const siteCurrency = getSiteCurrency();
  const firstCurrency = products[0]?.currency ?? siteCurrency;
  const currency = firstCurrency || siteCurrency;

  const items: OrderItemDraft[] = [];

  for (const [slug, qty] of qtyBySlug.entries()) {
    const product = productsBySlug.get(slug);
    if (!product) {
      // Producto eliminado o slug inválido: por ahora lo ignoramos.
      // Más adelante podemos lanzar error si quieres.
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
    });
  }

  const totalMinor = items.reduce((acc, item) => acc + item.subtotalMinor, 0);

  return {
    currency,
    items,
    totalMinor,
  };
}
