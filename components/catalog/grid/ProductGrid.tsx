import { cn } from "@/lib/utils";

import { ProductCard } from "../cards/ProductCard";

import type { PublicProductListItem } from "@/lib/products/types";

interface ProductGridProps {
  items: PublicProductListItem[];
  favoriteIds?: Set<string>;
  className?: string;
  shortenTitle?: boolean;
  onProductClick?: () => void;
  gridSize?: { mobile: 1 | 2; desktop: 2 | 4 };
}

export function ProductGrid({
  items,
  favoriteIds,
  className,
  shortenTitle,
  onProductClick,
  gridSize = { mobile: 2, desktop: 4 },
}: ProductGridProps) {
  const mobileColsClass = gridSize.mobile === 1 ? "grid-cols-1" : "grid-cols-2";

  const desktopColsClass =
    gridSize.desktop === 2 ? "md:grid-cols-2" : "md:grid-cols-4";

  const is2ColView = gridSize.desktop === 2;
  const is1ColMobile = gridSize.mobile === 1;

  return (
    <div
      className={cn(
        "w-full",
        (is2ColView || is1ColMobile) && "flex justify-center",
      )}
    >
      <div
        className={cn(
          "py-0 grid gap-x-1 gap-y-6 px-1",
          mobileColsClass,
          desktopColsClass,
          is2ColView && "md:max-w-2xl md:w-full",
          is1ColMobile && "max-w-md w-full sm:max-w-full",
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
    </div>
  );
}
