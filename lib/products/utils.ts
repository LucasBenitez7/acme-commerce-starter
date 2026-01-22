import { CLOTHING_SIZES } from "@/lib/products/constants";

import type {
  ProductImage,
  ProductVariant,
  PublicProductDetail,
} from "./types";

// --- HELPERS BÁSICOS ---
export function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function compareSizes(a: string, b: string): number {
  const idxA = CLOTHING_SIZES.indexOf(a);
  const idxB = CLOTHING_SIZES.indexOf(b);

  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }

  const numA = parseFloat(a.replace(",", "."));
  const numB = parseFloat(b.replace(",", "."));

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  return a.localeCompare(b);
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort(compareSizes);
}

export function sortVariantsHelper(variants: any[]) {
  return [...variants].sort((a, b) => {
    const orderDiff = (a.colorOrder ?? 0) - (b.colorOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const colorCompare = a.color.localeCompare(b.color);
    if (colorCompare !== 0) return colorCompare;

    return compareSizes(a.size, b.size);
  });
}

// --- HELPERS DE EXTRACCIÓN DE DATOS ---
export function findVariant(
  variants: ProductVariant[],
  color: string | null,
  size: string | null,
): ProductVariant | undefined {
  if (!color || !size) return undefined;
  return variants.find((v) => v.color === color && v.size === size);
}

export function getUniqueColors(variants: ProductVariant[]): string[] {
  return Array.from(new Set(variants.map((v) => v.color)));
}

export function getUniqueSizes(variants: ProductVariant[]): string[] {
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  return sortSizes(sizes);
}

// --- HELPERS DE IMÁGENES ---
export function normalizeImages(
  productName: string,
  images: {
    url: string;
    alt: string | null;
    sort: number;
    color?: string | null;
  }[],
): ProductImage[] {
  if (!images || images.length === 0) {
    return [
      {
        id: "default-img",
        url: "/og/default-products.jpg",
        alt: productName,
        sort: 0,
        color: null,
      },
    ];
  }

  return images.map((img, idx) => ({
    id: `img-${idx}`,
    url: img.url,
    alt: img.alt || productName,
    sort: img.sort,
    color: img.color || null,
  }));
}

export function getImageForColor(
  images: { url: string; color?: string | null }[],
  selectedColor: string | null,
): string {
  if (selectedColor) {
    const match = images.find((img) => img.color === selectedColor);
    if (match) return match.url;
  }
  return images[0]?.url ?? "/og/default-products.jpg";
}

// --- ESTADO INICIAL ---
export function getInitialProductState(
  product: PublicProductDetail,
  colorParam?: string,
) {
  let initialColor: string | null = null;
  let initialImage = product.images[0]?.url;

  const colorExists =
    colorParam && product.variants.some((v) => v.color === colorParam);

  if (colorExists && colorParam) {
    initialColor = colorParam;
  } else {
    const sortedStock = sortVariantsHelper(product.variants).filter(
      (v) => v.stock > 0,
    );
    const availableColors = getUniqueColors(sortedStock);

    if (availableColors.length > 0) {
      initialColor = availableColors[0];
    }
  }

  if (initialColor) {
    const imageMatch = product.images.find((img) => img.color === initialColor);
    if (imageMatch) {
      initialImage = imageMatch.url;
    }
  }

  return { initialColor, initialImage };
}
