import Link from "next/link";
import { notFound } from "next/navigation";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaArrowLeft, FaBoxOpen, FaReceipt } from "react-icons/fa6";

import { UserOrderActions } from "@/components/account/UserOrderActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { auth } from "@/lib/auth";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  if (!order) notFound();

  const currency = parseCurrency(order.currency);

  const totalPaid = order.totalMinor;

  const totalRefunded = order.items.reduce((acc, item) => {
    return acc + item.priceMinorSnapshot * item.quantityReturned;
  }, 0);

  const finalTotal = totalPaid - totalRefunded;
  const isFullyReturned = order.status === "RETURNED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
          <Link href="/account/orders">
            <FaArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              dateStyle: "long",
            })}
          </p>
        </div>
      </div>

      {/* Avisos de Estado */}
      {order.status === "RETURN_REQUESTED" && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xs text-sm">
          <strong>Devolución en proceso:</strong> Tu solicitud está siendo
          revisada por nuestro equipo.
        </div>
      )}

      {order.rejectionReason && order.status === "PAID" && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xs text-sm">
          <strong>Solicitud rechazada:</strong> {order.rejectionReason}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Lista de Productos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FaBoxOpen className="text-muted-foreground" /> Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sizeSnapshot} / {item.colorSnapshot}
                    </p>

                    {/* Feedback de item devuelto */}
                    {item.quantityReturned > 0 && (
                      <div className="mt-1 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded">
                        Devuelto: {item.quantityReturned} de {item.quantity}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(item.subtotalMinor, currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x{" "}
                      {formatCurrency(item.priceMinorSnapshot, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaReceipt className="text-muted-foreground" /> Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal Pagado</span>
                <span>{formatCurrency(totalPaid, currency)}</span>
              </div>

              {totalRefunded > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Reembolsado</span>
                  <span>- {formatCurrency(totalRefunded, currency)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-base">
                <span>Total Final</span>
                <span>{formatCurrency(finalTotal, currency)}</span>
              </div>
            </CardContent>

            {/* Acciones (Solo si no ha devuelto todo ya) */}
            {!isFullyReturned &&
              (order.status === "PAID" ||
                order.status === "PENDING_PAYMENT" ||
                order.status === "RETURN_REQUESTED") && (
                <CardFooter className="bg-muted/20 p-3 border-t">
                  <UserOrderActions
                    orderId={order.id}
                    status={order.status}
                    items={order.items}
                  />
                </CardFooter>
              )}
          </Card>

          <Card>
            <CardContent className="p-4 text-sm">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dirección de Envío</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {order.street} <br />
                    {order.postalCode}, {order.city} <br />
                    {order.province}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
