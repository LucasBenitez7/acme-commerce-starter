"use client";

import { useState, useMemo } from "react";

import { Gallery, ProductActions } from "@/components/catalog/product-detail";

import { formatCurrency } from "@/lib/currency";

import type { ProductDetail } from "@/lib/products/types";

type Props = {
  product: ProductDetail;
  initialImage: string;
  initialColor: string | null;
};

export function ProductClient({ product, initialImage, initialColor }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialColor,
  );

  const filteredImages = useMemo(() => {
    if (!selectedColor) return product.images;

    const matches = product.images.filter(
      (img) => !img.color || img.color === selectedColor,
    );

    return matches.length > 0 ? matches : product.images;
  }, [product.images, selectedColor]);

  const currentMainImage = useMemo(() => {
    const exists = filteredImages.find((img) => img.url === initialImage);
    return exists ? initialImage : filteredImages[0]?.url;
  }, [filteredImages, initialImage]);

  const isOutOfStock = product.variants.every((v) => v.stock === 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px] lg:gap-16 items-start">
      {/* COLUMNA IZQUIERDA: GALERÍA */}
      <div className="w-full min-w-0  lg:sticky lg:top-20 h-fit">
        <Gallery
          isOutOfStock={isOutOfStock}
          images={filteredImages}
          productName={product.name}
          initialMainImage={currentMainImage}
        />
      </div>

      {/* COLUMNA DERECHA: INFO */}
      <div className="space-y-6">
        <div className="space-y-2 border-b pb-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {product.name}
          </h1>
          <p className="text-base font-medium">
            {formatCurrency(product.priceCents, product.currency)}
          </p>
        </div>

        <ProductActions
          product={product}
          imageUrl={filteredImages[0]?.url}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        <div className="pt-6 border-t space-y-4">
          <h3 className="font-medium text-sm text-foreground">Descripción</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>
      </div>
    </div>
  );
}
