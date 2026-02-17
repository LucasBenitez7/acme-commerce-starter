import { GenericCatalogClient } from "@/components/catalog/sections/GenericCatalogClient";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE } from "@/lib/pagination";
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

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows: products, total }, favoriteIds, filterOptions] =
    await Promise.all([
      getPublicProducts({
        page: 1,
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

  return (
    <div>
      <GenericCatalogClient
        title="Rebajas"
        titleClassName="text-red-600"
        initialProducts={products}
        initialTotal={total}
        favoriteIds={favoriteIds}
        filterOptions={filterOptions}
        onlyOnSale={true}
        emptyTitle="No hay rebajas activas"
        emptyDescription="Revisa nuestro catálogo general para ver nuestros precios competitivos."
      />
    </div>
  );
}
