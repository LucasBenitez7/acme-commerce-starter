"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";

import { makeStore } from "@/store";
import { readFromLocalStorage, writeEverywhere } from "@/store/cart.persist";
import { selectCartItems } from "@/store/cart.selectors";
import { hydrateFromArray } from "@/store/cart.slice";

import type { RootState } from "@/store";

type ProvidersProps = {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
};

export default function Providers({
  children,
  preloadedState,
}: ProvidersProps) {
  const store = useMemo(() => makeStore(preloadedState), [preloadedState]);

  // Hidratar carrito desde localStorage si no viene nada del SSR
  useEffect(() => {
    const state = store.getState();
    const hasSSRItems = state.cart.items.length > 0;
    if (!hasSSRItems) {
      const ls = readFromLocalStorage();
      if (ls.length > 0) store.dispatch(hydrateFromArray(ls));
    }
  }, [store]);

  // Escribir carrito en cookie + localStorage en cada cambio
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const items = selectCartItems(state);
      writeEverywhere(items);
    });
    return unsubscribe;
  }, [store]);

  return (
    <SessionProvider>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </SessionProvider>
  );
}
