import { Suspense } from "react";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SectionHeader } from "@/components/catalog/SectionHeader";

import { getPublicProducts } from "@/lib/products/queries";

export const metadata = {
  title: "Novedades | Acme Store",
  description: "Descubre los últimos productos añadidos a nuestra colección.",
};

export default async function NovedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  const { rows: products, total } = await getPublicProducts({
    page,
    limit: 12,
    sort: { createdAt: "desc" },
  });

  return (
    <div>
      <SectionHeader title="Novedades" rightSlot={false} />

      <div className="space-y-8">
        <ProductGrid items={products} />

        <Suspense>
          <PaginationNav page={page} totalPages={Math.ceil(total / 12)} />
        </Suspense>
      </div>
    </div>
  );
}
