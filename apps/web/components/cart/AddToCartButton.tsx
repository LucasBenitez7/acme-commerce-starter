"use client";

<<<<<<< HEAD
import { toast } from "sonner";

=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
import { upsertDetails, type CartItemDetails } from "@/lib/cart-details";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { addItem } from "@/store/cart.slice";

import { Button } from "../ui";

<<<<<<< HEAD
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

    toast.success("Añadido correctamente", {
      description: `${details?.name || slug} (${variantName})`,
      duration: 2000,
    });
=======
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
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      variant={"default"}
<<<<<<< HEAD
      disabled={disabled || !variantId}
      className="hover:cursor-pointer w-full rounded-xs text-base"
=======
      className="hover:cursor-pointer"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
    >
      Añadir a la cesta
    </Button>
  );
}
