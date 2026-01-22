import { ProductGrid, SectionHeader } from "@/components/catalog";

import { PER_PAGE } from "@/lib/pagination";
import { getPublicProducts } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { rows } = await getPublicProducts({
    page: 1,
    limit: PER_PAGE,
  });

  return (
    <section className="px-4">
      <SectionHeader title="Home" />
      <ProductGrid items={rows} />
    </section>
  );
}
