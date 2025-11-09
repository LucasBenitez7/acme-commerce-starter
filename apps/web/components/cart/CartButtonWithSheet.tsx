"use client";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiShoppingBag } from "react-icons/fi";

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
    <Sheet open={open} onOpenChange={setOpen} modal={true}>
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
            <FiShoppingBag className="size-[24px]" />
            {total > 0 && total < 100 && (
              <span className="absolute top-[14px] h-[12px] w-[14px] inline-flex items-center justify-center rounded-xs bg-white p-1 text-[12px] font-bold text-primary">
                {total}
              </span>
            )}
            {total > 99 && (
              <span className="absolute top-[14px] h-[12px] w-[14px] inline-flex items-center justify-center rounded-xs bg-white p-1 text-[10px] font-bold text-primary">
                {total}
              </span>
            )}
            <span className="sr-only">Carrito</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        id="cart-sheet"
        side="right"
        className="w-96 max-w-[95vw] z-[100] px-4"
      >
        <SheetHeader className="grid grid-cols-[1fr_auto] items-center h-[var(--header-h)] border-b">
          <SheetTitle className="px-4 justify-self-center rounded-sm text-[20px] font-medium">
            Cesta
          </SheetTitle>
          <CgClose
            aria-label="cerrar cesta"
            className="size-[30px] p-[4px] stroke-1 text-xs hover:cursor-pointer border border-white hover:border hover:border-slate-300 bg-background hover:bg-neutral-100 rounded-sm transition-all duration-200 ease-in-out"
            onClick={() => setOpen(false)}
          />
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
                Ver Cesta
              </Button>
              <Button className="flex-1" aria-label="Proceder al pago" disabled>
                Tramitar pedido
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
