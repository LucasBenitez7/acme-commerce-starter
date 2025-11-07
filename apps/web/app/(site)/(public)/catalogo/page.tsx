import {
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { rowsToListItems } from "@/lib/catalog/mapping";
import { PER_PAGE, parsePage } from "@/lib/catalog/pagination";
import { fetchProductsPage } from "@/lib/server/products";

import type { SP } from "@/types/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parsePage(sp.page, 1));

  const { rows, total } = await fetchProductsPage({ page, perPage: PER_PAGE });
  const items = rowsToListItems(rows);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section>
      <SectionHeader title="Todas las prendas" />
      <ProductGrid items={items} showCartRow={true} />
      <PaginationNav page={page} totalPages={totalPages} base="/catalogo" />
    </section>
  );
}
