"use client";
import { Button } from "@/components/ui/button";

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

export function AddToCartButton({
  slug,
  qty = 1,
  details,
}: {
  slug: string;
  qty?: number;
  details?: CartItemDetails;
}) {
  const dispatch = useAppDispatch();
  const onClick = () => {
    if (details) upsertDetails(details);
    dispatch(addItem({ slug, qty }));
  };

  return (
    <Button type="button" onClick={onClick}>
      Añadir al carrito
    </Button>
  );
}
