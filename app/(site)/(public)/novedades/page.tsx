import { Suspense } from "react";

import { EmptyState } from "@/components/catalog/EmptyState";
import { PaginationNav } from "@/components/catalog/PaginationNav";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SectionHeader } from "@/components/catalog/SectionHeader";

import { getPublicProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

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
        {products.length > 0 ? (
          <>
            <ProductGrid items={products} />

            <Suspense>
              <PaginationNav page={page} totalPages={Math.ceil(total / 12)} />
            </Suspense>
          </>
        ) : (
          <EmptyState
            title="Sin novedades por ahora"
            description="Estamos preparando nuevas colecciones. ¡Vuelve pronto!"
          />
        )}
      </div>
    </div>
  );
}
