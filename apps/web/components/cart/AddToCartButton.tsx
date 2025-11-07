"use client";
import { Button } from "@/components/ui/button";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

export function AddToCartButton({
  slug,
  qty = 1,
}: {
  slug: string;
  qty?: number;
}) {
  const dispatch = useAppDispatch();
  return (
    <Button
      aria-label="Añadir al carrito"
      onClick={() => dispatch(addItem({ slug, qty }))}
    >
      Añadir al carrito
    </Button>
  );
}
