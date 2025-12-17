import { ProductGrid, SectionHeader } from "@/components/catalog";

import { PER_PAGE } from "@/lib/pagination";
import { fetchProductsPage } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { rows } = await fetchProductsPage({
    page: 1,
    perPage: PER_PAGE,
    where: {},
  });

  return (
    <section className="px-4">
      <SectionHeader title="Home" />
      <ProductGrid items={rows} />
    </section>
  );
}
