import {
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { getUserFavoriteIds } from "@/lib/favorites/queries";
import { PER_PAGE, parsePage } from "@/lib/pagination";
import { getPublicProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parsePage(sp.page, 1));

  const { rows, total } = await getPublicProducts({
    page,
    limit: PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const favoriteIds = await getUserFavoriteIds();

  return (
    <section className="px-4">
      <SectionHeader title="Todas las prendas" />
      <ProductGrid items={rows} favoriteIds={favoriteIds} />
      <PaginationNav page={page} totalPages={totalPages} base="/catalogo" />
    </section>
  );
}
