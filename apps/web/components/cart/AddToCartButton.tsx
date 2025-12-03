"use client";

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

import { Button } from "../ui";

export type AddToCartProps = {
  slug: string;
  variantId: string;
  variantName: string;
  qty?: number;
  details?: Omit<CartItemDetails, "variantId" | "variantName">;
  disabled?: boolean;
  className?: string;
};

export function AddToCartButton({
  slug,
  variantId,
  variantName,
  qty = 1,
  details,
  disabled,
  className,
}: AddToCartProps) {
  const dispatch = useAppDispatch();
  const onClick = () => {
    if (!variantId) return;

    if (details) {
      upsertDetails({
        ...details,
        slug,
        variantId,
        variantName,
      });
    }

    dispatch(addItem({ slug, variantId, qty }));
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      variant={"default"}
      disabled={disabled}
      className="hover:cursor-pointer w-full rounded-xs text-base"
    >
      Añadir a la cesta
    </Button>
  );
}
