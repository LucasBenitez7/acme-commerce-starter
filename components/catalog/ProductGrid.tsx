import { ProductCard } from "./ProductCard";

import type { PublicProductListItem } from "@/lib/products/types";

interface ProductGridProps {
  items: PublicProductListItem[];
  favoriteIds?: Set<string>;
}

export function ProductGrid({ items, favoriteIds }: ProductGridProps) {
  return (
    <div className="py-6 grid gap-x-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard
          key={p.slug}
          item={p}
          initialIsFavorite={favoriteIds ? favoriteIds.has(p.id) : false}
        />
      ))}
    </div>
  );
}
