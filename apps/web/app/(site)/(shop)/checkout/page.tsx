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
    <Container className="py-10 md:py-12">
      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Checkout
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisa tu pedido y completa tus datos para tramitarlo.
        </p>
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
          {/* Columna izquierda: formulario */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Datos de contacto y envío</h2>
            <CheckoutForm />
          </section>

          {/* Columna derecha: resumen del pedido */}
          <aside className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
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
