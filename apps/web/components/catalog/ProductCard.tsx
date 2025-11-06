import Image from "next/image";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import { CardContent, CardHeader, CardTitle } from "@/components/ui";

import { formatPrice } from "@/lib/format";

import type { ProductListItem } from "@/types/catalog";

export function ProductCard({
  item,
  showCartRow = false,
}: {
  item: ProductListItem;
  showCartRow?: boolean;
}) {
  const img = item.thumbnail ?? "/og/default-products.jpg";
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
      </div>

      <div className="flex flex-col text-sm">
        <CardHeader className="flex items-center justify-between px-2 py-2">
          <CardTitle className="font-medium">
            <Link href={`/product/${item.slug}`}>{item.name}</Link>
          </CardTitle>
          <FaRegHeart className="size-[20px]" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-2 pb-2">
          <p className="text-sm text-neutral-600">
            {formatPrice(item.priceCents, item.currency ?? "EUR")}
          </p>
          <p>c1 c2 c3 c4</p>
          {showCartRow && (
            <div className="flex items-center justify-between">
              <p>talla</p>
              <HiOutlineShoppingBag className="size-[20px] stroke-2" />
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
