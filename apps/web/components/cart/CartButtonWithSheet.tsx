"use client";
import Image from "next/image";
import Link from "next/link";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
=======
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi2";
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

import { CartUndoChip } from "@/components/cart/CartUndoChip";
import { Button, FavoriteButton, RemoveButton } from "@/components/ui";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";
<<<<<<< HEAD
import { cn } from "@/lib/utils";

import { validateStockAction } from "@/app/(site)/(shop)/cart/actions";
=======

>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useAutoCloseOnRouteChange } from "@/hooks/use-auto-close-on-route-change";
import { useCartUndoRows } from "@/hooks/use-cart-undo-rows";
import { useCartView } from "@/hooks/use-cart-view";
import { useMounted } from "@/hooks/use-mounted";
import { selectCartTotalQty } from "@/store/cart.selectors";
import { setQty, removeItem } from "@/store/cart.slice";

export function CartButtonWithSheet() {
<<<<<<< HEAD
  const router = useRouter();
  const { data: session } = useSession();
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const total = useAppSelector(selectCartTotalQty);

  const { rows, subtotalMinor } = useCartView();
  const { undoStack, rowsWithUndo, handleUndo } = useCartUndoRows(rows);

  const mounted = useMounted();

<<<<<<< HEAD
  const [isValidating, setIsValidating] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const isFavorite = false;
=======
  const isFavorite = false; // TODO: conectar con wishlist
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

  useAutoCloseOnRouteChange(open, () => setOpen(false));

  const badgeText = total > 9 ? "9+" : String(total);

<<<<<<< HEAD
  useEffect(() => {
    if (stockError) {
      setStockError(null);
    }
  }, [rows, undoStack]);

  async function handleCheckout() {
    if (rows.length === 0) return;
    setIsValidating(true);
    setStockError(null);

    const cartItems = rows.map((r) => ({
      slug: r.slug,
      variantId: r.variantId,
      qty: r.qty,
    }));

    const result = await validateStockAction(cartItems);

    setIsValidating(false);

    if (!result.success && result.error) {
      setStockError(result.error);
      return;
    }

    setOpen(false);

    if (session?.user) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirectTo=/checkout");
    }
  }

  if (!mounted) {
    return (
      <Button
        variant={"ghost"}
=======
  if (!mounted) {
    return (
      <Button
        variant="hovers"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        type="button"
        aria-label="cesta"
        className="tip-bottom"
        data-tip="Cesta"
<<<<<<< HEAD
        size={"icon-lg"}
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
<<<<<<< HEAD
          variant={"ghost"}
=======
          variant={"hovers"}
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          type="button"
          aria-label="cesta"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="cart-sheet"
          className="tip-bottom"
          data-tip="Cesta"
<<<<<<< HEAD
          size={"icon-lg"}
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
        >
          <div className="relative flex items-center px-1 py-[6px] hover:cursor-pointer">
            <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
            {total > 0 && (
              <span
<<<<<<< HEAD
                className="absolute bottom-[14px] h-[4px] bg-transparent inline-flex items-center justify-center text-[10px] font-extrabold text-primary"
=======
                className="absolute bottom-[12px] h-[4px] bg-transparent inline-flex items-center justify-center text-[10px] font-extrabold text-primary"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                aria-live="polite"
              >
                <span aria-hidden="true">{badgeText}</span>
                <span className="sr-only">{`Productos en la cesta: ${total}`}</span>
              </span>
            )}
<<<<<<< HEAD
=======
            <span className="sr-only">Cesta</span>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent
        id="cart-sheet"
        side="right"
        overlayClassName="z-[180] bg-black/60 pointer-events-auto"
        className="z-[190] w-[min(100vw,500px)] p-0"
      >
        <div className="flex h-full flex-col">
<<<<<<< HEAD
          <SheetHeader className="shrink-0 border-b px-4">
            <div className="flex flex-row justify-between items-center h-[var(--header-h)]">
              <SheetTitle className="text-center rounded-xs text-xl font-medium">
=======
          <SheetHeader className="shrink-0 border-b mb-2 px-4">
            <div className="flex flex-row justify-between items-center h-[var(--header-h)]">
              <SheetTitle className="text-center rounded-lb text-xl font-medium">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                Cesta
              </SheetTitle>
              <SheetClose asChild>
                <button
                  aria-label="Cerrar cesta"
<<<<<<< HEAD
                  className="p-[4px] text-sm hover:cursor-pointer border border-white hover:border-slate-300 focus:outline-none bg-background hover:bg-neutral-100 rounded-xs transition-all duration-200 ease-in-out"
=======
                  className="p-[4px] text-sm hover:cursor-pointer border border-white hover:border-slate-300 focus:outline-none bg-background hover:bg-neutral-100 rounded-lb transition-all duration-200 ease-in-out"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                >
                  <CgClose className="size-[20px] stroke-[0.4px]" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

<<<<<<< HEAD
          <div className="flex-1 overflow-y-auto py-2">
            {rows.length === 0 && !undoStack.length && (
              <div className="rounded-xs h-full p-6 text-sm justify-center items-center flex flex-col">
=======
          <div className="flex-1 overflow-y-auto">
            {/* Estado vacío solo si no hay filas NI undos */}
            {rows.length === 0 && !undoStack.length && (
              <div className="rounded-lb h-full p-6 text-sm justify-center items-center flex flex-col">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                <p className="mb-3 font-medium">Tu cesta está vacía</p>
                <p className="mb-4 text-muted-foreground">
                  Explora en nuestra tienda para encontrar lo que necesitas
                </p>
              </div>
            )}

            {rowsWithUndo.map((item) => {
              if (item.kind === "row") {
                const r = item.row;
                const d = r.detail;
                const lineTotalMinor = (d?.priceMinor ?? 0) * r.qty;
<<<<<<< HEAD
                const maxStock = d?.stock ?? 999;
                const isMaxed = r.qty >= maxStock;
                const isItemOutOfStock = d?.stock === 0;

                return (
                  <div
                    key={`${r.slug}-${r.variantId}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-2 px-4"
                  >
                    <div
                      className="relative aspect-[3/4] h-28 w-20 lg:h-40 lg:w-28 shrink-0 bg-neutral-100"
=======

                return (
                  <div
                    key={r.slug}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-2 px-4"
                  >
                    <div
                      className="relative aspect-[3/4] h-44 w-32 shrink-0 bg-neutral-100"
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                      aria-hidden="true"
                    >
                      {d?.imageUrl && (
                        <Image
                          src={d.imageUrl}
                          alt={d.name}
                          fill
                          sizes="200px"
<<<<<<< HEAD
                          className="h-full w-full rounded-xs object-cover"
                        />
                      )}
                      {isItemOutOfStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/50">
                          <div className=" text-white/70 px-4 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white/70">
                            Agotado
                          </div>
                        </div>
                      )}
=======
                          className="h-full w-full rounded-lb object-cover"
                        />
                      )}
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                    </div>

                    <div className="flex flex-col justify-between min-w-0 h-full py-1">
                      <div className="flex flex-col gap-2">
<<<<<<< HEAD
                        <Link
                          href={`/product/${d?.slug ?? r.slug}`}
                          className="truncate text-sm font-medium fx-underline-anim w-max"
                        >
                          <span> {d?.name ?? r.slug}</span>
                        </Link>
                        {d?.variantName && (
                          <div className="text-xs flex gap-2 mb-0.5">
                            <span>{d.variantName}</span>
                          </div>
                        )}
                        {r.qty > 1 && (
                          <div className="text-xs font-normal text-muted-foreground">
=======
                        <div className="truncate text-sm font-medium">
                          {d?.name ?? r.slug}
                        </div>
                        <div className="text-xs flex gap-2 mb-1">
                          <span className="border-r pr-2 uppercase">S</span>
                          <span>Marrón</span>
                        </div>
                        {r.qty > 1 && (
                          <div className="text-xs font-medium text-muted-foreground">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                            {d
                              ? formatMinor(d.priceMinor, DEFAULT_CURRENCY)
                              : "—"}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
<<<<<<< HEAD
                        <div className="flex items-center border rounded-xs">
                          <button
                            className={cn(
                              "text-base hover:cursor-pointer px-3 py-1 hover:bg-neutral-100",
                              r.qty <= 1 &&
                                "pointer-events-none text-slate-300",
                            )}
                            aria-label="Restar unidad"
                            onClick={() =>
                              r.qty > 1 &&
                              dispatch(
                                setQty({
                                  slug: r.slug,
                                  variantId: r.variantId,
=======
                        <div className="flex items-center border rounded-lb">
                          <button
                            className="text-base hover:cursor-pointer px-3 py-1 hover:bg-neutral-100"
                            aria-label="Restar unidad"
                            onClick={() =>
                              dispatch(
                                setQty({
                                  slug: r.slug,
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
<<<<<<< HEAD
                            className={cn(
                              "text-base hover:cursor-pointer px-3 py-1 hover:bg-neutral-100",
                              isMaxed && "pointer-events-none text-slate-300",
                            )}
                            aria-label="Sumar unidad"
                            disabled={isMaxed}
                            onClick={() =>
                              dispatch(
                                setQty({
                                  slug: r.slug,
                                  variantId: r.variantId,
                                  qty: r.qty + 1,
                                }),
                              )
=======
                            className="text-base hover:cursor-pointer px-3 py-1 hover:bg-neutral-100"
                            aria-label="Sumar unidad"
                            onClick={() =>
                              dispatch(setQty({ slug: r.slug, qty: r.qty + 1 }))
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right text-sm font-medium tabular-nums">
                          {formatMinor(lineTotalMinor, DEFAULT_CURRENCY)}
                        </div>
                      </div>
                    </div>

                    <div className="flex h-full flex-col items-center justify-between px-1 py-1">
                      <FavoriteButton
                        isFavorite={isFavorite}
                        onToggle={() => {
                          // TODO: dispatch(toggleWishlist({ slug: r.slug }))
                        }}
                      />

                      <RemoveButton
<<<<<<< HEAD
                        className="mb-1"
                        onRemove={() =>
                          dispatch(
                            removeItem({
                              slug: r.slug,
                              variantId: r.variantId,
                            }),
                          )
                        }
=======
                        className="mt-1"
                        onRemove={() => dispatch(removeItem({ slug: r.slug }))}
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                      />
                    </div>
                  </div>
                );
              }

              const entry = item.entry;

              return (
                <CartUndoChip
                  key={`undo-${entry.slug}-${entry.removedAt}`}
                  entry={entry}
                  onUndo={handleUndo}
                  className="px-4 pb-2"
                  size="sm"
                />
              );
            })}
          </div>

          {rows.length > 0 && (
<<<<<<< HEAD
            <div className="shrink-0 px-4 border pt-2">
              {/* Error de stock en el mini cart */}
              {stockError && (
                <div className="text-xs pt-1 text-red-600">{stockError}</div>
              )}

=======
            <div className="shrink-0 border-t px-4">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              <div className="flex items-center py-4 justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{formatMinor(subtotalMinor, DEFAULT_CURRENCY)}</span>
              </div>
              <div className="pb-6 flex gap-6">
                <Button
                  asChild
                  className="flex-1 py-2 hover:cursor-pointer"
                  aria-label="Ir a la cesta"
                  variant={"outline"}
                >
                  <SheetClose asChild>
                    <Link href="/cart">Ir a la cesta</Link>
                  </SheetClose>
                </Button>
<<<<<<< HEAD
                <Button
                  type="button"
                  className="bg-green-600 flex-1 hover:bg-green-700"
                  aria-label="Proceder al pago"
                  disabled={isValidating || !!stockError}
                  onClick={handleCheckout}
                >
                  {isValidating && (
                    <ImSpinner8 className="animate-spin text-white" />
                  )}
                  {isValidating ? "..." : "Tramitar pedido"}
                </Button>
=======
                <SheetClose asChild>
                  <Link
                    href="/checkout"
                    className="flex-1 py-2 px-2 rounded-lb text-sm text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 transition-all duration-200 ease-in-out text-center"
                    aria-label="Proceder al pago"
                  >
                    Tramitar pedido
                  </Link>
                </SheetClose>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
