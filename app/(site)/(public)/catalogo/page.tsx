import {
  EmptyState,
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE, parsePage } from "@/lib/pagination";
import { getFilterOptions, getPublicProducts } from "@/lib/products/queries";
import { parseSearchParamFilters } from "@/lib/products/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parsePage(sp.page, 1));

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows, total }, favoriteIds, filterOptions] = await Promise.all([
    getPublicProducts({
      page,
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

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section>
      <SectionHeader title="Todas las prendas" filterOptions={filterOptions} />
      {rows.length > 0 ? (
        <>
          <ProductGrid items={rows} favoriteIds={favoriteIds} />
          <PaginationNav
            page={page}
            totalPages={totalPages}
            base="/catalogo"
            className="pr-4"
          />
        </>
      ) : (
        <EmptyState title="Catálogo vacío" />
      )}
    </section>
  );
}
