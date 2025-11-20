import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CheckoutLocalFooter } from "@/components/checkout/CheckoutLocalFooter";
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

  if (!orderDraft.items.length) {
    redirect("/catalogo");
  }

  const totalQty = orderDraft.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <Container className="px-0">
      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)] lg:items-start">
        {/* Columna izquierda: header + formulario + footer (solo en desktop) */}
        <section className="flex flex-col px-4 lg:min-h-screen">
          {/* Header local del checkout */}
          <CheckoutHeader />

          {/* Contenido principal */}
          <div className="flex-1 py-4">
            <CheckoutForm />
          </div>

          {/* Footer local SOLO en desktop */}
          <CheckoutLocalFooter />
        </section>

        {/* Columna derecha: resumen del pedido */}
        <aside className="lg:sticky lg:top-0">
          <div className="flex h-full flex-col border bg-background lg:h-screen">
            {/* Header del resumen (siempre visible) */}
            <header className="shrink-0 px-4">
              <h2 className="flex items-baseline gap-1 py-4 text-lg font-semibold">
                Resumen de compra{" "}
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
                        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lb bg-neutral-100"
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
                          {/* TODO: tallas/colores reales en el futuro */}
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

            {/* Footer del resumen */}
            <footer className="mt-3 shrink-0 border-t px-4">
              <div className="flex items-center justify-between pt-4 text-sm">
                <span className="text-base">Descuentos</span>
                {/* TODO: conectar con promos reales */}
                <span>45,50 €</span>
              </div>
              <div className="flex items-center justify-between pb-6 pt-4 text-base font-semibold">
                <span className="text-lg">Total</span>
                <span>
                  {formatMinor(orderDraft.totalMinor, orderDraft.currency)}
                </span>
              </div>
            </footer>
          </div>
        </aside>
      </div>

      {/* Footer local SOLO en mobile: va debajo de TODO (incluido el resumen) */}
      <footer className="mt-6 border-t bg-background py-6 px-4 text-xs text-muted-foreground lg:hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} lsbstack. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:underline">
              Privacidad
            </a>
            <a href="#" className="hover:underline">
              Términos
            </a>
            <a href="#" className="hover:underline">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </Container>
  );
}
