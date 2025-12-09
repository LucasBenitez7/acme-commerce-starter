import Link from "next/link";
import { notFound } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaArrowLeft, FaBoxOpen, FaTruck, FaUser } from "react-icons/fa6";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import {
  AdminCancelButton,
  AdminPayButton,
  AdminRejectButton,
} from "../../../components/AdminOrderActions";
import { ReturnDialog } from "../../../components/ReturnDialog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: true,
    },
  });

  if (!order) notFound();

  const currency = parseCurrency(order.currency);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header de Navegación */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
          <Link href="/admin/orders">
            <FaArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              Pedido #{order.id.slice(-8).toUpperCase()}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 border border-neutral-200">
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Realizado el {new Date(order.createdAt).toLocaleString("es-ES")}
          </p>
        </div>

        {/* CASO 1: Pendiente */}
        <div className="flex gap-2">
          {order.status === "PENDING_PAYMENT" && (
            <>
              <AdminPayButton orderId={order.id} />
              <AdminCancelButton orderId={order.id} />
            </>
          )}

          {/* CASO 2: Si está Pagado*/}
          {order.status === "PAID" && (
            <span className="text-xs text-muted-foreground border px-3 py-1.5 rounded bg-neutral-50">
              Pedido completado. Esperando cliente.
            </span>
          )}

          {/* CASO 3: El cliente pidió devolución (Admin actúa) */}
          {order.status === "RETURN_REQUESTED" && (
            <>
              {/* Botón VERDE: Aceptar y devolver stock */}
              <ReturnDialog orderId={order.id} items={order.items} />

              {/* Botón ROJO: Rechazar solicitud (con motivo) */}
              <AdminRejectButton orderId={order.id} />
            </>
          )}

          {/* BLOQUE VISUAL DE MOTIVOS (Para que el admin sepa qué pasa) */}
          {order.returnReason && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xs">
              <p className="font-bold text-xs uppercase tracking-wide mb-1">
                Motivo del cliente:
              </p>
              <p className="text-sm">"{order.returnReason}"</p>
            </div>
          )}

          {order.rejectionReason && order.status === "PAID" && (
            <div className="bg-gray-100 border border-gray-200 text-gray-600 p-4 rounded-xs">
              <p className="font-bold text-xs uppercase tracking-wide mb-1">
                Devolución rechazada anteriormente:
              </p>
              <p className="text-sm">"{order.rejectionReason}"</p>
            </div>
          )}

          {order.status === "RETURN_REQUESTED" && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xs flex items-center gap-3">
              <FaExclamationTriangle className="h-5 w-5" />
              <div>
                <p className="font-bold text-sm">Solicitud de Devolución</p>
                <p className="text-xs">
                  El cliente ha solicitado devolver este pedido. Revisa los
                  productos y usa el botón "Gestionar Devolución" para
                  procesarlo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Columna Izquierda: Items y Totales */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaBoxOpen className="text-neutral-500" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 flex justify-between text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.nameSnapshot}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.sizeSnapshot && `Talla: ${item.sizeSnapshot}`}
                        {item.sizeSnapshot && item.colorSnapshot && " · "}
                        {item.colorSnapshot && `Color: ${item.colorSnapshot}`}
                      </span>

                      {item.quantityReturned > 0 && (
                        <span className="inline-flex mt-1 w-fit items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                          Devuelto: {item.quantityReturned} / {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatMinor(item.subtotalMinor, currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} x{" "}
                        {formatMinor(item.priceMinorSnapshot, currency)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{formatMinor(order.totalMinor, currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Datos del Cliente */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaUser className="text-neutral-500" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="font-medium">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-muted-foreground">{order.email}</p>
                <p className="text-muted-foreground">{order.phone}</p>
              </div>

              {order.user && (
                <div className="pt-3 border-t mt-3">
                  <p className="text-xs text-muted-foreground">
                    Usuario registrado:
                  </p>
                  <Link
                    href={`/admin/users/${order.userId}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver perfil
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaTruck className="text-neutral-500" />
                Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium mb-1">
                {order.shippingType === "HOME" && "Envío a domicilio"}
                {order.shippingType === "STORE" && "Recogida en tienda"}
                {order.shippingType === "PICKUP" && "Punto de recogida"}
              </p>
              <div className="text-muted-foreground">
                <p>{order.street}</p>
                {order.addressExtra && <p>{order.addressExtra}</p>}
                <p>
                  {order.postalCode} {order.city}
                </p>
                <p>{order.province}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
