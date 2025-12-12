import type { ProductVariant } from "@/types/catalog";

export type FormVariant = Omit<ProductVariant, "id"> & {
  id?: string;
  colorHex?: string | null;
};

export type FormImage = {
  url: string;
  color: string | null;
};

export type Category = {
  id: string;
  name: string;
};

export type ProductWithDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  categoryId: string;
  isArchived: boolean;
  images: FormImage[];
  variants: ProductVariant[];
};
