"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ImSpinner8 } from "react-icons/im";
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

import { CartUndoChip } from "@/components/cart/CartUndoChip";
import { Button, FavoriteButton, RemoveButton } from "@/components/ui";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";
<<<<<<< HEAD
import { cn } from "@/lib/utils";
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCartUndoRows } from "@/hooks/use-cart-undo-rows";
import { useCartView } from "@/hooks/use-cart-view";
import { setQty, removeItem } from "@/store/cart.slice";
<<<<<<< HEAD

import { validateStockAction } from "./actions";
=======
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))

export default function CartPage() {
  const { rows, subtotalMinor } = useCartView();
  const dispatch = useAppDispatch();
  const router = useRouter();
<<<<<<< HEAD
  const { data: session } = useSession();

  const { undoStack, rowsWithUndo, handleUndo } = useCartUndoRows(rows);

  const [isValidating, setIsValidating] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const isFavorite = false; // TODO: conectar con wishlist
  const hasItems = rows.length > 0;

  useEffect(() => {
    if (stockError) {
      setStockError(null);
    }
  }, [rows, undoStack]);

  async function handleCheckout() {
    if (!hasItems) return;
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (session?.user) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirectTo=/checkout");
    }
  }

=======

  const { undoStack, rowsWithUndo, handleUndo } = useCartUndoRows(rows);

  const isFavorite = false; // TODO: conectar con wishlist

  const hasItems = rows.length > 0;

>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
  return (
    <main className="pt-2 pb-8 max-w-[1440px] mx-auto px-4">
      <h1 className="py-4 text-2xl font-semibold">Cesta</h1>

      {!hasItems && !undoStack.length ? (
<<<<<<< HEAD
        <div className="rounded-xs border p-4 text-sm">
=======
        <div className="rounded-lb border p-4 text-sm">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
          <p className="mb-3 font-medium">Tu cesta está vacía</p>
          <p className="mb-4 text-muted-foreground">
            Explora en nuestra tienda para encontrar lo que necesitas
          </p>
          <Button asChild variant="default" className="px-4">
            <Link href="/catalogo">Ir al catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_minmax(320px,480px)]">
<<<<<<< HEAD
          <div className="border rounded-xs px-5 py-3 bg-background">
            {/* Mensaje de error de stock en la lista principal */}
            {stockError && (
              <div className="mt-1 mb-2 rounded-xs bg-red-50 p-3 font-medium text-xs text-red-600 border border-red-200 animate-in fade-in slide-in-from-top-2">
                {stockError}
              </div>
            )}

=======
          <div className="border rounded-lb px-5 py-3 bg-background">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
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
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2"
                  >
                    <div className="h-52 w-36 shrink-0 bg-muted relative">
=======

                return (
                  <div
                    key={r.slug}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2"
                  >
                    <div className="h-52 w-36 shrink-0 bg-muted">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                      {d?.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.imageUrl}
                          alt={d.name}
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
                        <div className="flex gap-2 text-xs">
                          {d?.variantName && (
                            <div className="text-xs font-medium flex gap-2 mb-0.5">
                              <span>{d.variantName}</span>
                            </div>
                          )}
                        </div>
                        {r.qty > 1 && (
                          <div className="text-xs font-normal text-muted-foreground">
=======
                        <div className="truncate text-sm font-medium">
                          {d?.name ?? r.slug}
                        </div>
                        <div className="flex gap-2 text-xs mb-1">
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
                              "text-base hover:cursor-pointer px-3 py-1  hover:bg-neutral-100",
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
                            className="text-base hover:cursor-pointer px-3 py-1  hover:bg-neutral-100"
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

              // ---- fila "Deshacer" ----
              const entry = item.entry;

              return (
                <CartUndoChip
                  key={`undo-${entry.slug}-${entry.removedAt}`}
                  entry={entry}
                  onUndo={handleUndo}
                  className="py-2"
                  size="md"
                />
              );
            })}
          </div>

          {rows.length > 0 && (
<<<<<<< HEAD
            <aside className="lg:sticky lg:top-18 h-max border rounded-xs px-4 bg-background">
              <div className="flex items-center justify-between text-lg py-4 font-medium">
=======
            <aside className="lg:sticky lg:top-18 h-max border rounded-lb px-4 bg-background">
              <div className="flex items-center justify-between text-lg  py-4 font-medium">
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
                <span>Subtotal</span>
                <span className="text-base">
                  {formatMinor(subtotalMinor, DEFAULT_CURRENCY)}
                </span>
              </div>
              <div className="pb-6 flex gap-6">
                <Button
                  asChild
                  className="flex-1 py-2 hover:cursor-pointer"
                  aria-label="Seguir comprando"
                  variant={"outline"}
                >
                  <Link href="/catalogo">Seguir comprando</Link>
                </Button>
<<<<<<< HEAD
                <Button
                  className="bg-green-600 flex-1 hover:bg-green-700"
                  aria-label="Proceder al pago"
                  disabled={!hasItems || isValidating || !!stockError}
                  onClick={handleCheckout}
                >
                  {isValidating && (
                    <ImSpinner8 className="animate-spin text-white" />
                  )}
                  {isValidating ? "Verificando..." : "Tramitar pedido"}
                </Button>
=======
                <button
                  type="button"
                  className="flex-1 py-2 px-2 rounded-lb text-sm text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 transition-all duration-200 ease-in-out"
                  aria-label="Proceder al pago"
                  disabled={!hasItems}
                  onClick={() => {
                    if (!hasItems) return;
                    router.push("/checkout");
                  }}
                >
                  Tramitar pedido
                </button>
>>>>>>> b4c8f25 (feat(fase-6): pedidos con datos de envío en Prisma + vista demo de orders (#29))
              </div>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
