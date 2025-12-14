import type { SupportedCurrency } from "@/lib/currency";
import type {
  Category,
  Product,
  ProductImage as DbImage,
  ProductVariant as DbVariant,
} from "@/types/db";

// --- UI Helpers ---
export type CategoryLink = Pick<Category, "slug"> & {
  label: string;
};

// --- Imágenes ---
export type ProductImage = Pick<DbImage, "url" | "alt"> & {
  sort?: number;
  color?: string | null;
};

// --- Variantes ---
export type ProductVariant = Pick<
  DbVariant,
  "id" | "size" | "color" | "colorHex" | "stock" | "isActive"
>;

// --- DTO para Listas (Grid de productos) ---
export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "priceCents"
> & {
  totalStock: number;
  currency: SupportedCurrency;
  thumbnail: string | null;
  variants: ProductVariant[];
};

// --- DTO para Detalle (Ficha de producto) ---
export type ProductDetail = Pick<
  Product,
  "id" | "slug" | "name" | "description" | "priceCents" | "isArchived"
> & {
  currency: SupportedCurrency;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Pick<Category, "slug" | "name">;
};

// --- Promesas de Next.js (Params) ---
export type ParamsSlug = Promise<{ slug: string }>;
export type SP = Promise<Record<string, string | string[] | undefined>>;
