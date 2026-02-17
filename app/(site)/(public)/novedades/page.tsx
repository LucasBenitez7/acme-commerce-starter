import { GenericCatalogClient } from "@/components/catalog/sections/GenericCatalogClient";

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
      <GenericCatalogClient
        title="Novedades"
        initialProducts={products}
        initialTotal={total}
        favoriteIds={favoriteIds}
        filterOptions={filterOptions}
        emptyTitle="Sin novedades por ahora"
        emptyDescription="Estamos preparando nuevas colecciones. ¡Vuelve pronto!"
      />
    </div>
  );
}
