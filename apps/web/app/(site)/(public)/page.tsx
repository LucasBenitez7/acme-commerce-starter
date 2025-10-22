import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { canonicalFromSearchParams } from "@/lib/seo";

import type { Metadata } from "next";

export type SP = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 8;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const canonical = canonicalFromSearchParams({
    pathname: "/",
    searchParams: sp,
    keep: ["cat"], // mantenemos cat, eliminamos page y otros
  });

  return {
    alternates: { canonical }, // Next resuelve absoluta con metadataBase
  };
}

function getProducts(page: number) {
  const start = (page - 1) * PER_PAGE + 1;
  return Array.from({ length: PER_PAGE }, (_, i) => {
    const id = start + i;
    return {
      id,
      name: `Producto ${id}`,
      price: ((id * 3.99) % 200) + 9.99,
    };
  });
}

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const sp = (await searchParams) ?? {};

  const raw = sp.page;
  const page = Math.max(1, Number(Array.isArray(raw) ? raw[0] : raw) || 1);

  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const prevPage = Math.max(1, page - 1);
  const nextPage = page + 1;

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

  const products = getProducts(page);

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo</h1>
          <p className="text-sm text-neutral-500">Página {page}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link href={`/?${qsPrev.toString()}`} prefetch={false}>
              Anterior
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/?${qsNext.toString()}`} prefetch={false}>
              Siguiente
            </Link>
          </Button>
        </div>
      </header>

      <Separator />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-[4/5] bg-neutral-100" aria-hidden />
            <CardHeader className="p-4">
              <CardTitle className="text-base line-clamp-1">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-neutral-500">
                USD {p.price.toFixed(2)}
              </p>
              <Button asChild className="mt-3 w-full">
                <Link href={`/product/${p.id}`}>Ver detalle</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles de paginación en móvil */}
      <div className="flex lg:hidden items-center justify-end gap-2">
        <Button asChild variant="outline" disabled={page <= 1}>
          <Link href={`/?${qsPrev.toString()}`} prefetch={false}>
            Anterior
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/?${qsNext.toString()}`} prefetch={false}>
            Siguiente
          </Link>
        </Button>
      </div>
    </section>
  );
}
