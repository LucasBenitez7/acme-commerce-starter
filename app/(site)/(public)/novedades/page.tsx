import { EmptyState } from "@/components/catalog/EmptyState";
import { ProductGridWithLoadMore } from "@/components/catalog/ProductGridWithLoadMore";
import { SectionHeader } from "@/components/catalog/SectionHeader";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE } from "@/lib/pagination";
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

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows: products, total }, favoriteIds, filterOptions] =
    await Promise.all([
      getPublicProducts({
        page: 1,
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

  return (
    <div>
      <SectionHeader title="Novedades" filterOptions={filterOptions} />

      <div className="space-y-8">
        {products.length > 0 ? (
          <ProductGridWithLoadMore
            initialProducts={products}
            initialTotal={total}
            favoriteIds={favoriteIds}
          />
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
