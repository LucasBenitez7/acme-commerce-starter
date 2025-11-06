import { ProductCard } from "./ProductCard";

import type { ProductListItem } from "@/types/catalog";

export function ProductGrid({
  items,
  showCartRow = false,
}: {
  items: ProductListItem[];
  showCartRow?: boolean;
}) {
  return (
    <div className="my-6 grid gap-x-1 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.slug} item={p} showCartRow={showCartRow} />
      ))}
    </div>
  );
}
