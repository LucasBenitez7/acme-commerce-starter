import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CartItemMini, CartState } from "./cart.types";

const initialState: CartState = {
  items: [],
  updatedAt: null,
  lastRemovedItem: null,
};

function upsert(items: CartItemMini[], incoming: CartItemMini): CartItemMini[] {
  const idx = items.findIndex((i) => i.slug === incoming.slug);
  if (idx === -1) {
    return [...items, incoming];
  }

  const next = [...items];
  next[idx] = { slug: incoming.slug, qty: next[idx].qty + incoming.qty };

  return next.filter((i) => i.qty > 0);
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      { payload }: PayloadAction<{ slug: string; qty?: number }>,
    ) => {
      const qty = payload.qty ?? 1;
      state.items = upsert(state.items, { slug: payload.slug, qty });
      state.updatedAt = Date.now();
    },

    // ✅ guardar el último eliminado
    removeItem: (state, { payload }: PayloadAction<{ slug: string }>) => {
      const existing = state.items.find((i) => i.slug === payload.slug);
      if (!existing) return;

      state.lastRemovedItem = { ...existing };
      state.items = state.items.filter((i) => i.slug !== payload.slug);
      state.updatedAt = Date.now();
    },

    setQty: (
      state,
      { payload }: PayloadAction<{ slug: string; qty: number }>,
    ) => {
      const idx = state.items.findIndex((i) => i.slug === payload.slug);
      if (idx === -1) return;

      const currentItem = state.items[idx];

      if (payload.qty <= 0) {
        // ✅ también consideramos esto como "eliminar" para poder deshacer
        state.lastRemovedItem = { ...currentItem };
        state.items = state.items.filter((i) => i.slug !== payload.slug);
      } else {
        state.items[idx].qty = payload.qty;
      }

      state.updatedAt = Date.now();
    },

    clear: (state) => {
      state.items = [];
      state.updatedAt = Date.now();
      state.lastRemovedItem = null;
    },

    hydrateFromArray: (state, { payload }: PayloadAction<CartItemMini[]>) => {
      state.items = payload.filter((i) => i.qty > 0);
      state.updatedAt = Date.now();
      state.lastRemovedItem = null;
    },

    // ✅ nuevo: deshacer el último eliminado
    restoreLastRemovedItem: (state) => {
      if (!state.lastRemovedItem) return;

      state.items = upsert(state.items, state.lastRemovedItem);
      state.lastRemovedItem = null;
      state.updatedAt = Date.now();
    },

    clearLastRemovedItem: (state) => {
      state.lastRemovedItem = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  setQty,
  clear,
  hydrateFromArray,
  restoreLastRemovedItem,
  clearLastRemovedItem,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
