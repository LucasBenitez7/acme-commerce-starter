"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { ProductActions } from "./ProductActions";

import type { ProductDetail } from "@/lib/products/types";

// Componente de Galería Interno
function Gallery({
  images,
  productName,
}: {
  images: { url: string; alt: string | null }[];
  productName: string;
}) {
  const [mainIndex, setMainIndex] = useState(0);

  const mainImage = images[mainIndex];

  if (!images.length) return <div className="bg-neutral-100 aspect-[3/4]" />;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden rounded-md">
        <Image
          src={mainImage?.url ?? "/og/default-products.jpg"}
          alt={mainImage?.alt ?? productName}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              onClick={() => setMainIndex(idx)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border transition-all",
                mainIndex === idx
                  ? "border-black ring-1 ring-black"
                  : "border-transparent hover:border-neutral-300",
              )}
            >
              <Image
                src={img.url}
                alt={`Vista ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductClient({ product }: { product: ProductDetail }) {
  const colors = useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.color))).sort();
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length > 0 ? colors[0] : null,
  );

  const filteredImages = useMemo(() => {
    if (!selectedColor) return product.images;

    const matches = product.images.filter(
      (img) => !img.color || img.color === selectedColor,
    );

    return matches.length > 0 ? matches : product.images;
  }, [product.images, selectedColor]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 lg:items-start">
      <div className="relative">
        <Gallery images={filteredImages} productName={product.name} />
      </div>

      <div className="space-y-8">
        <div className="space-y-2 border-b pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          <p className="text-xl font-medium">
            {formatCurrency(product.priceCents, product.currency)}
          </p>
        </div>

        <ProductActions
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          priceMinor={product.priceCents}
          variants={product.variants}
          isArchived={product.isArchived}
          imageUrl={product.images[0]?.url}
          onColorChange={(color) => setSelectedColor(color)}
        />

        <div className="pt-6 border-t space-y-4">
          <h3 className="font-medium text-sm">Descripción</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>
      </div>
    </div>
  );
}
