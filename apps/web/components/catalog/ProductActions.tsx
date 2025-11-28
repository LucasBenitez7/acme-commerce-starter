"use client";

import { useState, useMemo } from "react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";

import { cn } from "@/lib/utils";

import type { ProductVariant } from "@/types/catalog";

type Props = {
  productSlug: string;
  productName: string;
  priceMinor: number;
  imageUrl?: string;
  variants: ProductVariant[];
};

export function ProductActions({
  productSlug,
  productName,
  priceMinor,
  imageUrl,
  variants,
}: Props) {
  // Extraemos tallas y colores únicos disponibles
  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort();
  const colors = Array.from(new Set(variants.map((v) => v.color))).sort();

  // Estado de selección
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Encontrar la variante exacta
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    );
  }, [variants, selectedSize, selectedColor]);

  const isCombinationValid = selectedVariant && selectedVariant.stock > 0;
  const isOutOfStock = selectedVariant && selectedVariant.stock === 0;

  return (
    <div className="space-y-6">
      {/* Selector de Tallas */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Talla</span>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={cn(
                "h-10 min-w-[3rem] px-3 rounded-md border text-sm font-medium transition-all",
                selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Colores */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Color</span>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "h-10 px-4 rounded-md border text-sm font-medium transition-all",
                selectedColor === color
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Mensajes de Estado */}
      <div className="min-h-[1.5rem]">
        {isOutOfStock && (
          <p className="text-sm text-red-600 font-medium animate-in fade-in">
            ¡Vaya! Esta combinación está agotada.
          </p>
        )}
        {selectedVariant && !isOutOfStock && (
          <p className="text-sm text-green-600 font-medium animate-in fade-in">
            {selectedVariant.stock <= 5
              ? `¡Solo quedan ${selectedVariant.stock} unidades!`
              : "En stock"}
          </p>
        )}
      </div>

      {/* Botón de Compra */}
      <div className="pt-2">
        <AddToCartButton
          slug={productSlug}
          variantId={selectedVariant?.id ?? ""}
          variantName={`${selectedSize} / ${selectedColor}`}
          disabled={!isCombinationValid}
          className="w-full md:w-auto h-12 px-8 text-base"
          details={{
            slug: productSlug,
            name: productName,
            priceMinor: priceMinor,
            imageUrl: imageUrl,
          }}
        />
      </div>
    </div>
  );
}
