import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  CartItemMini,
  CartState,
  LastRemovedStackEntry,
} from "./cart.types";

const initialState: CartState = {
  items: [],
  updatedAt: null,
  lastRemovedStack: [],
};

// Helper para encontrar items por clave compuesta
function findIndex(items: CartItemMini[], slug: string, variantId: string) {
  return items.findIndex((i) => i.slug === slug && i.variantId === variantId);
}

function upsert(items: CartItemMini[], incoming: CartItemMini): CartItemMini[] {
  const idx = findIndex(items, incoming.slug, incoming.variantId);
  if (idx === -1) return [...items, incoming];

  const next = [...items];
  next[idx] = { ...next[idx], qty: next[idx].qty + incoming.qty };
  return next.filter((i) => i.qty > 0);
}

function pushUndoEntry(
  state: CartState,
  entry: Omit<LastRemovedStackEntry, "removedAt">,
) {
  const full: LastRemovedStackEntry = {
    ...entry,
    removedAt: Date.now(),
  };

  state.lastRemovedStack = [...state.lastRemovedStack, full].slice(-10);
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      {
        payload,
      }: PayloadAction<{ slug: string; variantId: string; qty?: number }>,
    ) => {
      const qty = payload.qty ?? 1;
      state.items = upsert(state.items, {
        slug: payload.slug,
        variantId: payload.variantId,
        qty,
      });
      state.updatedAt = Date.now();
    },

    removeItem: (
      state,
      { payload }: PayloadAction<{ slug: string; variantId: string }>,
    ) => {
      const idx = findIndex(state.items, payload.slug, payload.variantId);
      if (idx === -1) return;

      const removed = state.items[idx];

      pushUndoEntry(state, {
        slug: removed.slug,
        variantId: removed.variantId,
        qty: removed.qty,
        index: idx,
      });

      state.items = state.items.filter(
        (i) => !(i.slug === payload.slug && i.variantId === payload.variantId),
      );
      state.updatedAt = Date.now();
    },

    setQty: (
      state,
      {
        payload,
      }: PayloadAction<{ slug: string; variantId: string; qty: number }>,
    ) => {
      const idx = findIndex(state.items, payload.slug, payload.variantId);
      if (idx === -1) return;

      if (payload.qty <= 0) {
        const removed = state.items[idx];
        pushUndoEntry(state, {
          slug: removed.slug,
          variantId: removed.variantId,
          qty: removed.qty,
          index: idx,
        });
        state.items = state.items.filter(
          (i) =>
            !(i.slug === payload.slug && i.variantId === payload.variantId),
        );
      } else {
        state.items[idx].qty = payload.qty;
      }

      state.updatedAt = Date.now();
    },

    clear: (state) => {
      state.items = [];
      state.updatedAt = Date.now();
      state.lastRemovedStack = [];
    },

    hydrateFromArray: (state, { payload }: PayloadAction<CartItemMini[]>) => {
      state.items = payload.filter((i) => i.qty > 0 && i.variantId);
      state.updatedAt = Date.now();
      state.lastRemovedStack = [];
    },

    restoreFromStack: (
      state,
      { payload }: PayloadAction<{ removedAt: number }>,
    ) => {
      const idx = state.lastRemovedStack.findIndex(
        (entry) => entry.removedAt === payload.removedAt,
      );
      if (idx === -1) return;

      const [entry] = state.lastRemovedStack.splice(idx, 1);
      state.lastRemovedStack = [...state.lastRemovedStack];

      state.items = upsert(state.items, {
        slug: entry.slug,
        variantId: entry.variantId,
        qty: entry.qty,
      });
      state.updatedAt = Date.now();
    },

    clearUndoStack: (state) => {
      state.lastRemovedStack = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  setQty,
  clear,
  hydrateFromArray,
  restoreFromStack,
  clearUndoStack,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
