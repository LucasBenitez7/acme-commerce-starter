"use client";

import Image from "next/image";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { ImSpinner8 } from "react-icons/im";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

import { useCartStore } from "@/store/cart";

export function CheckoutSummary() {
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const totalQty = getTotalItems();
  const total = getTotalPrice();
  const {
    formState: { isSubmitting },
  } = useFormContext() || { formState: { isSubmitting: false } };

  if (items.length === 0) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b px-4 pb-2 pt-4 shrink-0">
        <CardTitle className="text-xl p-0">
          Resumen del pedido{" "}
          {totalQty > 0 && <span className="text-lg">({totalQty})</span>}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col px-0 py-4">
        <ul className="space-y-4 pb-4 max-h-[450px] lg:max-h-full overflow-y-auto flex-1">
          {items.map((item) => {
            return (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 px-4"
              >
                <div className="relative aspect-[3/4] h-28 w-20 shrink-0 overflow-hidden rounded-xs bg-neutral-100">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  )}
                </div>

                {/* INFO */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between w-full gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium text-sm line-clamp-1 hover:underline underline-offset-4"
                        >
                          {item.name}
                        </Link>
                        <p className="font-medium text-sm tabular-nums">
                          {formatCurrency(
                            item.price * item.quantity,
                            DEFAULT_CURRENCY,
                          )}
                        </p>
                      </div>
                      <p className="text-xs font-medium">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-xs font-medium">X{item.quantity}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {items.length > 0 && (
          <div className="shrink-0 border-t p-4 pb-0 bg-background mt-auto">
            <div className="flex items-center justify-between text-sm font-normal mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-normal mb-4">
              <span>Envio</span>
              <span className="text-green-600">Gratis</span>
            </div>

            <div className="flex items-center justify-between text-base font-medium mb-4">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center justify-between my-2 gap-4">
              <Button
                type="submit"
                size="icon"
                disabled={isSubmitting}
                form="checkout-main-form"
                aria-label="Pagar ahora"
                className="w-full bg-green-600 hover:bg-green-700 h-11 text-background text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <ImSpinner8 className="animate-spin size-6" />
                  </>
                ) : (
                  "Pagar ahora"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
