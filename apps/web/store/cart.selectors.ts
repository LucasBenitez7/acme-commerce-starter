import type { RootState } from "./index";

export const selectCartItems = (s: RootState) => s.cart.items;

export const selectCartTotalQty = (s: RootState) =>
  s.cart.items.reduce<number>((acc, it) => acc + it.qty, 0);
