import { ProductCard } from "./ProductCard";

import type { ProductListItem } from "@/types/catalog";

export function ProductGrid({ items }: { items: ProductListItem[] }) {
  return (
<<<<<<< HEAD
    <div className="py-6 grid gap-x-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
=======
    <div className="py-6 grid gap-x-1 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      {items.map((p) => (
        <ProductCard key={p.slug} item={p} />
      ))}
    </div>
  );
}
