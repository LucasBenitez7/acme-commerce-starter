import type { SupportedCurrency } from "@/lib/currency";
import type {
  Product,
  ProductImage as DbImage,
  ProductVariant as DbVariant,
  Category as DbCategory,
} from "@prisma/client";

// --- TIPOS BASE ---
export type ProductImage = Pick<
  DbImage,
  "id" | "url" | "alt" | "sort" | "color"
>;

export type ProductVariant = Pick<
  DbVariant,
  "id" | "size" | "color" | "colorHex" | "stock" | "isActive" | "colorOrder"
> & {
  priceCents?: number | null;
};

// --- DTO: ADMIN ---
export type AdminProductItem = Product & {
  category: DbCategory;
  images: ProductImage[];
  variants: ProductVariant[];
  _totalStock: number;
};

// --- DTO: PUBLIC LIST ---
export type PublicProductListItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: SupportedCurrency;
  isArchived: boolean;
  category: { name: string; slug: string };
  thumbnail: string | null;
  images: { url: string; color: string | null }[];
  totalStock: number;
  variants: ProductVariant[];
};

// --- DTO: PUBLIC DETAIL ---
export type PublicProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: SupportedCurrency;
  isArchived: boolean;
  category: { id: string; slug: string; name: string };
  images: ProductImage[];
  variants: ProductVariant[];
};

// --- TIPOS PARA ATRIBUTOS GUARDADOS  ---
export type PresetSize = {
  id: string;
  name: string;
  type: string;
};

export type PresetColor = {
  id: string;
  name: string;
  hex: string;
};
