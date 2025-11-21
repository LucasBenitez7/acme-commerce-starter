"use client";
import { useEffect, useMemo, useState } from "react";

import {
  readDetailsMap,
  DETAILS_LS_KEY,
<<<<<<< HEAD
  DETAILS_EVENT_NAME,
  type DetailsMap,
  makeKey,
=======
  type DetailsMap,
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
} from "@/lib/cart-details";

import { useAppSelector } from "@/hooks/use-app-selector";
import { selectCartItems } from "@/store/cart.selectors";

export function useCartView() {
  const items = useAppSelector(selectCartItems);
  const [details, setDetails] = useState<DetailsMap>({});

  useEffect(() => {
    setDetails(readDetailsMap());
<<<<<<< HEAD

    const update = () => setDetails(readDetailsMap());

    const onStorage = (e: StorageEvent) => {
      if (e.key === DETAILS_LS_KEY) update();
    };

    const onCustomUpdate = () => update();

    window.addEventListener("storage", onStorage);
    window.addEventListener(DETAILS_EVENT_NAME, onCustomUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(DETAILS_EVENT_NAME, onCustomUpdate);
    };
=======
    const onStorage = (e: StorageEvent) => {
      if (e.key === DETAILS_LS_KEY) setDetails(readDetailsMap());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  }, []);

  const rows = useMemo(
    () =>
      items.map((it) => ({
        slug: it.slug,
<<<<<<< HEAD
        variantId: it.variantId,
        qty: it.qty,
        detail: details[makeKey(it.slug, it.variantId)],
=======
        qty: it.qty,
        detail: details[it.slug],
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
      })),
    [items, details],
  );

  const subtotalMinor = useMemo(() => {
    return rows.reduce((acc, r) => {
      if (!r.detail) return acc;
      return acc + r.detail.priceMinor * r.qty;
    }, 0);
  }, [rows]);

  return { rows, subtotalMinor };
}
