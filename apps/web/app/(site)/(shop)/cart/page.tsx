"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaRegTrashCan } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";

import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useCartView } from "@/hooks/use-cart-view";
import { setQty, removeItem } from "@/store/cart.slice";

export default function CartPage() {
  const { rows, subtotalMinor } = useCartView();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasItems = rows.length > 0;

  return (
    <main className="py-6 max-w-[1400px] mx-auto">
      <h1 className="mb-4 mx-2 text-2xl font-semibold">Cesta</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground">
          Tu carrito está vacío.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_minmax(320px,480px)]">
          <div className="border rounded-lb px-4">
            {rows.map((r) => {
              const d = r.detail;
              const lineTotalMinor = (d?.priceMinor ?? 0) * r.qty;

              return (
                <div
                  key={r.slug}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b py-6"
                >
                  <div className="h-52 w-36 shrink-0 bg-muted">
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
                      <div className="flex gap-2 text-xs mb-2">
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

                  <div className="flex h-full items-start py-1">
                    <button
                      type="button"
                      className="hover:cursor-pointer"
                      aria-label="Quitar del carrito"
                      onClick={() => dispatch(removeItem({ slug: r.slug }))}
                    >
                      <FaRegTrashCan className="size-[24px] p-[2px] text-slate-700 hover:text-primary" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {rows.length > 0 && (
            <aside className="h-max border rounded-lb p-4">
              <div className="flex items-center justify-between text-lg font-medium">
                <span>Subtotal</span>
                <span>{formatMinor(subtotalMinor, DEFAULT_CURRENCY)}</span>
              </div>
              <div className="mt-3 flex gap-6">
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
