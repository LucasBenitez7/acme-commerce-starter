"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";

import { CartUndoNotification } from "@/components/cart/CartUndoNotification";
import { Button, RemoveButton } from "@/components/ui";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

import { validateStockAction } from "@/app/(site)/(shop)/cart/actions";
import { useCloseOnNav } from "@/hooks/common/use-close-on-nav";
import { useMounted } from "@/hooks/common/use-mounted";
import { useCartStore } from "@/store/cart";
import { useStore } from "@/store/use-store";

export function CartButtonWithSheet() {
  const router = useRouter();
  const { data: session } = useSession();

  const cartStore = useStore(useCartStore, (state) => state);
  const items = cartStore?.items ?? [];
  const isOpen = cartStore?.isOpen ?? false;
  const totalQty = cartStore?.getTotalItems() ?? 0;
  const totalPrice = cartStore?.getTotalPrice() ?? 0;

  const closeCart = useCartStore((state) => state.closeCart);
  const openCart = useCartStore((state) => state.openCart);

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const mounted = useMounted();
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  useCloseOnNav(closeCart);

  const badgeText = totalQty > 9 ? "9+" : String(totalQty);

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

    closeCart();

    if (session?.user) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirectTo=/checkout");
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-lg" aria-label="cesta">
        <HiOutlineShoppingBag className="size-[24px]" />
      </Button>
    );
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative tip-bottom"
          data-tip="Cesta"
          aria-label="cesta"
        >
          <div className="relative flex items-center px-1 py-[6px]">
            <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
            {totalQty > 0 && (
              <span className="absolute bottom-[11px] h-[4px] w-6 bg-transparent inline-flex items-center justify-center text-[10px] font-extrabold text-primary">
                {badgeText}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="z-[190] w-[min(100vw,500px)] p-0 flex flex-col"
        overlayClassName="z-[180] bg-black/60"
      >
        {/* HEADER */}
        <SheetHeader className="shrink-0 border-b pl-4 pr-6 h-[var(--header-h)] flex flex-row justify-between items-center space-y-0">
          <SheetTitle className="text-xl font-medium">
            Cesta <span className="text-base">({totalQty})</span>
          </SheetTitle>
          <SheetClose asChild>
            <button
              aria-label="Cerrar cesta"
              className="p-1 hover:bg-neutral-100 rounded-xs transition-colors hover:cursor-pointer active:bg-neutral-100"
            >
              <CgClose className="size-6" />
            </button>
          </SheetClose>
        </SheetHeader>

        <CartUndoNotification className="px-4" />

        {/* BODY - LISTA DE ITEMS */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center  text-center">
              <p className="font-medium mb-2">Tu cesta está vacía</p>
              <p className="text-muted-foreground text-sm mb-4">
                ¿No sabes qué comprar? ¡Mira nuestras novedades!
              </p>
              <SheetClose asChild>
                <Button variant="outline" asChild>
                  <Link href="/catalogo">Explorar catálogo</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const isMaxed = item.quantity >= item.maxStock;
                const isOutOfStock = item.maxStock === 0;

                return (
                  <li key={item.variantId} className="flex gap-3 px-4">
                    {/* IMAGEN */}
                    <div className="relative aspect-[3/4] h-32 w-24 shrink-0 overflow-hidden rounded-xs bg-neutral-100">
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
                        <div className="space-y-1">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => closeCart()}
                            className="font-medium text-sm line-clamp-1 hover:underline underline-offset-4"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs font-medium">
                            {item.size} / {item.color}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price, DEFAULT_CURRENCY)}
                          </p>
                        </div>

                        <RemoveButton
                          className="text-muted-foreground hover:text-red-600 size-3.5 mt-[2px]"
                          onRemove={() => {
                            removeItem(item.variantId);
                          }}
                        />
                      </div>

                      {/* CONTROLES CANTIDAD */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center font-semibold border rounded-xs h-8">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
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
                              updateQuantity(item.variantId, item.quantity + 1)
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
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* FOOTER - TOTALES */}
        {items.length > 0 && (
          <div className="shrink-0 border-t p-4 bg-background">
            {stockError && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
                {stockError}
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-medium mb-2 text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice, DEFAULT_CURRENCY)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-medium mb-4 text-muted-foreground">
              <span>Envio</span>
              <span>Gratis</span>
            </div>

            <div className="flex items-center justify-between text-base font-medium mb-4">
              <span>Total</span>
              <span>{formatCurrency(totalPrice, DEFAULT_CURRENCY)}</span>
            </div>

            <div className="flex items-center justify-between my-2 gap-4">
              <Button
                type="button"
                asChild
                className="flex-1 py-3 font-semibold"
                aria-label="Ir a la cesta"
                variant={"outline"}
              >
                <SheetClose asChild>
                  <Link href="/cart">Ir a la cesta</Link>
                </SheetClose>
              </Button>

              <Button
                type="button"
                size="icon"
                aria-label="Tramitar pedido"
                className="flex-1 bg-green-600 hover:bg-green-700 h-11 font-semibold"
                disabled={!!stockError || loading}
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
        )}
      </SheetContent>
    </Sheet>
  );
}
