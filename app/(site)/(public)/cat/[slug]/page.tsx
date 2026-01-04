import { notFound } from "next/navigation";

import {
  PaginationNav,
  ProductGrid,
  SectionHeader,
} from "@/components/catalog";

import { getCategoryBySlug } from "@/lib/categories/queries";
import { PER_PAGE, parsePage } from "@/lib/pagination";
import { getPublicProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parsePage(sp.page, 1));

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { rows, total } = await getPublicProducts({
    page,
    limit: PER_PAGE,
    categorySlug: slug,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section className="px-4">
      <SectionHeader title={cat.name} />
      <ProductGrid items={rows} />
      <PaginationNav
        page={page}
        totalPages={totalPages}
        base={`/cat/${slug}`}
      />
    </section>
  );
}
