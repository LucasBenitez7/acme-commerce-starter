"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";

import { AddToCartIcon } from "@/components/cart/AddToCartIcon";
import { FavoriteButton } from "@/components/ui";

import { sortSizes } from "@/lib/catalog/sort-sizes";
import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { useAppSelector } from "@/hooks/use-app-selector";
import { selectCartQtyByVariant } from "@/store/cart.selectors";

import { COLOR_MAP } from "./ProductActions";

import type { ProductListItem } from "@/types/catalog";

export function ProductCard({ item }: { item: ProductListItem }) {
  const img = item.thumbnail ?? "/og/default-products.jpg";
  const isFavorite = false; // TODO: wishlist

  const isOutOfStock = item.totalStock === 0;

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [showSizes, setShowSizes] = useState(false);

  // Cerrar el overlay de tallas si se hace clic fuera de la imagen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        imageContainerRef.current &&
        !imageContainerRef.current.contains(event.target as Node)
      ) {
        setShowSizes(false);
      }
    }
    if (showSizes) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSizes]);

  // --- LÓGICA DE SELECCIÓN ---
  const sizes = useMemo(() => {
    const unique = Array.from(new Set(item.variants.map((v) => v.size)));
    return sortSizes(unique);
  }, [item.variants]);

  const colors = useMemo(() => {
    return Array.from(new Set(item.variants.map((v) => v.color))).sort();
  }, [item.variants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null,
  );

  const selectedVariant = useMemo(() => {
    return item.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    );
  }, [item.variants, selectedSize, selectedColor]);

  const cartQty = useAppSelector((state) =>
    selectCartQtyByVariant(state, selectedVariant?.id ?? ""),
  );

  const isCombinationValid = selectedVariant
    ? selectedVariant.stock > 0 && cartQty < selectedVariant.stock
    : false;

  const isMaxedOut =
    selectedVariant &&
    cartQty >= selectedVariant.stock &&
    selectedVariant.stock > 0;

  return (
    <div className="flex flex-col overflow-hidden bg-background transition-all h-full">
      <div
        ref={imageContainerRef}
        className="group/image relative aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0"
      >
        <Link href={`/product/${item.slug}`} className="block h-full w-full">
          <Image
            src={img}
            alt={item.name}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>

        {/* Badge Agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/50">
            <div className=" text-white/70 px-4 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white/70">
              Agotado
            </div>
          </div>
        )}

        {/* Overlay de tallas */}
        {!isOutOfStock && sizes.length > 0 && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-4 items-end justify-center transition-all duration-300",
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
                const isAvailable = item.variants.some(
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={cn(
                      "h-5 mx-[4px] px-[1px] border-b-2 border-transparent text-sm font-medium transition-all hover:cursor-pointer",
                      isSelected
                        ? "border-b-2 border-foreground"
                        : "text-foreground hover:border-b-2 hover:border-foreground",
                      !isAvailable &&
                        "opacity-50 hover:cursor-not-allowed border-transparent hover:border-transparent text-muted-foreground line-through",
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
            <Link href={`/product/${item.slug}`} className="block w-max">
              <h3 className="text-sm w-max font-medium leading-tight text-foreground line-clamp-1">
                {item.name}
              </h3>
            </Link>
            <p className="text-xs font-medium text-foreground">
              {formatMinor(item.priceCents, DEFAULT_CURRENCY)}
            </p>
          </div>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => {}}
            className="shrink-0"
          />
        </div>

        <div className="space-y-1">
          {/* Mensajes de Estado */}
          <div className="min-h-[1rem]">
            {selectedVariant && !isOutOfStock && (
              <p className="text-xs flex items-center gap-1 text-red-600 font-medium animate-in fade-in">
                {!isMaxedOut &&
                  !isCombinationValid &&
                  "Sin stock en la talla seleccionada"}
              </p>
            )}
          </div>

          {/* --- SELECTOR DE TALLAS (Mobile) --- */}
          <div className="lg:hidden">
            {sizes.length > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  1;
                  setShowSizes((prev) => !prev);
                }}
                className={cn(
                  "text-xs font-medium w-max transition-colors hover:cursor-pointer items-center flex justify-start",
                  showSizes
                    ? "text-muted-foreground "
                    : "text-foreground hover:text-foreground",
                )}
              >
                Ver tallas disponibles
              </button>
            ) : (
              <div className="h-6"></div>
            )}
          </div>

          {/* COLORES */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const bg = COLOR_MAP[color] ?? COLOR_MAP["Default"];
                const isSelected = selectedColor === color;

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
                      "h-[16px] w-[16px] border transition-all focus:outline-none hover:cursor-pointer shadow-[0_8px_0_0_#fff]",
                      isSelected
                        ? "shadow-[0_2.5px_0_0_#fff,0_4px_0_0_#000]"
                        : "hover:shadow-[0_2.5px_0_0_#fff,0_4px_0_0_#000]",
                    )}
                    style={{ backgroundColor: bg }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                );
              })}
            </div>

            {/* Botón de Añadir */}
            <div onClick={(e) => e.preventDefault()}>
              <AddToCartIcon
                slug={item.slug}
                variantId={selectedVariant?.id ?? ""}
                variantName={`${selectedSize} / ${selectedColor}`}
                disabled={!isCombinationValid || isOutOfStock}
                className={cn(
                  "transition-all duration-300",
                  !selectedSize && !isOutOfStock
                    ? "opacity-30 grayscale cursor-not-allowed"
                    : "opacity-100",
                )}
                qty={1}
                details={{
                  slug: item.slug,
                  name: item.name,
                  priceMinor: item.priceCents,
                  imageUrl: img,
                  stock: selectedVariant?.stock ?? 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
