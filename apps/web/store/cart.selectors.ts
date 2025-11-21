<<<<<<< HEAD
import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "./index";

const selectCart = (state: RootState) => state.cart;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items,
);

export const selectCartTotalQty = createSelector([selectCartItems], (items) =>
  items.reduce((acc, item) => acc + item.qty, 0),
);

export const selectCartQtyByVariant = createSelector(
  [selectCartItems, (_state: RootState, variantId: string) => variantId],
  (items, variantId) => {
    const item = items.find((i) => i.variantId === variantId);
    return item ? item.qty : 0;
  },
);
=======
import type { RootState } from "./index";

export const selectCartItems = (s: RootState) => s.cart.items;

export const selectCartTotalQty = (s: RootState) =>
  s.cart.items.reduce<number>((acc, it) => acc + it.qty, 0);
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
