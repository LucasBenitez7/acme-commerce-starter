"use client";

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

import { Button } from "../ui";

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
    <Button
      type="button"
      onClick={onClick}
      variant={"default"}
      className="hover:cursor-pointer"
    >
      Añadir a la cesta
    </Button>
  );
}
