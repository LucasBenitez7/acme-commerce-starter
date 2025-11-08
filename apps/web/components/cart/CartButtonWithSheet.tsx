"use client";
import { useState } from "react";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useCartView } from "@/hooks/use-cart-view";
import { selectCartTotalQty } from "@/store/cart.selectors";
import { setQty, removeItem } from "@/store/cart.slice";

export function CartButtonWithSheet() {
  const [open, setOpen] = useState(false);
  const total = useAppSelector(selectCartTotalQty);
  const dispatch = useAppDispatch();
  const { rows, subtotalMinor } = useCartView();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          asChild
          variant={"hovers"}
          type="button"
          aria-label="ver cesta"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="cart-sheet"
        >
          <div className="relative flex items-center px-1 py-[6px] hover:cursor-pointer">
            <HiOutlineShoppingBag className="stroke-2 size-[20px]" />
            {total > 0 && (
              <span className="absolute right-0 bottom-0 inline-flex size-[16px] items-center justify-center rounded-full bg-primary p-1 text-xs font-light text-primary-foreground">
                {total}
              </span>
            )}
            <span className="sr-only">Carrito</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="mt-16 w-96 max-w-[95vw]">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        <div className="mt-2 space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tu carrito está vacío.
            </p>
          )}

          {rows.map((r) => {
            const d = r.detail;
            return (
              <div key={r.slug} className="flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded bg-muted"
                  aria-hidden="true"
                >
                  {d?.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {d?.name ?? r.slug}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d ? formatMinor(d.priceMinor, DEFAULT_CURRENCY) : "—"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Restar unidad"
                    onClick={() =>
                      dispatch(
                        setQty({ slug: r.slug, qty: Math.max(0, r.qty - 1) }),
                      )
                    }
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm" aria-live="polite">
                    {r.qty}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Sumar unidad"
                    onClick={() =>
                      dispatch(setQty({ slug: r.slug, qty: r.qty + 1 }))
                    }
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar del carrito"
                  onClick={() => dispatch(removeItem({ slug: r.slug }))}
                >
                  ✕
                </Button>
              </div>
            );
          })}
        </div>

        {rows.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatMinor(subtotalMinor, DEFAULT_CURRENCY)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" aria-label="Ir al carrito" disabled>
                Ver carrito
              </Button>
              <Button className="flex-1" aria-label="Proceder al pago" disabled>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
