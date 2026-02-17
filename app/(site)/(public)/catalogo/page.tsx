import { EmptyState } from "@/components/catalog";
import { CatalogClient } from "@/components/catalog/sections/CatalogClient";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE } from "@/lib/pagination";
import { getFilterOptions, getPublicProducts } from "@/lib/products/queries";
import { parseSearchParamFilters } from "@/lib/products/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const sp = await searchParams;

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows, total }, favoriteIds, filterOptions] = await Promise.all([
    getPublicProducts({
      page: 1,
      limit: PER_PAGE,
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
    <section>
      {rows.length > 0 ? (
        <CatalogClient
          title="Todas las prendas"
          initialProducts={rows}
          initialTotal={total}
          favoriteIds={favoriteIds}
          filterOptions={filterOptions}
        />
      ) : (
        <EmptyState title="Catálogo vacío" />
      )}
    </section>
  );
}
