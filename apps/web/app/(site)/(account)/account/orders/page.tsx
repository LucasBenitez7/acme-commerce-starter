import Link from "next/link";
import { FaCalendar, FaMapMarkerAlt } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { auth } from "@/lib/auth";
import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return (
        <span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Pagado
        </span>
      );
    case "PENDING_PAYMENT":
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Pendiente
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Cancelado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
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
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
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
              <CardHeader className="border-b bg-muted/40 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid gap-1">
                    <CardTitle className="text-base">
                      Pedido{" "}
                      <span className="font-mono text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FaCalendar className="h-3 w-3" />
                      {createdDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-lg font-bold">
                      {formatMinor(order.totalMinor, currency)}
                    </span>
                  </div>
                </div>
              </CardHeader>
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
                          <span>{item.nameSnapshot}</span>
                          {/* MOSTRAR VARIANTES (Talla/Color) */}
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
                  </div>

                  <div className="space-y-1 text-right sm:text-left">
                    <div className="flex items-center gap-1 font-medium sm:justify-end">
                      <FaMapMarkerAlt className="h-3 w-3 text-muted-foreground" />
                      Envío
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingType === "HOME"
                        ? "A domicilio"
                        : "Recogida en tienda"}{" "}
                      <br />
                      {order.city}, {order.province}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
