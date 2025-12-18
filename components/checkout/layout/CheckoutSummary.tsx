"use client";

import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { formatCurrency } from "@/lib/currency";

import { useCartStore } from "@/store/cart";

export function CheckoutSummary() {
  const { items, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  if (items.length === 0) return null;

  return (
    <Card className="h-fit">
      <CardHeader className="bg-neutral-50/50 border-b pb-4">
        <CardTitle className="text-lg">Resumen del pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Lista de productos con scroll si es muy larga */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-3 text-sm"
            >
              <div className="relative w-16 h-16 bg-white rounded border overflow-hidden shrink-0">
                <Image
                  src={item.image || "/og/default-products.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-bl-md font-medium">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size} {item.color ? `/ ${item.color}` : ""}
                </p>
              </div>
              <p className="font-medium whitespace-nowrap">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totales */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
