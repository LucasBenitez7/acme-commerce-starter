import Link from "next/link";
import { FaCalendar, FaMapMarkerAlt } from "react-icons/fa";

import { UserOrderActions } from "@/components/account/UserOrderActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { auth } from "@/lib/auth";
import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center rounded-xs bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Pagado
        </span>
      );
    case "PENDING_PAYMENT":
      return (
        <span className="inline-flex items-center rounded-xs bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Pendiente
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center rounded-xs bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Cancelado
        </span>
      );
    case "RETURN_REQUESTED":
      return (
        <span className="inline-flex items-center rounded-xs bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200 animate-pulse">
          Devolución Solicitada
        </span>
      );
    case "RETURNED":
      return (
        <span className="inline-flex items-center rounded-xs bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
          Devuelto
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-xs bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          {status}
        </span>
      );
  }
}

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
    },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xs border border-dashed p-8 text-center animate-in fade-in-50">
        <h3 className="mt-4 text-lg font-semibold">No tienes pedidos</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Parece que aún no has comprado nada. ¡Echa un vistazo al catálogo!
        </p>
        <Button asChild>
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
                      <FaCalendar className="h-3 w-3" />
                      {createdDate}
                    </div>
                    <span>{getStatusBadge(order.status)}</span>
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
                      {formatMinor(order.totalMinor, currency)}
                    </span>
                  </div>

                  <div className="space-y-1 text-right sm:text-left">
                    <div className="flex items-center gap-1 font-medium sm:justify-end">
                      <FaMapMarkerAlt className="h-3 w-3 text-muted-foreground" />
                      Envío
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingType === "HOME" && "Envío a domicilio"}
                      {order.shippingType === "STORE" && "Retirar en tienda"}
                      {order.shippingType === "PICKUP" && "Punto de recogida"}
                      {order.pickupLocationId} - {order.postalCode} -{" "}
                      {order.city} - {order.province} - {order.street} -{" "}
                      {order.storeLocationId}
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
    </div>
  );
}
