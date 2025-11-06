import type { ProductRow } from "@/lib/server/products";
import type { ProductListItem } from "@/types/catalog";

export function rowsToListItems(rows: ProductRow[]): ProductListItem[] {
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceCents: r.priceCents,
    currency: r.currency ?? "EUR",
    thumbnail: r.images[0]?.url ?? null,
  }));
}
