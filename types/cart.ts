export type CartItemRef = {
  slug: string;
  variantId: string;
  qty: number;
};

export type CartItemDetails = {
  slug: string;
  variantId: string;
  name: string;
  variantName: string;
  priceMinor: number;
  imageUrl?: string;
  stock: number;
};

export type DetailsMap = Record<string, CartItemDetails>;
