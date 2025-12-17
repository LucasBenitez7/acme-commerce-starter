import {
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { PER_PAGE, parsePage } from "@/lib/pagination";
import { fetchProductsPage } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parsePage(sp.page, 1));

  const { rows, total } = await fetchProductsPage({
    page,
    perPage: PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section className="px-4">
      <SectionHeader title="Todas las prendas" />
      <ProductGrid items={rows} />
      <PaginationNav page={page} totalPages={totalPages} base="/catalogo" />
    </section>
  );
}
