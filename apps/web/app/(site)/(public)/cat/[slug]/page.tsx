import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

import type { Metadata } from "next";

export const revalidate = 60;

type Params = { slug: string };
type SP = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 12;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = params;
  const cat = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!cat) {
    return { title: "Categoría no encontrada" };
  }

  const title = cat.name;

  return {
    title,
    description: `Productos de ${title}.`,
    alternates: { canonical: `/cat/${slug}` },
    openGraph: {
      title,
      description: `Descubre ${title} en nuestra tienda.`,
    },
    twitter: {
      card: "summary",
      title,
      description: `Descubre ${title} en nuestra tienda.`,
    },
  };
}

function toNumber(v: string | string[] | undefined, fallback = 1) {
  if (!v) return fallback;
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const makePageHref = (base: string, p: number) =>
  p <= 1 ? base : `${base}?page=${p}`;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { slug } = params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, toNumber(sp.page, 1));

  const cat = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!cat) notFound();

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: cat.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: {
        slug: true,
        name: true,
        priceCents: true,
        currency: true,
        images: {
          orderBy: [{ sort: "asc" }, { id: "asc" }],
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.product.count({ where: { categoryId: cat.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const base = `/cat/${slug}`;
  const prevHref = makePageHref(base, prevPage);
  const nextHref = makePageHref(base, nextPage);

  return (
    <section>
      <header className="flex justify-between w-full items-center border-b">
        <div>
          <h1 className="text-xl font-semibold capitalize">
            {String(cat.name)}
          </h1>
        </div>
        <div className="flex text-sm items-center gap-2 hover:cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M6 1a3 3 0 0 0-2.83 2H0v2h3.17a3.001 3.001 0 0 0 5.66 0H16V3H8.83A3 3 0 0 0 6 1M5 4a1 1 0 1 1 2 0a1 1 0 0 1-2 0m5 5a3 3 0 0 0-2.83 2H0v2h7.17a3.001 3.001 0 0 0 5.66 0H16v-2h-3.17A3 3 0 0 0 10 9m-1 3a1 1 0 1 1 2 0a1 1 0 0 1-2 0"
            />
          </svg>
          <p>Ordenar y Filtrar</p>
        </div>
      </header>

      <div className="grid gap-x-1 gap-y-15 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 my-6">
        {items.map((p) => {
          const img = p.images[0]?.url ?? "/og/default-products.jpg";
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
              <div className="flex flex-col text-sm border-b border-l border-r">
                <CardHeader className="flex justify-between items-center px-2 py-2">
                  <CardTitle className="font-medium">
                    <Link href={`/product/${p.slug}`}>{p.name}</Link>
                  </CardTitle>
                  <Heart size={20} strokeWidth={2} />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-sm text-neutral-600">
                    {formatPrice(p.priceCents, p.currency ?? "EUR")}
                  </p>
                  <p>c1 c2 c3 c4</p>
                  <div className="flex justify-between items-center">
                    <p className="capitalize">Talla</p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22px"
                      height="22px"
                      viewBox="0 0 24 24"
                      className="hover:cursor-pointer"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <path d="M12.5 21H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8H17.67a2 2 0 0 1 1.977 2.304l-.263 1.708M16 19h6m-3-3v6" />
                        <path d="M9 11V6a3 3 0 0 1 6 0v5" />
                      </g>
                    </svg>
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
          <Link href={prevHref} rel="prev">
            Anterior
          </Link>
        </Button>
        <Button asChild disabled={page >= totalPages}>
          <Link href={nextHref} rel="next">
            Siguiente
          </Link>
        </Button>
      </nav>
    </section>
  );
}
