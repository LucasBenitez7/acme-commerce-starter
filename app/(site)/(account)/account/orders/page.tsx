import { type OrderStatus } from "@prisma/client";
import Link from "next/link";
import { FaCalendar, FaMapMarkerAlt } from "react-icons/fa";

import { UserOrderActions } from "@/components/account/UserOrderActions";
import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getUserOrders } from "@/lib/account/queries";
import { auth } from "@/lib/auth";
import { parseCurrency, formatCurrency } from "@/lib/currency";
import { getShippingLabel } from "@/lib/locations";
import { ORDER_STATUS_CONFIG } from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_CONFIG[status as OrderStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config?.badge || "bg-gray-100 text-gray-800",
      )}
    >
      {config?.label || status}
    </span>
  );
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const session = await auth();

  if (!session?.user?.id) return null;

  // Lógica extraída
  const { orders, totalPages } = await getUserOrders(session.user.id, page);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xs border border-dashed p-8 text-center">
        <h3 className="mt-4 text-lg font-semibold">No tienes pedidos</h3>
        <Button asChild className="mt-4">
          <Link href="/catalogo">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mis Pedidos</h2>
        <p className="text-muted-foreground">
          Historial de tus compras y su estado actual.
        </p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const currency = parseCurrency(order.currency);
          const createdDate = new Date(order.createdAt).toLocaleDateString(
            "es-ES",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            },
          );
          const itemsCount = order.items.reduce(
            (acc, i) => acc + i.quantity,
            0,
          );

          return (
            <Card key={order.id} className="overflow-hidden">
              <div className="border-b bg-muted/40 p-4">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <div className="grid gap-2">
                    <div className="text-base">
                      Pedido{" "}
                      <span className="font-mono text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FaCalendar className="h-3 w-3" /> {createdDate}
                    </div>
                    <span>
                      <StatusBadge status={order.status} />
                    </span>
                  </div>

                  <div className="grid gap-3 h-max">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="border-b border-foreground text-xs font-medium hover:text-slate-700 hover:border-slate-600"
                    >
                      Ver detalles del pedido
                    </Link>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 text-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div className="space-y-2">
                    <p className="font-medium">Artículos ({itemsCount})</p>
                    <ul className="text-muted-foreground text-xs space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <li key={item.id} className="flex gap-2">
                          <span className="font-medium text-foreground">
                            {item.quantity}x
                          </span>
                          {item.product ? (
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-medium hover:underline"
                            >
                              {item.nameSnapshot}
                            </Link>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              {item.nameSnapshot}
                            </span>
                          )}

                          {(item.sizeSnapshot || item.colorSnapshot) && (
                            <span className="text-muted-foreground/70">
                              ({item.sizeSnapshot} / {item.colorSnapshot})
                            </span>
                          )}
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="pt-1 italic">
                          ... y {order.items.length - 3} más
                        </li>
                      )}
                    </ul>
                    <span className="text-xs font-semibold">
                      {formatCurrency(order.totalMinor, currency)}
                    </span>
                  </div>

                  <div className="space-y-1 text-right sm:text-left">
                    <div className="flex items-center gap-1 font-medium sm:justify-end">
                      <FaMapMarkerAlt className="h-3 w-3 text-muted-foreground" />{" "}
                      Envío
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getShippingLabel(
                        order.shippingType?.toLowerCase() || "home",
                      )}

                      <br />
                      {(order.postalCode || order.city) && (
                        <>
                          <br />
                          {order.postalCode}, {order.city}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>

              {(order.status === "PENDING_PAYMENT" ||
                order.status === "PAID" ||
                order.status === "RETURN_REQUESTED" ||
                order.status === "RETURNED") && (
                <div className="bg-muted/20 p-3 flex justify-end">
                  <div className="w-full sm:w-auto">
                    <UserOrderActions
                      orderId={order.id}
                      status={order.status}
                      items={order.items}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <PaginationNav totalPages={totalPages} page={page} />
    </div>
  );
}
