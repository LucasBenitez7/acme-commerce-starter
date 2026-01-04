import { ProductCard } from "./ProductCard";

import type { PublicProductListItem } from "@/lib/products/types";

export function ProductGrid({ items }: { items: PublicProductListItem[] }) {
  return (
    <div className="py-6 grid gap-x-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.slug} item={p} />
      ))}
    </div>
  );
}
