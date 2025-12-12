"use client";
import { useEffect, useMemo, useState } from "react";

import {
  readDetailsMap,
  DETAILS_LS_KEY,
  DETAILS_EVENT_NAME,
  type DetailsMap,
  makeKey,
} from "@/lib/cart-details";

import { useAppSelector } from "@/hooks/use-app-selector";
import { selectCartItems } from "@/store/cart.selectors";

export function useCartView() {
  const items = useAppSelector(selectCartItems);
  const [details, setDetails] = useState<DetailsMap>({});

  useEffect(() => {
    setDetails(readDetailsMap());

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
  }, []);

  const rows = useMemo(
    () =>
      items.map((it) => ({
        slug: it.slug,
        variantId: it.variantId,
        qty: it.qty,
        detail: details[makeKey(it.slug, it.variantId)],
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
