import "server-only";

import { parseCurrency, type SupportedCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export type CartLineInput = {
  slug: string;
<<<<<<< HEAD
  variantId: string;
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  qty: number;
};

export type OrderItemDraft = {
  productId: string;
<<<<<<< HEAD
  variantId: string;
  slug: string;
  name: string;
  variantName: string;
=======
  slug: string;
  name: string;
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  unitPriceMinor: number;
  quantity: number;
  subtotalMinor: number;
  imageUrl?: string | null;
<<<<<<< HEAD
  stock: number;
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
};

export type OrderDraft = {
  currency: SupportedCurrency;
  items: OrderItemDraft[];
  totalMinor: number;
};

<<<<<<< HEAD
=======
/**
 * Devuelve la moneda del sitio, asegurándote de que siempre sea
 * un SupportedCurrency ("EUR" | "PYG").
 */
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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

<<<<<<< HEAD
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
=======
  // Normaliza por si hay slugs duplicados en el array de entrada.
  const qtyBySlug = new Map<string, number>();

  for (const line of lines) {
    if (!line.slug) continue;
    if (line.qty <= 0) continue;

    const current = qtyBySlug.get(line.slug) ?? 0;
    qtyBySlug.set(line.slug, current + line.qty);
  }

  const uniqueSlugs = Array.from(qtyBySlug.keys());

  if (!uniqueSlugs.length) {
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
    return {
      currency: getSiteCurrency(),
      items: [],
      totalMinor: 0,
    };
  }

<<<<<<< HEAD
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
=======
  const products = await prisma.product.findMany({
    where: { slug: { in: uniqueSlugs } },
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
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      },
    },
  });

<<<<<<< HEAD
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
=======
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
      imageUrl: product.images[0]?.url ?? null,
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
    });
  }

  const totalMinor = items.reduce((acc, item) => acc + item.subtotalMinor, 0);

  return {
<<<<<<< HEAD
    currency: firstCurrency,
=======
    currency,
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
    items,
    totalMinor,
  };
}
