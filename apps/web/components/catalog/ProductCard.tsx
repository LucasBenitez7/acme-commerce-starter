"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Button,
  CardContent,
  CardHeader,
  CardTitle,
  FavoriteButton,
} from "@/components/ui";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { AddToCartButton } from "../cart/AddToCartButton";

import type { ProductListItem } from "@/types/catalog";

export function ProductCard({
  item,
  showCartRow = false,
}: {
  item: ProductListItem;
  showCartRow?: boolean;
}) {
  const img = item.thumbnail ?? "/og/default-products.jpg";
  const isFavorite = false; // TODO: conectar con wishlist

  const isOutOfStock = item.totalStock === 0;

  return (
    <div className="overflow-hidden">
      <div className="relative aspect-[3/4] bg-neutral-100">
        <Link href={`/product/${item.slug}`}>
          <Image
            src={img}
            alt={item.name}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
            Agotado
          </div>
        )}
      </div>

      <div className="flex flex-col text-sm gap-2">
        <CardHeader className="flex items-center justify-between px-2 py-2">
          <CardTitle className="text-sm font-medium">
            <Link href={`/product/${item.slug}`}>
              <h3 className="text-sm font-medium leading-tight text-neutral-900 group-hover:underline decoration-neutral-400 underline-offset-4">
                {item.name}
              </h3>
            </Link>
          </CardTitle>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => {
              // TODO: dispatch(toggleWishlist({ slug: r.slug }))
            }}
          />
        </CardHeader>
        <CardContent className="flex flex-col text-xs font-medium gap-4 px-2 pb-2">
          <p className="text-xs">
            {formatMinor(item.priceCents, DEFAULT_CURRENCY)}
          </p>
          <div className="flex justify-between">
            <p>C1 C2 C3 C4</p>
            <p>XS S M L XL </p>
          </div>

          {showCartRow && (
            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full h-8 text-xs"
                disabled={isOutOfStock}
              >
                <Link href={`/product/${item.slug}`}>
                  {isOutOfStock ? "Ver detalles" : "Seleccionar opciones"}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
