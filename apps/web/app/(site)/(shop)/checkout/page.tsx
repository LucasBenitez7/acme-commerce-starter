import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  const totalQty = orderDraft.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const hasItems = orderDraft.items.length > 0;

  if (!hasItems) {
    redirect("/catalogo");
  }

  return (
    <Container className="px-0">
      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)] lg:items-start">
        {/* Columna izquierda: header + formulario + footer (solo en desktop) */}
        <section className="flex flex-col lg:min-h-screen px-4">
          {/* Header local del checkout */}
          <header className="sticky top-0 z-[100] flex h-[var(--header-h)] w-full items-center border-b bg-background">
            <div className="mx-auto flex h-[var(--header-h)] w-max items-center px-4 sm:px-6">
              <Link
                href="/"
                className="flex justify-self-center px-2 text-3xl font-semibold focus:outline-none"
              >
                Logo lsb
              </Link>
            </div>
          </header>

          {/* Contenido principal */}
          <div className="flex-1 py-4">
            <CheckoutForm />
          </div>

          {/* Footer local SOLO en desktop */}
          <footer className="hidden border-t bg-background py-6 px-4 text-xs text-muted-foreground lg:block">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} lsbstack. Todos los derechos
                reservados.
              </p>
              <div className="flex items-center gap-3">
                <Link href="#" className="hover:underline">
                  Privacidad
                </Link>
                <Link href="#" className="hover:underline">
                  Términos
                </Link>
                <Link href="#" className="hover:underline">
                  Contacto
                </Link>
              </div>
            </div>
          </footer>
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
            <footer className="mt-3 border-t shrink-0 px-4">
              <div className="flex items-center justify-between pt-4 text-sm">
                <span className="text-base">Descuentos</span>
                <span>45,50 €</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold pb-6 pt-4">
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
            <Link href="#" className="hover:underline">
              Privacidad
            </Link>
            <Link href="#" className="hover:underline">
              Términos
            </Link>
            <Link href="#" className="hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </Container>
  );
}
