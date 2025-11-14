"use client";
import { useEffect, useMemo } from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/store";
import { readFromLocalStorage, writeEverywhere } from "@/store/cart.persist";
import { selectCartItems } from "@/store/cart.selectors";
import { hydrateFromArray } from "@/store/cart.slice";

import type { RootState } from "@/store";

export default function Providers({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const store = useMemo(() => makeStore(preloadedState), [preloadedState]);

  useEffect(() => {
    const state = store.getState();
    const hasSSRItems = state.cart.items.length > 0;
    if (!hasSSRItems) {
      const ls = readFromLocalStorage();
      if (ls.length > 0) store.dispatch(hydrateFromArray(ls));
    }
  }, [store]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const items = selectCartItems(state);
      writeEverywhere(items);
    });
    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
