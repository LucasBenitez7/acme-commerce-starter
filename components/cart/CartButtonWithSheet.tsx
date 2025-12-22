"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CgClose } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "sonner";

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
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const mounted = useMounted();
  const [isValidating, setIsValidating] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  useCloseOnNav(closeCart);

  const badgeText = totalQty > 9 ? "9+" : String(totalQty);

  async function handleCheckout() {
    if (items.length === 0) return;
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
        <HiOutlineShoppingBag strokeWidth={2} className="size-[24px]" />
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
              <span className="absolute bottom-[12px] h-[4px] w-6 bg-transparent inline-flex items-center justify-center text-[10px] font-extrabold text-primary">
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
        <SheetHeader className="shrink-0 border-b px-4 h-[var(--header-h)] flex flex-row justify-between items-center space-y-0">
          <SheetTitle className="text-xl font-medium">
            Cesta ({totalQty})
          </SheetTitle>
          <SheetClose asChild>
            <button className="p-1 hover:bg-neutral-100 rounded-md transition-colors">
              <CgClose className="size-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        {/* BODY - LISTA DE ITEMS */}
        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <p className="font-medium mb-2">Tu cesta está vacía</p>
              <p className="text-muted-foreground text-sm mb-4">
                ¿No sabes qué comprar? ¡Mira nuestras novedades!
              </p>
              <SheetClose asChild>
                <Button variant="outline" asChild>
                  <Link href="/catalogo">Ir al catálogo</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                const isMaxed = item.quantity >= item.maxStock;

                return (
                  <li key={item.variantId} className="flex gap-4 p-4">
                    {/* IMAGEN */}
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border bg-neutral-100">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => closeCart()}
                            className="font-medium text-sm line-clamp-1 hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.size} / {item.color}
                          </p>
                        </div>
                        <p className="font-medium text-sm tabular-nums">
                          {formatCurrency(
                            item.price * item.quantity,
                            DEFAULT_CURRENCY,
                          )}
                        </p>
                      </div>

                      {/* CONTROLES CANTIDAD */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md h-8">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 hover:bg-neutral-100 disabled:opacity-50 h-full"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm tabular-nums min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            disabled={isMaxed}
                            className="px-2 hover:bg-neutral-100 disabled:opacity-50 h-full disabled:text-gray-300"
                          >
                            +
                          </button>
                        </div>

                        <RemoveButton
                          className="text-muted-foreground hover:text-red-600"
                          onRemove={() => {
                            removeItem(item.variantId);
                            toast("Producto eliminado", {
                              description: item.name,
                              action: {
                                label: "Deshacer",
                                onClick: () => addItem(item),
                              },
                              duration: 5000,
                            });
                          }}
                        />
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

            <div className="flex items-center justify-between text-base font-medium mb-4">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice, DEFAULT_CURRENCY)}</span>
            </div>

            <SheetClose asChild>
              <Link href="/cart">Ir a la cesta</Link>
            </SheetClose>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-base"
              disabled={isValidating || !!stockError}
              onClick={handleCheckout}
            >
              {isValidating ? (
                <>
                  <ImSpinner8 className="animate-spin mr-2" />
                  Verificando stock...
                </>
              ) : (
                "Tramitar pedido"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
