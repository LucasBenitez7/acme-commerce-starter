"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CartUndoChip } from "@/components/cart/CartUndoChip";
import { Button, FavoriteButton, RemoveButton } from "@/components/ui";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCartUndoRows } from "@/hooks/use-cart-undo-rows";
import { useCartView } from "@/hooks/use-cart-view";
import { setQty, removeItem } from "@/store/cart.slice";

export default function CartPage() {
  const { rows, subtotalMinor } = useCartView();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { undoStack, rowsWithUndo, handleUndo } = useCartUndoRows(rows);

  const isFavorite = false; // TODO: conectar con wishlist

  const hasItems = rows.length > 0;

  return (
    <main className="pt-2 pb-8 max-w-[1440px] mx-auto px-4">
      <h1 className="py-4 text-2xl font-semibold">Cesta</h1>

      {!hasItems && !undoStack.length ? (
        <div className="rounded-lb border p-4 text-sm">
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
          <div className="border rounded-lb px-5 py-3 bg-background">
            {rowsWithUndo.map((item) => {
              if (item.kind === "row") {
                const r = item.row;
                const d = r.detail;
                const lineTotalMinor = (d?.priceMinor ?? 0) * r.qty;

                return (
                  <div
                    key={r.slug}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2"
                  >
                    <div className="h-52 w-36 shrink-0 bg-muted">
                      {d?.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.imageUrl}
                          alt={d.name}
                          className="h-full w-full rounded-lb object-cover"
                        />
                      )}
                    </div>

                    <div className="flex flex-col justify-between min-w-0 h-full py-1">
                      <div className="flex flex-col gap-2">
                        <div className="truncate text-sm font-medium">
                          {d?.name ?? r.slug}
                        </div>
                        <div className="flex gap-2 text-xs mb-1">
                          <span className="border-r pr-2 uppercase">S</span>
                          <span>Marrón</span>
                        </div>
                        {r.qty > 1 && (
                          <div className="text-xs font-medium text-muted-foreground">
                            {d
                              ? formatMinor(d.priceMinor, DEFAULT_CURRENCY)
                              : "—"}
                          </div>
                        )}
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
                        className="mt-1"
                        onRemove={() => dispatch(removeItem({ slug: r.slug }))}
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
            <aside className="lg:sticky lg:top-18 h-max border rounded-lb px-4 bg-background">
              <div className="flex items-center justify-between text-lg  py-4 font-medium">
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
              </div>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
