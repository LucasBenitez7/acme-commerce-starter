"use client";

import { Gallery, ProductActions } from "@/components/catalog/product-detail";

import { formatCurrency } from "@/lib/currency";

import { useProductDetail } from "@/hooks/products/use-product-detail";

import type { PublicProductDetail } from "@/lib/products/types";

type Props = {
  product: PublicProductDetail;
  initialImage: string;
  initialColor: string | null;
  initialIsFavorite: boolean;
};

export function ProductClient({
  product,
  initialImage,
  initialColor,
  initialIsFavorite,
}: Props) {
  const {
    selectedColor,
    filteredImages,
    currentMainImage,
    isOutOfStock,
    handleColorChange,
  } = useProductDetail({ product, initialImage, initialColor });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px] items-start">
      {/* COLUMNA IZQUIERDA: GALERÍA */}
      <div className="w-full min-w-0 lg:sticky lg:top-20 h-fit">
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
          onColorChange={handleColorChange}
          initialIsFavorite={initialIsFavorite}
        />

        <div className="pt-6 border-t space-y-1">
          <h3 className="font-medium text-sm text-foreground">Descripción</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>
      </div>
    </div>
  );
}
