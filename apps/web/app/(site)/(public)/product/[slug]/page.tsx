import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { prisma } from "@/lib/db";

import type { Metadata } from "next";

export const revalidate = 60;

// ✅ params es objeto plano
type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      images: { select: { url: true }, orderBy: { sort: "asc" } },
    },
  });

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const title = product.name;
  const description =
    product.description?.slice(0, 140) || "Detalle del producto";
  const og = product.images[0]?.url ?? "/og.jpg";

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      // Next no admite "product" en type — lo movemos a `other`
      title,
      description,
      images: [{ url: og }],
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

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = params;

  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: { select: { slug: true, name: true } },
    },
  });

  if (!p) notFound();

  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: p.currency || "EUR",
    maximumFractionDigits: 2,
  });

  const imgMain = p.images[0]?.url ?? "https://placehold.co/800x1000";
  const thumbs = p.images.length > 0 ? p.images : [{ url: imgMain }];

  return (
    <section className="space-y-6">
      <nav className="text-sm text-neutral-500">
        <Link href="/">Inicio</Link> <span aria-hidden>›</span>{" "}
        <Link href={`/?cat=${p.category.slug}`}>{p.category.name}</Link>{" "}
        <span aria-hidden>›</span>{" "}
        <span className="text-neutral-800">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Galería simple */}
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
            {thumbs.map((img, i) => (
              <div key={i} className="aspect-[4/5] relative bg-neutral-100">
                <Image
                  src={img.url}
                  alt={`${p.name} ${i + 1}`}
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
            {fmt.format(p.priceCents / 100)}
          </p>

          <Separator />

          <p className="text-sm text-neutral-700 leading-relaxed">
            {p.description}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button className="min-w-40">Añadir al carrito</Button>
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
            image: p.images.map((i) => i.url),
            category: p.category.name,
            offers: {
              "@type": "Offer",
              price: (p.priceCents / 100).toFixed(2),
              priceCurrency: p.currency || "EUR",
              availability: "https://schema.org/InStock",
            },
            url: `/product/${p.slug}`,
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
    // En build remoto sin DB accesible: no pre-generar
    return [];
  }

  try {
    const rows = await prisma.product.findMany({
      select: { slug: true },
      take: 1000,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(({ slug }) => ({ slug }));
  } catch {
    // Si falla por cualquier razón en build, mejor no bloquear la build
    return [];
  }
}
