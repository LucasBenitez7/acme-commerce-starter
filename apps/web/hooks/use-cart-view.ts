"use client";
import { useEffect, useMemo, useState } from "react";

import {
  readDetailsMap,
  DETAILS_LS_KEY,
  type DetailsMap,
} from "@/lib/cart-details";

import { useAppSelector } from "@/hooks/use-app-selector";
import { selectCartItems } from "@/store/cart.selectors";

export function useCartView() {
  const items = useAppSelector(selectCartItems);
  const [details, setDetails] = useState<DetailsMap>({});

  useEffect(() => {
    setDetails(readDetailsMap());
    const onStorage = (e: StorageEvent) => {
      if (e.key === DETAILS_LS_KEY) setDetails(readDetailsMap());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rows = useMemo(
    () =>
      items.map((it) => ({
        slug: it.slug,
        qty: it.qty,
        detail: details[it.slug],
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
