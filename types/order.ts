import type { SupportedCurrency } from "@/lib/currency";

export type OrderItemDraft = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName: string;
  unitPriceMinor: number;
  quantity: number;
  subtotalMinor: number;
  imageUrl?: string | null;
  stock: number;
};

export type OrderDraft = {
  currency: SupportedCurrency;
  items: OrderItemDraft[];
  totalMinor: number;
};
