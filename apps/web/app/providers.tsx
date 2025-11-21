"use client";
<<<<<<< HEAD

import { SessionProvider } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
=======
import { useEffect, useMemo } from "react";
import { Provider } from "react-redux";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

import { makeStore } from "@/store";
import { readFromLocalStorage, writeEverywhere } from "@/store/cart.persist";
import { selectCartItems } from "@/store/cart.selectors";
import { hydrateFromArray } from "@/store/cart.slice";

import type { RootState } from "@/store";

<<<<<<< HEAD
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
=======
export default function Providers({
  children,
  preloadedState,
}: {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
}) {
  const store = useMemo(() => makeStore(preloadedState), [preloadedState]);

>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  useEffect(() => {
    const state = store.getState();
    const hasSSRItems = state.cart.items.length > 0;
    if (!hasSSRItems) {
      const ls = readFromLocalStorage();
      if (ls.length > 0) store.dispatch(hydrateFromArray(ls));
    }
  }, [store]);

<<<<<<< HEAD
  // Escribir carrito en cookie + localStorage en cada cambio
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const items = selectCartItems(state);
      writeEverywhere(items);
    });
    return unsubscribe;
  }, [store]);

<<<<<<< HEAD
  return (
    <SessionProvider>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </SessionProvider>
  );
=======
  return <Provider store={store}>{children}</Provider>;
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
}
