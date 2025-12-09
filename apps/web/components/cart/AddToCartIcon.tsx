"use client";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { toast } from "sonner";

import { Button } from "@/components/ui";

import { upsertDetails } from "@/lib/cart-details";
import { cn } from "@/lib/utils";

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

    toast.success("Añadido correctamente", {
      description: `${details?.name} (${variantName})`,
      duration: 2000,
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("", className)}
      aria-label="Añadir a la cesta"
    >
      <HiOutlineShoppingBag className="size-6 hover:cursor-pointer" />
    </button>
  );
}
