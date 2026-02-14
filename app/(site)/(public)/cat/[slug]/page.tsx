import { notFound } from "next/navigation";

import { EmptyState, SectionHeader } from "@/components/catalog";
import { ProductGridWithLoadMore } from "@/components/catalog/ProductGridWithLoadMore";

import { getCategoryBySlug } from "@/lib/categories/queries";
import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE } from "@/lib/pagination";
import { getFilterOptions, getPublicProducts } from "@/lib/products/queries";
import { parseSearchParamFilters } from "@/lib/products/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { sizes, colors, minPrice, maxPrice, sort } =
    parseSearchParamFilters(sp);

  const [{ rows, total }, favoriteIds, filterOptions] = await Promise.all([
    getPublicProducts({
      page: 1,
      limit: PER_PAGE,
      categorySlug: slug,
      sizes,
      colors,
      minPrice,
      maxPrice,
      sort,
    }),
    getUserFavoriteIds(),
    getFilterOptions(slug),
  ]);

  return (
    <section>
      <SectionHeader title={cat.name} filterOptions={filterOptions} />
      {rows.length > 0 ? (
        <ProductGridWithLoadMore
          initialProducts={rows}
          initialTotal={total}
          favoriteIds={favoriteIds}
          categorySlug={slug}
        />
      ) : (
        <EmptyState
          title={`No hay productos en ${cat.name}`}
          description="Lo sentimos, actualmente no tenemos stock en esta categoría."
        />
      )}
    </section>
  );
}
