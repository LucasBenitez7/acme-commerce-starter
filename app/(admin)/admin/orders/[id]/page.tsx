import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheck, FaUser, FaArrowLeft, FaClipboardList } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { getAdminOrderById } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";

import {
  AdminCancelButton,
  AdminPayButton,
  AdminRejectButton,
} from "../_components/AdminOrderActions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Usamos la Query Refactorizada
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  const currency = parseCurrency(order.currency);

  // 2. Usamos los datos pre-calculados del DTO
  // Ya no hacemos .reduce() aquí, viene del servicio
  const { originalQty, netTotalMinor, refundedAmountMinor, returnedQty } =
    order.summary;

  const requestedItems = order.items.filter(
    (i) => i.quantityReturnRequested > 0,
  );

  // --- CONFIGURACIÓN DE ESTADOS (Igual que antes) ---
  const statusConfig: Record<string, { label: string; color: string }> = {
    PAID: { label: "Pagado", color: "text-green-700" },
    PENDING_PAYMENT: { label: "Pendiente de Pago", color: "text-yellow-600" },
    RETURN_REQUESTED: { label: "Devolución Solicitada", color: "text-red-600" },
    RETURNED: { label: "Devuelto", color: "text-blue-700" },
    CANCELLED: { label: "Cancelado", color: "text-neutral-600" },
    EXPIRED: { label: "Expirado", color: "text-neutral-500" },
  };

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    color: "text-gray-700",
  };
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header de Navegación */}
      <div className="flex items-center justify-between border-b py-4">
        <Link href="/admin/orders">
          <FaArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          {order.status === "PENDING_PAYMENT" && (
            <div className="flex gap-3">
              <AdminPayButton orderId={order.id} />
              <AdminCancelButton orderId={order.id} />
            </div>
          )}

          {order.status === "RETURN_REQUESTED" && (
            <div className="flex gap-3">
              <Button asChild variant="default" size="sm">
                <Link href={`/admin/orders/${order.id}/return`}>
                  Gestionar Devolución
                </Link>
              </Button>
              <AdminRejectButton orderId={order.id} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* Columna Izquierda: Items y Totales */}
        <div className="space-y-4 font-medium">
          <Card className="px-4">
            <h2 className="text-lg font-semibold text-center py-3">
              Detalles del Pedido
            </h2>
            <CardContent className="space-y-3 py-3 px-0 border-t">
              <div className="space-y-3">
                <div className="flex flex-col justify-center items-start">
                  <h2 className="text-base font-semibold">Nro de Pedido:</h2>
                  <p className="text-xs font-medium">
                    {order.id.slice().toUpperCase()}
                  </p>
                </div>

                <div className="flex flex-col justify-center items-start">
                  <h2 className="text-base font-semibold">
                    Realizado en fecha:
                  </h2>
                  <p className="text-xs font-medium">
                    {new Date(order.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>

                <div className="text-xs font-medium flex flex-col justify-center items-start">
                  <h2 className="text-base font-semibold">Tipo de envío:</h2>
                  <p className="font-medium">
                    {order.shippingType === "HOME" && "Envío a domicilio"}
                    {order.shippingType === "STORE" && "Recogida en tienda"}
                    {order.shippingType === "PICKUP" && "Punto de recogida"}
                  </p>
                  <div className="text-foreground">
                    <p>{order.pickupLocationId}</p>
                    <p>{order.storeLocationId}</p>
                  </div>
                  <div className="text-foreground">
                    <p>{order.street}</p>
                    {order.addressExtra && <p>{order.addressExtra}</p>}
                    <p>
                      {order.postalCode} {order.city}
                    </p>
                    <p>{order.province}</p>
                  </div>
                </div>

                {/* --- PRODUCTOS --- */}
                <div className="flex flex-col justify-center items-start pt-3 border-t w-full">
                  <h2 className="text-base mb-1 font-semibold">Productos:</h2>
                  <ul className="w-full space-y-3 text-sm font-medium">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex w-full items-end justify-between text-sm"
                      >
                        <div className="flex flex-col ">
                          <div className="flex items-center">
                            <span className="text-sm font-medium border-foreground">
                              {item.nameSnapshot}
                            </span>
                          </div>
                          <span className="text-xs">
                            {item.sizeSnapshot && `${item.sizeSnapshot}`}
                            {item.sizeSnapshot && item.colorSnapshot && " / "}
                            {item.colorSnapshot && `${item.colorSnapshot}`}
                          </span>

                          <div className="text-xs flex gap-1">
                            <span className="text-xs">x{item.quantity}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(
                                item.priceMinorSnapshot,
                                currency,
                              )}
                            </span>
                          </div>
                          {item.quantityReturned > 0 && (
                            <span className="flex text-xs text-red-600">
                              Devuelto: {item.quantityReturned}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div>
                            {formatCurrency(item.subtotalMinor, currency)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* --- TOTALES Y RESUMEN --- */}
              <div className=" pt-4 pb-1 space-y-1 border-t">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({originalQty})</span>
                  <span>{formatCurrency(order.totalMinor, currency)}</span>
                </div>

                {refundedAmountMinor > 0 && (
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Devueltos ({returnedQty})</span>
                    <span>
                      - {formatCurrency(refundedAmountMinor, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 items-center font-semibold text-lg">
                  <span>
                    Total Neto{" "}
                    <span className="text-base">
                      ({originalQty - returnedQty})
                    </span>
                  </span>
                  <span className="flex text-base gap-2">
                    {formatCurrency(netTotalMinor, currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Datos del Cliente */}
        <div className="space-y-3">
          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  currentStatus.color,
                )}
              >
                {currentStatus.label}
                {order.status === "PAID" && <FaCheck className="h-3 w-3" />}
              </div>
            </CardContent>
          </Card>

          <Card className="py-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FaUser className="text-neutral-500" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="font-medium">
                <p>
                  {order.firstName} {order.lastName}
                </p>
                <p>{order.email}</p>
                <p className="text-xs">{order.phone}</p>
              </div>

              {order.user && (
                <div className="pt-3 border-t mt-3">
                  <Link
                    href={`/admin/users/${order.userId}`}
                    className="border-b border-transparent w-max transition-all duration-200 hover:border-slate-800 font-medium"
                  >
                    Ver detalles del usuario
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {(order.returnReason ||
            order.rejectionReason ||
            requestedItems.length > 0) && (
            <Card className="overflow-hidden border-orange-200">
              <CardContent className=" border-orange-100 py-3 font-medium px-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <FaClipboardList className="h-4 w-4" />
                  {requestedItems && (
                    <Link
                      href={`/admin/orders/${order.id}/history`}
                      className=" border-b border-transparent  text-sm hover:border-orange-800 w-max transition-all duration-200"
                    >
                      {" "}
                      Ver Historial Devoluciones
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
