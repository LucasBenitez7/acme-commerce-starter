import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";

import type { PublicProductListItem } from "@/lib/products/types";

interface ProductGridProps {
  items: PublicProductListItem[];
  favoriteIds?: Set<string>;
  className?: string;
  shortenTitle?: boolean;
  onProductClick?: () => void;
}

export function ProductGrid({
  items,
  favoriteIds,
  className,
  shortenTitle,
  onProductClick,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "py-0 grid gap-x-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 px-1",
        className,
      )}
    >
      {items.map((p) => (
        <ProductCard
          key={p.slug}
          item={p}
          initialIsFavorite={favoriteIds ? favoriteIds.has(p.id) : false}
          shortenTitle={shortenTitle}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}
