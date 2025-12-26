"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ImSpinner8 } from "react-icons/im";

import { CartUndoNotification } from "@/components/cart/CartUndoNotification";
import { Button, RemoveButton, FavoriteButton } from "@/components/ui";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

import { useCartStore } from "@/store/cart";
import { useStore } from "@/store/use-store";

import { validateStockAction } from "./actions";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const cartStore = useStore(useCartStore, (state) => state);
  const items = cartStore?.items ?? [];
  const totalQty = cartStore?.getTotalItems() ?? 0;
  const totalPrice = cartStore?.getTotalPrice() ?? 0;

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const hasItems = items.length > 0;

  async function handleCheckout() {
    if (items.length === 0) return;

    setLoading(true);
    setStockError(null);

    const validationItems = items.map((r) => ({
      variantId: r.variantId,
      qty: r.quantity,
    }));

    const result = await validateStockAction(validationItems);

    if (!result.success && result.error) {
      setStockError(result.error);
      setLoading(false);
      return;
    }

    if (session?.user) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirectTo=/checkout");
    }
  }

  if (!cartStore) return null;

  return (
    <main className="pb-10 w-full max-w-[1440px] mx-auto px-4 min-h-[60vh]">
      <h1 className="text-2xl font-semibold my-5">
        Cesta
        {totalQty > 0 && (
          <span className="text-xl font-semibold"> ({totalQty})</span>
        )}
      </h1>

      {!hasItems ? (
        <div className="text-center">
          <CartUndoNotification className="mb-6 border" />
          <p className="mb-2 text-lg font-medium">Tu cesta está vacía</p>
          <p className="text-muted-foreground text-sm mb-4">
            ¿No sabes qué comprar? ¡Mira nuestras novedades!
          </p>
          <Button asChild variant="default">
            <Link href="/catalogo">Explorar catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_450px]">
          {/* LISTA DE ITEMS */}
          <div className="space-y-4">
            {stockError && (
              <div className="rounded-md bg-red-50 p-4 font-medium text-sm text-red-600 border border-red-200">
                !{stockError}
              </div>
            )}

            <div className="rounded-xs border bg-white p-4 space-y-6 overflow-hidden">
              <CartUndoNotification className="mb-6" />
              {items.map((item) => {
                const isMaxed = item.quantity >= item.maxStock;
                const isOutOfStock = item.maxStock === 0;

                return (
                  <div key={item.variantId} className="p-0 flex gap-3">
                    {/* IMAGEN */}
                    <div className="relative aspect-[3/4] h-36 w-28 shrink-0 bg-neutral-100 rounded-xs overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/50">
                          <div className=" text-white/70 px-4 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white/70">
                            Agotado
                          </div>
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div className="flex justify-between gap-2">
                        <div className="space-y-1 w-full">
                          <div className="flex justify-between w-full">
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-semibold text-sm line-clamp-1 hover:underline underline-offset-4"
                            >
                              {item.name}
                            </Link>

                            <FavoriteButton
                              onToggle={() => {
                                false;
                              }}
                              isFavorite={false}
                            />
                          </div>
                          <p className="text-xs font-medium">
                            {item.size} / {item.color}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price, DEFAULT_CURRENCY)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CONTROLES */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center font-semibold border rounded-xs h-8">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="px-3 hover:cursor-pointer
														 hover:bg-neutral-100 disabled:opacity-50 h-full disabled:cursor-default"
                            >
                              -
                            </button>
                            <span className="px-2 text-sm tabular-nums min-w-[1.5rem] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1,
                                )
                              }
                              disabled={isMaxed}
                              className="px-3 hover:cursor-pointer
														 hover:bg-neutral-100 disabled:opacity-50 h-full  disabled:cursor-default"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-medium text-sm tabular-nums">
                            {formatCurrency(
                              item.price * item.quantity,
                              DEFAULT_CURRENCY,
                            )}
                          </p>
                        </div>

                        <RemoveButton
                          className="text-muted-foreground hover:text-red-600 size-4 mr-[3px]"
                          onRemove={() => {
                            removeItem(item.variantId);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RESUMEN */}
          <div className="h-fit space-y-4 sticky top-32">
            <div className="rounded-xs border p-4 space-y-2">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Resumen
              </h2>

              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice, DEFAULT_CURRENCY)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>Envio</span>
                <span>Gratis</span>
              </div>

              <div className="flex items-center justify-between text-base font-medium mt-4">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, DEFAULT_CURRENCY)}</span>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  size="icon"
                  aria-label="Tramitar pedido"
                  className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
                  disabled={loading || !!stockError}
                  onClick={handleCheckout}
                >
                  {loading ? (
                    <>
                      <ImSpinner8 className="animate-spin size-6" />
                    </>
                  ) : (
                    "Tramitar pedido"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
