import { EmptyState, SectionHeader } from "@/components/catalog";
import { ProductGridWithLoadMore } from "@/components/catalog/ProductGridWithLoadMore";

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
      <SectionHeader title="Todas las prendas" filterOptions={filterOptions} />
      {rows.length > 0 ? (
        <ProductGridWithLoadMore
          initialProducts={rows}
          initialTotal={total}
          favoriteIds={favoriteIds}
        />
      ) : (
        <EmptyState title="Catálogo vacío" />
      )}
    </section>
  );
}
