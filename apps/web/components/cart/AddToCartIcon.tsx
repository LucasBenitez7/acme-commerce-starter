"use client";
import { HiOutlineShoppingBag } from "react-icons/hi2";
<<<<<<< HEAD
import { toast } from "sonner";

import { Button } from "@/components/ui";

import { upsertDetails } from "@/lib/cart-details";
import { cn } from "@/lib/utils";
=======

import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

<<<<<<< HEAD
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
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-all duration-200 h-8 w-8 flex items-center justify-center",
        disabled
          ? "cursor-not-allowed opacity-50 bg-neutral-100 text-neutral-400"
          : "hover:bg-black hover:text-white bg-white border border-neutral-200 text-neutral-900 shadow-sm",
        className,
      )}
      aria-label="Añadir a la cesta"
    >
      <HiOutlineShoppingBag className="size-6" />
    </Button>
=======
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
      <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
      <span
        className="absolute top-0 h-[0px] right-[7px] bg-transparent text-lg font-semibold"
        aria-live="polite"
      >
        +
      </span>
    </button>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  );
}
