import { CLOTHING_SIZES } from "@/lib/constants";

import type { ProductImage } from "./types";

export function normalizeImages(
  productName: string,
  images: Array<{
    url: string;
    alt: string | null;
    sort: number | null;
    color: string | null;
  }>,
): ProductImage[] {
  if (!images || images.length === 0) {
    return [{ url: "/og/default-products.jpg", alt: productName, sort: 0 }];
  }
  return images.map((img, idx) => ({
    url: img.url,
    alt: img.alt || productName,
    sort: img.sort ?? idx,
    color: img.color,
  }));
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const idxA = CLOTHING_SIZES.indexOf(a);
    const idxB = CLOTHING_SIZES.indexOf(b);

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return a.localeCompare(b);
  });
}
