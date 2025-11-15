import { cookies } from "next/headers";
import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/ui";

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

  const hasItems = orderDraft.items.length > 0;

  return (
    <Container className="py-8 md:py-10">
      {/* Header especial de checkout */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/60 px-4 py-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Finaliza tu compra
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Completa tus datos, elige el método de pago y revisa tu pedido.
          </p>
        </div>

        <div className="text-[11px] text-muted-foreground md:text-xs">
          <span className="font-medium">Checkout de prueba</span>
          <span className="mx-1">·</span>
          <span>
            Los precios se recalculan desde la base de datos en cada pedido.
          </span>
        </div>
      </div>

      {!hasItems ? (
        <div className="rounded-lg border bg-muted/40 p-6 text-sm">
          <p className="mb-3 font-medium">Tu carrito está vacío</p>
          <p className="mb-4 text-muted-foreground">
            Añade algunos productos al carrito antes de ir al checkout.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center text-sm font-medium underline-offset-2 hover:underline"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Columna izquierda: formulario multipaso */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Proceso de compra</h2>
            <CheckoutForm />
          </section>

          {/* Columna derecha: resumen del pedido (sticky en desktop) */}
          <aside className="h-max space-y-4 rounded-lg border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Resumen del pedido</h2>

            <ul className="space-y-3 text-sm">
              {orderDraft.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right text-sm font-medium">
                    {formatMinor(item.subtotalMinor, orderDraft.currency)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="h-px w-full bg-border" />

            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>
                {formatMinor(orderDraft.totalMinor, orderDraft.currency)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              * Los precios se recalculan automáticamente a partir de los
              productos en la base de datos.
            </p>
          </aside>
        </div>
      )}
    </Container>
  );
}
