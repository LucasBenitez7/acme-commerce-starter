"use client";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

export function AddToCartIcon({
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
    <button
      type="button"
      onClick={onClick}
      className="hover:cursor-pointer text-slate-800 hover:text-primary transition-all duration-200 ease-in-out relative"
    >
      <HiOutlineShoppingBag strokeWidth={2} className="size-[22px]" />
      <span
        className="absolute top-[-1px] h-[0px] right-[6px] bg-transparent text-lg font-semibold"
        aria-live="polite"
      >
        +
      </span>
    </button>
  );
}
