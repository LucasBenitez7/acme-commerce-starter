export type CartItemMini = {
  slug: string;
  qty: number;
};

export type LastRemovedStackEntry = {
  slug: string;
  qty: number;
  removedAt: number;
  index: number;
};

export type CartState = {
  items: CartItemMini[];
  updatedAt: number | null;
  lastRemovedStack: LastRemovedStackEntry[];
};
