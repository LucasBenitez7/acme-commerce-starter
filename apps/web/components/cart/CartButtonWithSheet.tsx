"use client";
import Link from "next/link";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaRegHeart, FaRegTrashCan } from "react-icons/fa6";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useAutoCloseOnRouteChange } from "@/hooks/use-auto-close-on-route-change";
import { useCartView } from "@/hooks/use-cart-view";
import { useMounted } from "@/hooks/use-mounted";
import { selectCartTotalQty } from "@/store/cart.selectors";
import { setQty, removeItem } from "@/store/cart.slice";

export function CartButtonWithSheet() {
  const [open, setOpen] = useState(false);
  const total = useAppSelector(selectCartTotalQty);
  const dispatch = useAppDispatch();
  const { rows, subtotalMinor } = useCartView();
  const mounted = useMounted();
  useAutoCloseOnRouteChange(open, () => setOpen(false));

  const badgeText = total > 9 ? "9+" : String(total);

  if (!mounted) {
    return (
      <Button
        variant="hovers"
        type="button"
        aria-label="cesta"
        className="tip-bottom"
        data-tip="Cesta"
      >
        <div className="relative flex items-center px-1 py-[6px]">
          <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
        </div>
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          asChild
          variant={"hovers"}
          type="button"
          aria-label="cesta"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="cart-sheet"
          className="tip-bottom"
          data-tip="Cesta"
        >
          <div className="relative flex items-center px-1 py-[6px] hover:cursor-pointer">
            <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
            {total > 0 && (
              <span
                className="absolute bottom-[12px] h-[4px] bg-transparent inline-flex items-center justify-center text-[10px] font-extrabold text-primary"
                aria-live="polite"
              >
                <span aria-hidden="true">{badgeText}</span>
                <span className="sr-only">{`Productos en la cesta: ${total}`}</span>
              </span>
            )}
            <span className="sr-only">Cesta</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        id="cart-sheet"
        side="right"
        overlayClassName="z-[180] bg-black/60 pointer-events-auto"
        className="z-[190] w-[min(100vw,450px)] sm:-w-full p-0"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="shrink-0 border-b px-4">
            <div className="flex flex-row justify-between items-center h-[var(--header-h)]">
              <SheetTitle className="text-center rounded-lb text-xl font-medium">
                Cesta
              </SheetTitle>
              <SheetClose asChild>
                <button
                  aria-label="Cerrar cesta"
                  className="p-[4px] text-sm hover:cursor-pointer border border-white  hover:border-slate-300 focus:outline-none bg-background hover:bg-neutral-100 rounded-lb transition-all duration-200 ease-in-out"
                >
                  <CgClose className="size-[20px] stroke-[0.4px]" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 && (
              <p className="flex text-sm items-center justify-center h-full text-muted-foreground">
                Tu carrito está vacío.
              </p>
            )}

            {rows.map((r) => {
              const d = r.detail;
              const lineTotalMinor = (d?.priceMinor ?? 0) * r.qty;
              return (
                <div
                  key={r.slug}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-6 border-b"
                >
                  <div
                    className="h-52 w-36 shrink-0 bg-muted"
                    aria-hidden="true"
                  >
                    {d?.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-between min-w-0 h-full py-1">
                    <div className="flex flex-col gap-2">
                      <div className="truncate text-sm font-medium">
                        {d?.name ?? r.slug}
                      </div>
                      <div className="text-xs flex gap-2 mb-2">
                        <span className="border-r pr-2 uppercase">S</span>
                        <span>Marrón</span>
                      </div>
                      <div
                        className={
                          r.qty > 1
                            ? "text-xs font-medium text-muted-foreground"
                            : "text-xs font-medium"
                        }
                      >
                        {d ? formatMinor(d.priceMinor, DEFAULT_CURRENCY) : "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lb">
                        <button
                          className="text-base hover:cursor-pointer px-3 py-1  hover:bg-neutral-100"
                          aria-label="Restar unidad"
                          onClick={() =>
                            dispatch(
                              setQty({
                                slug: r.slug,
                                qty: Math.max(0, r.qty - 1),
                              }),
                            )
                          }
                        >
                          −
                        </button>
                        <span
                          className="px-2 py-1 text-center text-sm font-medium"
                          aria-live="polite"
                        >
                          {r.qty}
                        </span>
                        <button
                          className="text-base hover:cursor-pointer px-3 py-1 hover:bg-neutral-100"
                          aria-label="Sumar unidad"
                          onClick={() =>
                            dispatch(setQty({ slug: r.slug, qty: r.qty + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>
                      {r.qty > 1 && (
                        <div className="text-right text-sm font-medium tabular-nums">
                          {formatMinor(lineTotalMinor, DEFAULT_CURRENCY)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between h-full items-center px-1 py-1">
                    <button
                      type="button"
                      className="hover:cursor-pointer"
                      aria-label="Agregar a favoritos"
                    >
                      <FaRegHeart className="size-[20px]" />
                    </button>
                    <button
                      type="button"
                      className="hover:cursor-pointer pb-2"
                      aria-label="Quitar de la cesta"
                      onClick={() => dispatch(removeItem({ slug: r.slug }))}
                    >
                      <FaRegTrashCan className="size-[20px] text-slate-700 hover:text-primary" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {rows.length > 0 && (
            <div className="shrink-0 py-6 px-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{formatMinor(subtotalMinor, DEFAULT_CURRENCY)}</span>
              </div>
              <div className="mt-3 flex gap-6">
                <Button
                  asChild
                  className="flex-1 py-2 hover:cursor-pointer"
                  aria-label="Ir al carrito"
                  variant={"outline"}
                >
                  <SheetClose asChild>
                    <Link href="/cart">Ir al carrito</Link>
                  </SheetClose>
                </Button>
                <SheetClose asChild>
                  <Link
                    href="/checkout"
                    className="flex-1 py-2 px-2 rounded-lb text-sm text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 transition-all duration-200 ease-in-out text-center"
                    aria-label="Proceder al pago"
                  >
                    Tramitar pedido
                  </Link>
                </SheetClose>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
