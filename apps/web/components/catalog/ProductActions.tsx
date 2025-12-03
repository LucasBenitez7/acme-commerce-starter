"use client";

import { useState, useMemo } from "react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/ui";

import { sortSizes } from "@/lib/catalog/sort-sizes";
import { cn } from "@/lib/utils";

import type { ProductVariant } from "@/types/catalog";

export type Props = {
  productSlug: string;
  productName: string;
  priceMinor: number;
  imageUrl?: string;
  variants: ProductVariant[];
};

export const COLOR_MAP: Record<string, string> = {
  Negro: "#171717",
  Blanco: "#FFFFFF",
  "Azul Marino": "#1e3a8a",
  Beige: "#d6c0a1",
  Rojo: "#dc2626",
  Default: "#e5e5e5",
};

export function ProductActions({
  productSlug,
  productName,
  priceMinor,
  imageUrl,
  variants,
}: Props) {
  const sizes = useMemo(() => {
    const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));
    return sortSizes(uniqueSizes);
  }, [variants]);

  const colors = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.color))).sort();
  }, [variants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null,
  );

  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    );
  }, [variants, selectedSize, selectedColor]);

  const isCombinationValid = selectedVariant
    ? selectedVariant.stock > 0
    : false;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

  return (
    <div className="space-y-10">
      <div className="space-y-10">
        {/* Selector de Color */}
        <div className="space-y-1.5">
          <div className="flex">
            <span className="text-sm font-medium capitalize">
              Color: {selectedColor || ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const bg = COLOR_MAP[color] ?? COLOR_MAP["Default"];
              const isSelected = selectedColor === color;

              const isColorAvailable = variants.some(
                (v) => v.color === color && v.stock > 0,
              );

              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(color);
                  }}
                  className={cn(
                    "h-7 w-7 border transition-all focus:outline-none hover:cursor-pointer shadow-[0_10px_0_0_#fff]",
                    isSelected
                      ? "shadow-[0_4px_0_0_#fff,0_5.5px_0_0_#000]"
                      : "hover:shadow-[0_4px_0_0_#fff,0_5.5px_0_0_#000]",
                    !isColorAvailable && "opacity-50",
                  )}
                  style={{ backgroundColor: bg }}
                >
                  <span className="sr-only">{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Tallas */}
        <div className="space-y-1.5">
          <div className="flex">
            <span className="text-sm font-medium capitalize">
              Talla: {isCombinationValid ? selectedSize : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const isAvailable = variants.some(
                (v) =>
                  v.size === size &&
                  (selectedColor ? v.color === selectedColor : true) &&
                  v.stock > 0,
              );

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[2.5rem] px-2 py-1.5 text-sm font-medium border rounded-xs transition-all hover:cursor-pointer",
                    isSelected
                      ? "border-black"
                      : "bg-white text-foreground-700 hover:border-black",
                    !isAvailable &&
                      "hover:cursor-not-allowed cursor-not-allowed bg-neutral-100 line-through hover:border-border border-border text-neutral-400",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <button className="text-xs text-muted-foreground underline decoration-neutral-300 underline-offset-4 hover:text-foreground">
            Guía de tallas
          </button>
        </div>
      </div>

      {/* Mensajes de Estado */}
      <div className="min-h-[1.5rem]">
        {selectedVariant && !isOutOfStock && (
          <p className="text-xs text-green-600 font-medium animate-in fade-in">
            {selectedVariant.stock === 1
              ? `¡Solo queda ${selectedVariant.stock} unidad!`
              : ""}
            {selectedVariant.stock > 1 && selectedVariant.stock <= 5
              ? `¡Solo quedan ${selectedVariant.stock} unidades!`
              : ""}
          </p>
        )}
      </div>

      {/* Botón de Compra */}
      <div className="grid grid-cols-[auto_1fr] items-center justify-between gap-2">
        <div className="flex items-center">
          <FavoriteButton
            isFavorite={false}
            onToggle={() => {}}
            className=" border border-foreground h-10 w-10 rounded-xs"
          />
        </div>
        <div>
          <AddToCartButton
            slug={productSlug}
            variantId={selectedVariant?.id ?? ""}
            variantName={`${selectedSize} / ${selectedColor}`}
            disabled={!isCombinationValid || isOutOfStock}
            details={{
              slug: productSlug,
              name: productName,
              priceMinor: priceMinor,
              imageUrl: imageUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}
