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
