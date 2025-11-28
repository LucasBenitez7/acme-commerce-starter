"use client";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

import { type AddToCartProps } from "./AddToCartButton";

export function AddToCartIcon({
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !variantId}
      className="hover:cursor-pointer text-slate-800 hover:text-primary transition-all duration-200 ease-in-out relative"
    >
      <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
      <span
        className="absolute top-0 h-[0px] right-[7px] bg-transparent text-lg font-semibold"
        aria-live="polite"
      >
        +
      </span>
    </button>
  );
}
