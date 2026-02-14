import { EmptyState, SectionHeader } from "@/components/catalog";
import { ProductGridWithLoadMore } from "@/components/catalog/ProductGridWithLoadMore";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE } from "@/lib/pagination";
import { getFilterOptions, getPublicProducts } from "@/lib/products/queries";
import { parseSearchParamFilters } from "@/lib/products/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";

  return {
    title: query ? `Búsqueda: ${query} | Acme Store` : "Búsqueda | Acme Store",
    description: query
      ? `Resultados de búsqueda para: ${query}`
      : "Busca productos en nuestra tienda",
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";

  if (!query) {
    return (
      <section>
        <EmptyState
          title="Introduce un término de búsqueda"
          description="Usa el buscador del header para encontrar productos"
        />
      </section>
    );
  }

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows, total }, favoriteIds, filterOptions] = await Promise.all([
    getPublicProducts({
      page: 1,
      limit: PER_PAGE,
      query,
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
      <SectionHeader
        title={`${query}`}
        subTitle={`${total} ${total === 1 ? "resultado" : "resultados"}`}
        filterOptions={filterOptions}
      />

      {rows.length > 0 ? (
        <>
          <ProductGridWithLoadMore
            initialProducts={rows}
            initialTotal={total}
            favoriteIds={favoriteIds}
            query={query}
          />
        </>
      ) : (
        <EmptyState
          title={`No se encontraron resultados para "${query}"`}
          description="Intenta buscar con otros términos o explora nuestro catálogo"
        />
      )}
    </section>
  );
}
