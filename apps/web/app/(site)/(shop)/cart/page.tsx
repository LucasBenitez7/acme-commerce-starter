"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ImSpinner8 } from "react-icons/im";

import { CartUndoChip } from "@/components/cart/CartUndoChip";
import { Button, FavoriteButton, RemoveButton } from "@/components/ui";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCartUndoRows } from "@/hooks/use-cart-undo-rows";
import { useCartView } from "@/hooks/use-cart-view";
import { setQty, removeItem } from "@/store/cart.slice";

import { validateStockAction } from "./actions";

export default function CartPage() {
  const { rows, subtotalMinor } = useCartView();
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  return (
    <main className="pt-2 pb-8 max-w-[1440px] mx-auto px-4">
      <h1 className="py-4 text-2xl font-semibold">Cesta</h1>

      {!hasItems && !undoStack.length ? (
        <div className="rounded-xs border p-4 text-sm">
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
          <div className="border rounded-xs px-5 py-3 bg-background">
            {/* Mensaje de error de stock en la lista principal */}
            {stockError && (
              <div className="mb-4 rounded-xs bg-red-50 p-3 font-medium text-sm text-red-600 border border-red-200 animate-in fade-in slide-in-from-top-2">
                {stockError}
              </div>
            )}

            {rowsWithUndo.map((item) => {
              if (item.kind === "row") {
                const r = item.row;
                const d = r.detail;
                const lineTotalMinor = (d?.priceMinor ?? 0) * r.qty;

                return (
                  <div
                    key={`${r.slug}-${r.variantId}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2"
                  >
                    <div className="h-52 w-36 shrink-0 bg-muted">
                      {d?.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.imageUrl}
                          alt={d.name}
                          className="h-full w-full rounded-xs object-cover"
                        />
                      )}
                    </div>

                    <div className="flex flex-col justify-between min-w-0 h-full py-1">
                      <div className="flex flex-col gap-2">
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
                            {d
                              ? formatMinor(d.priceMinor, DEFAULT_CURRENCY)
                              : "—"}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-xs">
                          <button
                            className="text-base hover:cursor-pointer px-3 py-1  hover:bg-neutral-100"
                            aria-label="Restar unidad"
                            onClick={() =>
                              dispatch(
                                setQty({
                                  slug: r.slug,
                                  variantId: r.variantId,
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
                              dispatch(
                                setQty({
                                  slug: r.slug,
                                  variantId: r.variantId,
                                  qty: r.qty + 1,
                                }),
                              )
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
                        onRemove={() =>
                          dispatch(
                            removeItem({
                              slug: r.slug,
                              variantId: r.variantId,
                            }),
                          )
                        }
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
            <aside className="lg:sticky lg:top-18 h-max border rounded-xs px-4 bg-background">
              <div className="flex items-center justify-between text-lg py-4 font-medium">
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
              </div>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
