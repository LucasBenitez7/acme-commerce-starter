import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button, Separator } from "@/components/ui";

import { parseCurrency, toMajor, MINOR_UNITS } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import {
  getProductMetaBySlug,
  getProductFullBySlug,
  getProductSlugs,
} from "@/lib/server/products";

import type { ParamsSlug, ProductImage } from "@/types/catalog";
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

  const currency = parseCurrency(p.currency ?? "EUR");
  const priceMajor = toMajor(p.priceCents ?? 0, currency);
  const priceDecimals = MINOR_UNITS[currency];

  return (
    <section className="space-y-6">
      <nav className="text-sm text-neutral-500">
        <Link href="/">Inicio</Link> <span aria-hidden>›</span>{" "}
        <Link href="/catalogo">Todas las prendas</Link>{" "}
        <span aria-hidden>›</span>{" "}
        <Link href={`/cat/${p.category.slug}`}>{p.category.name}</Link>{" "}
        <span aria-hidden>›</span>{" "}
        <span className="text-neutral-800">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/5] relative bg-neutral-100">
            <Image
              src={imgMain}
              alt={p.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {thumbs.map((img: { url: string }, i: number) => (
              <div key={i} className="aspect-[4/5] relative bg-neutral-100">
                <Image
                  src={img.url}
                  alt={`${p.name} - imagen ${i + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <p className="text-lg text-neutral-800">
            {formatPrice(p.priceCents, currency)}
          </p>

          <Separator />

          <p className="text-sm text-neutral-700 leading-relaxed">
            {p.description}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <AddToCartButton slug={p.slug} />
            <Button variant="outline" asChild>
              <Link href={`/?cat=${p.category.slug}`}>
                Ver más de {p.category.name}
              </Link>
            </Button>
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
