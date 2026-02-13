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
  title: "Rebajas | Acme Store",
  description: "Aprovecha nuestras ofertas y descuentos especiales.",
};

export default async function RebajasPage({
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
        onlyOnSale: true,
        sizes,
        colors,
        minPrice,
        maxPrice,
        sort,
      }),
      getUserFavoriteIds(),
      getFilterOptions(),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <SectionHeader
        title="Rebajas"
        className="text-red-600"
        filterOptions={filterOptions}
      />

      <div className="space-y-8">
        {products.length > 0 ? (
          <>
            <ProductGrid items={products} favoriteIds={favoriteIds} />

            <Suspense>
              <PaginationNav
                page={page}
                totalPages={totalPages}
                base="/rebajas"
                className="pr-4"
              />
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
