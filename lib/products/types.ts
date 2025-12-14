import type { SupportedCurrency } from "@/lib/currency";
import type {
  Product,
  ProductImage as DbImage,
  ProductVariant as DbVariant,
  Category as DbCategory,
} from "@prisma/client";

// --- Helpers de UI ---

// Tipos para imágenes con soporte de color
export type ProductImage = Pick<DbImage, "url" | "alt"> & {
  sort?: number;
  color?: string | null;
};

// Tipos para variantes con precio específico
export type ProductVariant = Pick<
  DbVariant,
  "id" | "size" | "color" | "colorHex" | "stock" | "isActive"
> & {
  priceCents?: number | null;
};

// --- DTO para Listas (Grid) ---
export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "priceCents" | "isArchived"
> & {
  totalStock: number;
  currency: SupportedCurrency;
  thumbnail: string | null;
  variants: ProductVariant[];
  category: Pick<DbCategory, "slug" | "name">;
};

// --- DTO para Detalle (Ficha) ---
export type ProductDetail = Pick<
  Product,
  "id" | "slug" | "name" | "description" | "priceCents" | "isArchived"
> & {
  currency: SupportedCurrency;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Pick<DbCategory, "slug" | "name" | "id">;
};

export type ParamsSlug = Promise<{ slug: string }>;
export type SP = Promise<Record<string, string | string[] | undefined>>;
