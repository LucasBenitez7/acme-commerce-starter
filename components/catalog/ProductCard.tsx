"use client";

import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/ui";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { useProductCard } from "@/hooks/products/use-product-card";

import type { ProductListItem } from "@/lib/products/types";

export function ProductCard({ item }: { item: ProductListItem }) {
  const {
    imageContainerRef,
    showSizes,
    setShowSizes,
    sizes,
    colors,
    selectedColor,
    selectedSize,
    handleColorSelect,
    displayImage,
    productUrl,
    isOutOfStock,
    handleQuickAdd,
    cartItems,
  } = useProductCard(item);

  return (
    <div className="flex flex-col overflow-hidden bg-background transition-all h-full">
      <div
        ref={imageContainerRef}
        className="group/image relative aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0"
      >
        <Link href={productUrl} className="block h-full w-full">
          <Image
            src={displayImage}
            alt={item.name}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>

        {/* Badge Agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/50">
            <div className="text-white/70 px-4 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white/70">
              Agotado
            </div>
          </div>
        )}

        {/* Overlay de tallas */}
        {!isOutOfStock && sizes.length > 0 && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-3 items-end justify-center transition-all duration-300 text-foreground",
              "translate-y-4 opacity-0 hidden lg:flex",
              showSizes
                ? "flex translate-y-0 opacity-100"
                : "group-hover/image:translate-y-0 group-hover/image:opacity-100",
              "bg-white/90 backdrop-blur-[2px]",
            )}
          >
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;

                const variantForButton = item.variants.find(
                  (v) =>
                    v.size === size &&
                    (selectedColor ? v.color === selectedColor : true),
                );

                const isAvailable =
                  variantForButton && variantForButton.stock > 0;

                const qtyInCart =
                  cartItems.find((i) => i.variantId === variantForButton?.id)
                    ?.quantity ?? 0;

                const isMaxedOutForThisSize = variantForButton
                  ? qtyInCart >= variantForButton.stock
                  : false;

                const isDisabled = !isAvailable || isMaxedOutForThisSize;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isDisabled}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isAvailable) {
                        handleQuickAdd(size);
                      }
                    }}
                    className={cn(
                      "h-7 w-8 lg:h-5 lg:w-auto rounded-xs mx-[4px] p-[1px] border-b-2 border-transparent text-sm font-medium transition-all text-foreground",
                      isDisabled &&
                        "opacity-50 hover:cursor-default border-transparent hover:border-transparent text-muted-foreground line-through",
                      !isDisabled &&
                        "hover:cursor-pointer hover:border-foreground active:bg-neutral-300 lg:active:bg-transparent  text-foreground",
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- ZONA DE INFORMACIÓN --- */}
      <div className="flex flex-col gap-2 px-2 pt-3 pb-2 flex-1 space-y-2 bg-background z-10 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 w-full">
            <Link href={productUrl} className="block w-max">
              <h3 className="text-sm w-max font-medium leading-tight text-foreground line-clamp-1 hover:underline active:underline underline-offset-4">
                {item.name}
              </h3>
            </Link>
            <p className="text-xs font-medium text-foreground">
              {formatCurrency(item.priceCents, DEFAULT_CURRENCY)}
            </p>
          </div>
          <FavoriteButton
            isFavorite={false}
            onToggle={() => {}}
            className="shrink-0"
          />
        </div>

        <div className="space-y-4">
          {/* --- SELECTOR DE TALLAS (Mobile) --- */}
          <div className="lg:hidden">
            {sizes.length > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSizes((prev) => !prev);
                }}
                className={cn(
                  "text-xs font-medium w-max transition-colors hover:cursor-pointer items-center flex justify-start",
                )}
              >
                {showSizes ? "Ocultar tallas" : `Ver tallas (${sizes.length})`}
              </button>
            ) : (
              <div className="h-6"></div>
            )}
          </div>

          {/* COLORES (RESTAURADO CON COLOR_MAP) */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const variantWithColor = item.variants.find(
                  (v) => v.color === color,
                );
                const hex = variantWithColor?.colorHex || "#e5e5e5";
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorSelect(color);
                    }}
                    className={cn(
                      "h-[16px] w-[16px] border transition-all focus:outline-none hover:cursor-pointer shadow-[0_8px_0_0_#fff]",
                      isSelected
                        ? "shadow-[0_2.5px_0_0_#fff,0_4px_0_0_#000]"
                        : "hover:shadow-[0_2.5px_0_0_#fff,0_4px_0_0_#000]",
                    )}
                    style={{ backgroundColor: hex }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
