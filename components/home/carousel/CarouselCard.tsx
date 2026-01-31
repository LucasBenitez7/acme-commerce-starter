"use client";

import Link from "next/link";

import { Image } from "@/components/ui/image";

import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

import type { PublicProductListItem } from "@/lib/products/types";

interface CarouselCardProps {
  product: PublicProductListItem;
}

export function CarouselCard({ product }: CarouselCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group/card block h-full">
      {/* IMAGEN */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.thumbnail || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 25vw, 20vw"
        />
      </div>

      {/* INFO ABAJO */}
      <div className="mt-2 mx-1 flex flex-col gap-1">
        <h3 className="line-clamp-2 text-xs font-medium text-foreground">
          {product.name}
        </h3>
        <p className="text-xs font-medium text-foreground">
          {formatCurrency(product.priceCents, DEFAULT_CURRENCY)}
        </p>
      </div>
    </Link>
  );
}
