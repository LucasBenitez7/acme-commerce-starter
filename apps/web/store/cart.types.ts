export type CartItemMini = {
  slug: string;
  qty: number;
};

export type CartState = {
  items: CartItemMini[];
  updatedAt: number | null;
};
