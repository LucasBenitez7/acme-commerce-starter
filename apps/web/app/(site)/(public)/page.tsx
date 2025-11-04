import Image from "next/image";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { VscSettings } from "react-icons/vsc";

import { CardContent, CardHeader, CardTitle } from "@/components/ui";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { canonicalFromSearchParams } from "@/lib/seo";

import type { ProductListItem, SP } from "@/types/catalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string | null;
  images: { url: string }[];
};

const PER_PAGE = 12;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const canonical = canonicalFromSearchParams({
    pathname: "/",
    searchParams: sp,
    keep: ["cat"],
  });

  return {
    alternates: { canonical },
  };
}

export default async function HomePage() {
  const rows = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      currency: true,
      images: { select: { url: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: PER_PAGE,
  });

  const items = rows.map((r: ProductRow) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceCents: r.priceCents,
    currency: r.currency ?? "EUR",
    thumbnail: r.images[0]?.url ?? null,
  })) satisfies ProductListItem[];

  return (
    <section>
      <header className="flex justify-between w-full items-center border-b">
        <div>
          <h1 className="text-2xl font-medium capitalize">Home</h1>
        </div>
        <div className="flex items-center gap-2 hover:cursor-pointer">
          <VscSettings className="stroke-[0.5px] size-[20px]" />
          <p className=" text-sm">Ordenar y Filtrar</p>
        </div>
      </header>

      <div className="grid gap-x-1 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 my-6">
        {items.map((p: ProductListItem) => {
          const img = p.thumbnail ?? "/og/default-products.jpg";
          return (
            <div key={p.slug} className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-neutral-100">
                <Link href={`/product/${p.slug}`}>
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                  />
                </Link>
              </div>

              <div className="flex flex-col text-sm">
                <CardHeader className="flex justify-between items-center p-2">
                  <CardTitle className="font-medium">
                    <Link href={`/product/${p.slug}`}>{p.name}</Link>
                  </CardTitle>
                  <FaRegHeart className="size-[20px]" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-sm text-neutral-600">
                    {formatPrice(p.priceCents, p.currency ?? "EUR")}
                  </p>
                  <p>c1 c2 c3 c4</p>
                  <div className="flex justify-between items-center">
                    <p>talla</p>
                    <HiOutlineShoppingBag className="stroke-2 size-[20px]" />
                  </div>
                </CardContent>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
