import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Button, Container } from "@/components/ui";

import { formatMinor } from "@/lib/currency";
import {
  buildOrderDraftFromCart,
  type CartLineInput,
} from "@/lib/server/orders";

type CartCookieV1 = {
  v: 1;
  items: { s: string; q: number }[];
};

function parseCartCookie(raw: string | undefined): CartLineInput[] {
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as CartCookieV1;

    if (data?.v !== 1 || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .map((item) => ({
        slug: item.s,
        qty: item.q,
      }))
      .filter((line) => line.slug && line.qty > 0);
  } catch {
    return [];
  }
}

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const rawCart = cookieStore.get("cart.v1")?.value;

  const lines = parseCartCookie(rawCart);
  const orderDraft = await buildOrderDraftFromCart(lines);
  const totalQty = orderDraft.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const hasItems = orderDraft.items.length > 0;

  return (
    <Container className="py-4 px-0">
      {!hasItems ? (
        <div className="rounded-lb border p-6 text-sm">
          <p className="mb-3 font-medium">Tu cesta está vacía</p>
          <p className="mb-4 text-muted-foreground">
            Añade algunos productos para ir al proceso de compra.
          </p>
          <Button asChild variant="default" className="px-4">
            <Link href="/catalogo">Ir al catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          {/* Columna izquierda: formulario multipaso */}
          <section className="space-y-4">
            <CheckoutForm />
          </section>

          {/* Columna derecha: resumen del pedido */}
          <aside className="lg:sticky lg:top-18">
            <div
              className="flex flex-col rounded-lb border bg-background py-4 
               lg:h-[calc(100vh-5.5rem)]"
            >
              {/* Header del resumen (siempre visible) */}
              <header className="mb-3 shrink-0  border-b px-4">
                <h2 className="flex items-baseline gap-1 text-lg pb-3 font-semibold">
                  Resumen de la compra{" "}
                  <span className="text-base">({totalQty})</span>
                </h2>
              </header>

              {/* Body scrollable */}
              <div className="flex-1 overflow-y-auto px-4">
                <ul className="space-y-2 text-sm">
                  {orderDraft.items.map((item) => {
                    const lineTotalMinor = item.subtotalMinor;

                    return (
                      <li
                        key={item.productId}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1"
                      >
                        <div
                          className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lb bg-neutral-100"
                          aria-hidden="true"
                        >
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        <div className="flex h-full justify-between py-1 font-medium">
                          <div className="space-y-1">
                            <p className="text-sm">{item.name}</p>
                            <p className="text-xs">M</p>
                            <p className="text-xs">Negro</p>
                            <div className="flex gap-1">
                              {item.quantity > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  {lineTotalMinor
                                    ? formatMinor(
                                        lineTotalMinor / item.quantity,
                                        orderDraft.currency,
                                      )
                                    : "—"}
                                </div>
                              )}
                              <p className="text-xs">x{item.quantity}</p>
                            </div>
                          </div>

                          <div className="text-sm font-medium">
                            {formatMinor(lineTotalMinor, orderDraft.currency)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <footer className="mt-3 shrink-0 pt-3 px-4 border-t">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span className="text-lg">Total</span>
                  <span>
                    {formatMinor(orderDraft.totalMinor, orderDraft.currency)}
                  </span>
                </div>
              </footer>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
