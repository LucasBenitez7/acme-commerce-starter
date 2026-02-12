import { Suspense } from "react";

import { EmptyState } from "@/components/catalog/EmptyState";
import { PaginationNav } from "@/components/catalog/PaginationNav";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SectionHeader } from "@/components/catalog/SectionHeader";

import { getPublicProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rebajas | Acme Store",
  description: "Aprovecha nuestras ofertas y descuentos especiales.",
};

export default async function RebajasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;
  const { rows: products, total } = await getPublicProducts({
    page,
    limit: 12,
    onlyOnSale: true,
  });

  return (
    <div>
      <SectionHeader title="Rebajas" className="text-red-600" />

      <div className="space-y-8">
        {products.length > 0 ? (
          <>
            <ProductGrid items={products} />

            <Suspense>
              <PaginationNav page={page} totalPages={Math.ceil(total / 12)} />
            </Suspense>
          </>
        ) : (
          <EmptyState
            title="No hay rebajas activas"
            description="Revisa nuestro catálogo general para ver nuestros precios competitivos."
          />
        )}
      </div>
    </div>
  );
}
