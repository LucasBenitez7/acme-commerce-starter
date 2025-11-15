import Link from "next/link";
import { redirect } from "next/navigation";

import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { Container } from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: {
    orderId?: string;
  };
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const orderId = searchParams.orderId;

  if (!orderId) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    redirect("/");
  }

  const currency = parseCurrency(order.currency);

  return (
    <Container className="py-10 md:py-12">
      <ClearCartOnMount />

      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Pedido realizado
        </h1>
        <p className="text-sm text-muted-foreground">
          Gracias por tu compra. Más adelante conectaremos el envío de correos
          de confirmación.
        </p>
      </div>

      <div className="mb-6 rounded-lg border bg-card p-4 sm:p-6">
        <p className="text-sm font-medium">
          Número de pedido:{" "}
          <span className="font-mono text-xs md:text-sm">{order.id}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Guarda este identificador por si necesitas contactar con soporte.
        </p>
      </div>

      <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Resumen del pedido</h2>

        <ul className="space-y-3 text-sm">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.nameSnapshot}</p>
                <p className="text-xs text-muted-foreground">
                  Cantidad: {item.quantity}
                </p>
              </div>
              <div className="text-right text-sm font-medium">
                {formatMinor(item.subtotalMinor, currency)}
              </div>
            </li>
          ))}
        </ul>

        <div className="h-px w-full bg-border" />

        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total del pedido</span>
          <span>{formatMinor(order.totalMinor, currency)}</span>
        </div>

        <div className="mt-4">
          <Link
            href="/catalogo"
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </section>
    </Container>
  );
}
