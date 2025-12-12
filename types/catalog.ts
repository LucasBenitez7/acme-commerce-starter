import type { SupportedCurrency } from "@/lib/currency";

export type CategoryLink = {
  slug: string;
  label: string;
};

export type ProductImage = {
  url: string;
  alt: string;
  sort?: number;
  color?: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
};

// DTO para listas
export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  totalStock: number;
  currency: SupportedCurrency;
  thumbnail: string | null;
  variants: ProductVariant[];
};

// DTO para detalle
export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: SupportedCurrency;
  isArchived: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  category: { slug: string; name: string };
};

export type ParamsSlug = Promise<{ slug: string }>;
export type SP = Promise<Record<string, string | string[] | undefined>>;
