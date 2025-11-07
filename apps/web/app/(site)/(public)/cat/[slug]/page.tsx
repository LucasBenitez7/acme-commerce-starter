import { notFound } from "next/navigation";

import {
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { rowsToListItems } from "@/lib/catalog/mapping";
import { PER_PAGE, parsePage } from "@/lib/catalog/pagination";
import { getCategoryBySlug } from "@/lib/server/categories";
import { fetchProductsPage } from "@/lib/server/products";

import type { ParamsSlug, SP } from "@/types/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: ParamsSlug;
  searchParams: SP;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parsePage(sp.page, 1));

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { rows, total } = await fetchProductsPage({
    page,
    perPage: PER_PAGE,
    where: { categoryId: cat.id },
  });

  const items = rowsToListItems(rows);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section>
      <SectionHeader title={String(cat.name)} />
      <ProductGrid items={items} showCartRow={true} />
      <PaginationNav
        page={page}
        totalPages={totalPages}
        base={`/cat/${slug}`}
      />
    </section>
  );
}
