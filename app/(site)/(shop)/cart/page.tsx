"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button, RemoveButton } from "@/components/ui";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

import { useCartStore } from "@/store/cart";
import { useStore } from "@/store/use-store";

import { validateStockAction } from "./actions";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const cartStore = useStore(useCartStore, (state) => state);
  const items = cartStore?.items ?? [];
  const totalPrice = cartStore?.getTotalPrice() ?? 0;

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [isValidating, setIsValidating] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const hasItems = items.length > 0;

  async function handleCheckout() {
    if (!hasItems) return;
    setIsValidating(true);
    setStockError(null);

    const validationItems = items.map((r) => ({
      variantId: r.variantId,
      qty: r.quantity,
    }));

    const result = await validateStockAction(validationItems);

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

  if (!cartStore) return null;

  return (
    <main className="pt-2 pb-8 max-w-[1440px] mx-auto px-4 min-h-[60vh]">
      <h1 className="py-6 text-3xl font-semibold">Tu Cesta</h1>

      {!hasItems ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="mb-4 text-lg font-medium">Tu cesta está vacía</p>
          <Button asChild variant="default">
            <Link href="/catalogo">Explorar catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* LISTA DE ITEMS */}
          <div className="space-y-4">
            {stockError && (
              <div className="rounded-md bg-red-50 p-4 font-medium text-sm text-red-600 border border-red-200">
                !{stockError}
              </div>
            )}

            <div className="rounded-lg border bg-white overflow-hidden divide-y">
              {items.map((item) => {
                const isMaxed = item.quantity >= item.maxStock;

                return (
                  <div key={item.variantId} className="p-4 flex gap-4 sm:gap-6">
                    {/* IMAGEN */}
                    <div className="relative h-24 w-20 sm:h-32 sm:w-28 shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* DETALLES */}
                    <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-4">
                      <div className="space-y-1">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium hover:underline text-lg"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.size} / {item.color}
                        </p>
                        <p className="text-sm font-medium">
                          {formatCurrency(item.price, DEFAULT_CURRENCY)}
                        </p>
                      </div>

                      {/* CONTROLES */}
                      <div className="flex items-center gap-4 self-start sm:self-center">
                        <div className="flex items-center border rounded-md h-9">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="px-3 hover:bg-neutral-100 h-full disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center tabular-nums text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="px-3 hover:bg-neutral-100 h-full disabled:opacity-50 disabled:bg-neutral-50"
                            disabled={isMaxed}
                          >
                            +
                          </button>
                        </div>
                        <RemoveButton
                          onRemove={() => removeItem(item.variantId)}
                        />
                      </div>
                    </div>

                    {/* PRECIO TOTAL FILA */}
                    <div className="hidden sm:block font-medium text-right min-w-[80px] self-center">
                      {formatCurrency(
                        item.price * item.quantity,
                        DEFAULT_CURRENCY,
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RESUMEN */}
          <div className="h-fit space-y-4">
            <div className="rounded-lg border bg-neutral-50 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Resumen</h2>

              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(totalPrice, DEFAULT_CURRENCY)}
                </span>
              </div>

              <div className="pt-4 border-t">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                  disabled={isValidating || !!stockError}
                  onClick={handleCheckout}
                >
                  {isValidating ? "Procesando..." : "Tramitar pedido"}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-2">
                Gastos de envío e impuestos calculados en el checkout.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
