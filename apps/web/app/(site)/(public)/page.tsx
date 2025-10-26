import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MdAddShoppingCart } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { canonicalFromSearchParams } from "@/lib/seo";

import type { Metadata } from "next";

export const revalidate = 60;
export type SP = Promise<Record<string, string | string[] | undefined>>;
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

function toNumber(v: string | string[] | undefined, fallback = 1) {
  if (!v) return fallback;
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, toNumber(sp.page, 1));
  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;

  const where = cat ? { category: { slug: String(cat) } } : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: {
        slug: true,
        name: true,
        priceCents: true,
        currency: true,
        images: {
          orderBy: { sort: "desc" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const qsPrev = new URLSearchParams(
    cat
      ? { cat: String(cat), page: String(prevPage) }
      : { page: String(prevPage) },
  );
  const qsNext = new URLSearchParams(
    cat
      ? { cat: String(cat), page: String(nextPage) }
      : { page: String(nextPage) },
  );

  return (
    <section>
      <header className="flex justify-between w-full items-center border-b">
        <div>
          {cat ? (
            <h1 className="text-xl font-semibold capitalize">{String(cat)}</h1>
          ) : (
            <h1 className="text-xl font-semibold capitalize">Catálogo</h1>
          )}
        </div>

        <div className="text-sm items-center">
          <p>Ordenar y Filtrar</p>
        </div>
      </header>

      <div className="grid gap-x-1 gap-y-15 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 my-6">
        {items.map((p) => {
          const img = p.images[0]?.url ?? "/og/default-products.jpg";
          return (
            <div key={p.slug} className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-neutral-100">
                <Image
                  src={img}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col text-sm border-b border-l border-r">
                <CardHeader className="flex justify-between items-center px-2 py-2">
                  <CardTitle className="font-medium">
                    <Link href={`/product/${p.slug}`}>{p.name}</Link>
                  </CardTitle>
                  <Heart size={18} strokeWidth={2} />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-sm text-neutral-600">
                    {formatPrice(p.priceCents, p.currency ?? "EUR")}
                  </p>
                  <p>c1 c2 c3 c4</p>
                  <div className="flex justify-between items-center">
                    <p className="capitalize">Talla</p>
                    <MdAddShoppingCart size={20} />
                  </div>
                </CardContent>
              </div>
            </div>
          );
        })}
      </div>

      <nav
        aria-label="Paginación"
        className="flex items-center justify-end gap-2"
      >
        <p className="text-sm text-neutral-500">
          Página {page} de {totalPages}
        </p>
        <Button asChild variant="outline" disabled={page <= 1}>
          <Link href={`/?${qsPrev.toString()}`} rel="prev">
            Anterior
          </Link>
        </Button>
        <Button asChild disabled={page >= totalPages}>
          <Link href={`/?${qsNext.toString()}`} rel="next">
            Siguiente
          </Link>
        </Button>
      </nav>
    </section>
  );
}
