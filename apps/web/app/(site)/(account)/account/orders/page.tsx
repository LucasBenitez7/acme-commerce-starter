import { buildShippingSummary } from "@/components/checkout/shared/checkout-summary";

import { auth } from "@/lib/auth";
import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import type { ShippingType as ClientShippingType } from "@/hooks/use-checkout-form";
import type { ShippingType as ShippingTypeDb } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

function mapShippingType(type: ShippingTypeDb | null): ClientShippingType {
  if (type === "STORE") return "store";
  if (type === "PICKUP") return "pickup";
  return "home";
}

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user || !("id" in session.user)) {
    // El layout ya debería redirigir antes de llegar aquí
    return null;
  }

  const userId = (session.user as any).id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <section className="rounded-lb border bg-card p-4 text-sm">
        <h2 className="text-base font-semibold">Mis pedidos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no has realizado ningún pedido con esta cuenta.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Mis pedidos</h2>

      <div className="space-y-3">
        {orders.map((order) => {
          const currency = parseCurrency(order.currency);
          const created = new Intl.DateTimeFormat("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(order.createdAt);

          const itemsCount = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          const shippingTypeClient = mapShippingType(order.shippingType);

          const shipping = buildShippingSummary({
            shippingType: shippingTypeClient,
            street: order.street,
            addressExtra: order.addressExtra,
            postalCode: order.postalCode,
            province: order.province,
            city: order.city,
            storeLocationId: order.storeLocationId,
            pickupLocationId: order.pickupLocationId,
            pickupSearch: order.pickupSearch,
          });

          return (
            <article
              key={order.id}
              className="rounded-lb border bg-card p-3 text-sm"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Pedido {order.id.slice(0, 8)}…
                  </p>
                  <p className="text-xs text-muted-foreground">{created}</p>
                </div>

                <div className="text-right text-xs">
                  <p className="font-semibold">
                    {formatMinor(order.totalMinor, currency)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {itemsCount} artículo{itemsCount !== 1 ? "s" : ""} ·{" "}
                    {shipping.label}
                  </p>
                </div>
              </header>

              {/* Si quieres, aquí podrías mostrar también `shipping.details` resumido */}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {shipping.details}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
