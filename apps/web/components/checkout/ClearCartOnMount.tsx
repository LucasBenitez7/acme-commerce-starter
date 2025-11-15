"use client";

import { useEffect } from "react";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { clear } from "@/store/cart.slice";

const CHECKOUT_FORM_STORAGE_KEY = "checkout.form.v1";

export function ClearCartOnMount() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clear());

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      } catch {
        // ignoramos errores de acceso a localStorage
      }
    }
  }, [dispatch]);

  return null;
}
