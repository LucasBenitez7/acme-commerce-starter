import { CLOTHING_SIZES } from "@/lib/constants";

import type {
  ProductImage,
  ProductVariant,
  PublicProductDetail,
} from "./types";

export function findVariant(
  variants: ProductVariant[],
  color: string | null,
  size: string | null,
): ProductVariant | undefined {
  if (!color || !size) return undefined;
  return variants.find((v) => v.color === color && v.size === size);
}

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

// Extrae los colores únicos de una lista de variantes.
export function getUniqueColors(variants: ProductVariant[]): string[] {
  return Array.from(new Set(variants.map((v) => v.color))).sort();
}

// Extrae las tallas únicas y las ordena correctamente.
export function getUniqueSizes(variants: ProductVariant[]): string[] {
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  return sortSizes(sizes);
}

// Lógica centralizada para decidir qué imagen mostrar según el color.
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

// Capitaliza la primera letra de un string
export function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Calcula el estado visual inicial (Color e Imagen) basado en la URL y el stock
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
    const stockVariants = product.variants.filter((v) => v.stock > 0);
    const availableColors = getUniqueColors(stockVariants);

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
