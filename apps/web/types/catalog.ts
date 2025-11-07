export type CategoryLink = {
  slug: string;
  label: string;
};

export type ProductImage = {
  url: string;
  alt?: string | null;
  sort?: number;
};

export type SupportedCurrency = "EUR" | "PYG";

// DTO para listas (home, /catalogo, /cat/[slug])
export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: SupportedCurrency;
  thumbnail: string | null;
};

// DTO para detalle
export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  images: ProductImage[];
  category: { slug: string; name: string };
};

export type ParamsSlug = Promise<{ slug: string }>;
export type SP = Promise<Record<string, string | string[] | undefined>>;
