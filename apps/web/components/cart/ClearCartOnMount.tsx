"use client";

import { useEffect } from "react";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { clear } from "@/store/cart.slice";

export function ClearCartOnMount() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clear());
  }, [dispatch]);

  return null;
}
