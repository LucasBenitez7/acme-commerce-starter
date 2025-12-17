import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductClient } from "@/components/catalog/ProductClient";

import {
  getProductMetaBySlug,
  getProductFullBySlug,
  getProductSlugs,
} from "@/lib/products/queries";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMetaBySlug(slug);

  if (!product) return { title: "Producto no encontrado" };

  const og = product.images[0]?.url ?? "/og/product-fallback.jpg";

  return {
    title: product.name,
    description: product.description?.slice(0, 140) || "Detalle del producto",
    openGraph: {
      images: [{ url: og, width: 1200, height: 630, alt: product.name }],
    },
  };
}

// --- PÁGINA PRINCIPAL ---
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductFullBySlug(slug);

  if (!p) notFound();

  // JSON-LD para Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((i) => i.url),
    sku: p.id,
    offers: {
      "@type": "Offer",
      price: (p.priceCents / 100).toFixed(2),
      priceCurrency: p.currency,
      availability: p.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="bg-background w-full justify-center">
      <section className="space-y-3 px-4 py-6 max-w-6xl mx-auto">
        {/* Breadcrumbs (SEO) */}
        <nav className="text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
          <Link className="hover:text-foreground" href="/">
            Inicio
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <Link className="hover:text-foreground" href="/catalogo">
            Catálogo
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <Link
            className="hover:text-foreground"
            href={`/cat/${p.category.slug}`}
          >
            {p.category.name}
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <span className="text-foreground">{p.name}</span>
        </nav>

        <ProductClient product={p} />

        {/* Script JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const db = process.env.DATABASE_URL ?? "";
  if (!db || db.includes("localhost")) return [];
  try {
    const rows = await getProductSlugs(100);
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}
