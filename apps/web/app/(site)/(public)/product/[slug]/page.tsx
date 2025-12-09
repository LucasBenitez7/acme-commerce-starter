import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/catalog/ProductActions";

import { parseCurrency, toMajor, MINOR_UNITS } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import {
  getProductMetaBySlug,
  getProductFullBySlug,
  getProductSlugs,
} from "@/lib/server/products";

import type { ParamsSlug } from "@/types/catalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: ParamsSlug;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMetaBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const title = product.name;
  const description =
    product.description?.slice(0, 140) || "Detalle del producto";

  const og = product.images[0]?.url ?? "/og/product-fallback.jpg";

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
    other: {
      "og:type": "product",
    },
  };
}

export default async function ProductPage({ params }: { params: ParamsSlug }) {
  const { slug } = await params;
  const p = await getProductFullBySlug(slug);

  if (!p) notFound();

  const imgMain = p.images[0]?.url ?? "/og/default-products.jpg";
  const thumbs = p.images;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const imageListAbs = Array.from(
    new Set(
      thumbs.map((img) =>
        img.url.startsWith("http")
          ? img.url
          : new URL(img.url, site).toString(),
      ),
    ),
  );
  const productUrlAbs = new URL(`/product/${p.slug}`, site).toString();

  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

  const isArchived = p.isArchived;
  const isOutOfStock = totalStock === 0;

  const currency = parseCurrency(p.currency ?? "EUR");
  const priceMajor = toMajor(p.priceCents ?? 0, currency);
  const priceDecimals = MINOR_UNITS[currency];

  return (
    <div className="bg-background w-full justify-center">
      <section className="space-y-3 px-4 py-6 max-w-6xl mx-auto">
        <nav className="text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
          <Link className="hover:text-foreground" href="/">
            Inicio
          </Link>{" "}
          <span aria-hidden>›</span>{" "}
          <Link className="hover:text-foreground" href="/catalogo">
            Todas las prendas
          </Link>{" "}
          <span aria-hidden>›</span>{" "}
          <Link
            className="hover:text-foreground"
            href={`/cat/${p.category.slug}`}
          >
            {p.category.name}
          </Link>{" "}
          <span aria-hidden>›</span>{" "}
          <span className="text-foreground">{p.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(300px,450px)auto] lg:items-start">
          {/* Galería / Imagen */}
          <div className="relative sm:sticky sm:top-19">
            <div className="aspect-[3/4] relative bg-neutral-100  overflow-hidden">
              <Image
                src={imgMain}
                alt={p.name}
                fill
                sizes="(max-width:608px) 60vw, 500px"
                className="object-cover"
                priority
              />
              {isOutOfStock ||
                (isArchived && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/50">
                    <div className=" text-white/70 px-4 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white/70">
                      Agotado
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Info y Acciones */}
          <div className="space-y-8 p-0">
            <div className="space-y-0">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {p.name}
              </h1>
              <p className="text-sm mb-2 font-medium text-foreground">
                {formatPrice(p.priceCents, currency)}
              </p>
            </div>

            <div>
              <ProductActions
                productSlug={p.slug}
                productName={p.name}
                priceMinor={p.priceCents}
                imageUrl={imgMain}
                variants={p.variants}
                isArchived={isArchived}
              />
            </div>

            <div className="space-y-1 border-t py-2 mt-15">
              <h2 className="text-lg font-semibold text-foreground">
                Descripción
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {p.description}
              </p>
            </div>
          </div>
        </div>

        {/* JSON-LD básico */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.description,
              image: imageListAbs,
              category: p.category.name,
              offers: {
                "@type": "Offer",
                price: priceMajor.toFixed(priceDecimals),
                priceCurrency: currency,
                availability: "https://schema.org/InStock",
                url: productUrlAbs,
              },
              url: productUrlAbs,
            }),
          }}
        />
      </section>
    </div>
  );
}

/**
 * Pre-generación de slugs con guardia de entorno:
 * - Si no hay DATABASE_URL o apunta a localhost/127.0.0.1, devolvemos [] para no romper en Vercel.
 */
export async function generateStaticParams() {
  const db = process.env.DATABASE_URL ?? "";
  const isLocal = !db || db.includes("localhost") || db.includes("127.0.0.1");

  if (isLocal) {
    return [];
  }

  try {
    const rows = await getProductSlugs(1000);
    return rows.map((r: { slug: string }) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}
