"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FaCheckCircle, FaBoxOpen } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

import { useCartStore } from "@/store/cart";

import type { DisplayOrder } from "@/lib/orders/utils";

export function SuccessClient({ order }: { order: DisplayOrder }) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();

    localStorage.removeItem("checkout_session");
  }, [clearCart]);

  const totalItemsQty = order.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const createdDate = new Date(order.createdAt).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="space-y-4 flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="space-y-3 w-full font-medium text-sm">
        <h1 className="text-2xl font-bold items-center flex gap-3 justify-center  text-green-700">
          Pedido realizado con exito
          <FaCheckCircle className="size-8" />
        </h1>

        <p className="w-fit">
          Se enviara un correo de confirmación a{" "}
          <span className="font-semibold">{order.email}</span>
        </p>
      </div>

      <div className="w-full space-y-4">
        <Card className="px-4">
          <CardHeader className="py-3 pb-1 border-b">
            <CardTitle className="text-lg font-semibold flex items-center justify-center">
              Detalles del pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 py-4 px-0 text-sm font-medium">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold uppercase mb-1">Nº de Pedido</h3>
                <p className="font-mono text-xs uppercase">
                  {order.id.toUpperCase()}
                </p>
              </div>

              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  Método de pago
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  Datos de contacto
                </h3>
                <p>{order.contact.name}</p>
                <p>{order.email}</p>
                <p>{order.contact.phone}</p>
              </div>

              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  {order.shippingInfo.label}
                </h3>
                <div className="space-y-1">
                  {order.shippingInfo.addressLines.map((line, i) => (
                    <p key={i}>{line} </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. RESUMEN DE ITEMS */}
        <Card className="overflow-hidden px-4">
          <CardHeader className="py-4 pb-2 px-0 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-1">
              Productos
              <span className="text-base">({totalItemsQty})</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0">
            <ul className="py-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-2">
                  <div className="relative aspect-[3/4] h-28 w-20 shrink-0 overflow-hidden rounded-xs bg-neutral-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-300">
                        <FaBoxOpen />
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex flex-1 flex-col ">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium text-sm text-foreground hover:underline underline-offset-4"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs font-medium mt-1">
                          {item.subtitle}
                        </p>
                        <p className="text-xs  font-medium">X{item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm tabular-nums text-right mt-1">
                        {formatCurrency(
                          item.price * item.quantity,
                          DEFAULT_CURRENCY,
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* TOTALES */}
            <div className="border-t py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span
                  className={
                    order.totals.shipping === 0
                      ? "text-green-600 font-medium"
                      : ""
                  }
                >
                  {order.totals.shipping === 0
                    ? "Gratis"
                    : formatCurrency(order.totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-3">
                <span>Total</span>
                <span>{formatCurrency(order.totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            variant="outline"
            className="flex-1 py-3 text-sm font-medium"
          >
            <Link href="/">Volver a la tienda</Link>
          </Button>
          <Button asChild variant="default" className="flex-1 py-3 text-sm">
            <Link href={`/account/orders/${order.id}`}>
              Ver detalles del pedido
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
