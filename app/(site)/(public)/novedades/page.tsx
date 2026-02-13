import { Suspense } from "react";

import { EmptyState } from "@/components/catalog/EmptyState";
import { PaginationNav } from "@/components/catalog/PaginationNav";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SectionHeader } from "@/components/catalog/SectionHeader";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE, parsePage } from "@/lib/pagination";
import { getFilterOptions, getPublicProducts } from "@/lib/products/queries";
import { parseSearchParamFilters } from "@/lib/products/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Novedades | Acme Store",
  description: "Descubre los últimos productos añadidos a nuestra colección.",
};

export default async function NovedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parsePage(sp.page, 1));

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows: products, total }, favoriteIds, filterOptions] =
    await Promise.all([
      getPublicProducts({
        page,
        limit: PER_PAGE,
        sort: sort || { createdAt: "desc" },
        sizes,
        colors,
        minPrice,
        maxPrice,
      }),
      getUserFavoriteIds(),
      getFilterOptions(),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <SectionHeader title="Novedades" filterOptions={filterOptions} />

      <div className="space-y-8">
        {products.length > 0 ? (
          <>
            <ProductGrid items={products} favoriteIds={favoriteIds} />

            <Suspense>
              <PaginationNav
                page={page}
                totalPages={totalPages}
                base="/novedades"
                className="pr-4"
              />
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
