import { ProductGrid, SectionHeader } from "@/components/catalog";

import { PER_PAGE } from "@/lib/pagination";
import { fetchNewest } from "@/lib/server/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default async function HomePage() {
  const rows = await fetchNewest({ take: PER_PAGE });
  const items = rows;

  return (
    <section className="px-4">
      <SectionHeader title="Home" />
      <ProductGrid items={items} />
    </section>
  );
}
