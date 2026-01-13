import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaCheck,
  FaUser,
  FaArrowLeft,
  FaClipboardList,
  FaBoxOpen,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { ORDER_STATUS_CONFIG } from "@/lib/orders/constants";
import { getAdminOrderById } from "@/lib/orders/queries";
import { getOrderShippingDetails } from "@/lib/orders/utils";
import { cn } from "@/lib/utils";

import {
  CancelOrderButton,
  MarkPaidButton,
  RejectReturnButton,
} from "../_components/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await getAdminOrderById(id);

  if (!order) notFound();

  const currency = parseCurrency(order.currency);

  const { originalQty, netTotalMinor, refundedAmountMinor, returnedQty } =
    order.summary;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const shippingDetails = getOrderShippingDetails(order);

  const requestedItems = order.items.filter(
    (i) => i.quantityReturnRequested > 0,
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b py-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="size-4" />
        </Link>

        <div className="flex gap-3">
          {order.status === "PENDING_PAYMENT" && (
            <>
              <MarkPaidButton orderId={order.id} />
              <CancelOrderButton orderId={order.id} />
            </>
          )}

          {order.status === "RETURN_REQUESTED" && (
            <>
              <Button asChild variant="default" className="px-3">
                <Link href={`/admin/orders/${order.id}/return`}>
                  Gestionar Devolución
                </Link>
              </Button>

              <RejectReturnButton orderId={order.id} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* --- COLUMNA IZQUIERDA: DETALLES --- */}
        <div className="space-y-4 font-medium">
          <Card className="px-4">
            <h2 className="text-lg font-semibold text-center pt-3 pb-1 mb-1 border-b">
              Detalles del Pedido
            </h2>

            <CardContent className="space-y-6 py-3 px-0">
              {/* DATOS GENERALES */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold uppercase mb-1">ID Pedido</h3>
                  <p className="font-mono text-xs">{order.id.toUpperCase()}</p>
                </div>
                <div>
                  <h3 className="font-semibold uppercase mb-1">Fecha</h3>
                  <p className="text-xs">
                    {new Date(order.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>

              {/* DIRECCIÓN DE ENVÍO (Usando lógica compartida) */}
              <div>
                <h3 className="font-semibold text-sm uppercase mb-1">
                  {shippingDetails.label}
                </h3>
                <div className="text-xs">
                  {shippingDetails.addressLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>

              {/* LISTA DE PRODUCTOS CON FOTOS */}
              <div className="pt-3 border-t">
                <h3 className="text-lg mb-5 mt-1 font-semibold">
                  Productos <span className="text-base">({originalQty})</span>
                </h3>
                <ul className="space-y-4">
                  {order.items.map((item) => {
                    const productImages = item.product?.images || [];
                    const matchingImg =
                      productImages.find(
                        (img) => img.color === item.colorSnapshot,
                      ) || productImages[0];
                    const imgUrl = matchingImg?.url;

                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 items-start text-sm"
                      >
                        {/* IMAGEN MINIATURA */}
                        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xs bg-neutral-100 border">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.nameSnapshot}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                              <FaBoxOpen className="size-4" />
                            </div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <Link
                              href={`/admin/products/${item.productId}`}
                              className="font-medium hover:underline underline-offset-3 text-foreground"
                            >
                              {item.nameSnapshot}
                            </Link>

                            <span className="font-medium tabular-nums">
                              {formatCurrency(item.subtotalMinor, currency)}
                            </span>
                          </div>

                          <div className="text-xs flex gap-2">
                            <span>{item.sizeSnapshot}</span>
                            <span>/</span>
                            <span>{item.colorSnapshot}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span>Cant: {item.quantity}</span>

                            {item.quantityReturned > 0 && (
                              <span className="text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded-full">
                                Devuelto: {item.quantityReturned}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* --- TOTALES Y RESUMEN --- */}

              <div className=" pt-4 pb-1 space-y-2 border-t">
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

        {/* --- COLUMNA DERECHA: SIDEBAR --- */}
        <div className="space-y-4">
          {/* CARD ESTADO */}
          <Card className="py-3 px-0">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-center uppercase pb-2 border-b">
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div
                className={cn(
                  "inline-flex items-center px-2 gap-2 rounded-full text-sm font-medium border mb-2",
                  statusConfig.badge,
                )}
              >
                {statusConfig.label}
                {order.status === "PAID" && <FaCheck className="size-3" />}
              </div>
            </CardContent>
          </Card>

          {/* CARD CLIENTE */}
          <Card className="py-3 px-0">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-center uppercase border-b pb-2">
                <FaUser className="size-3" /> Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 px-4">
              <div>
                <p className="font-semibold text-sm">
                  {order.firstName} {order.lastName}
                </p>
                <p>{order.email}</p>
                <p>{order.phone}</p>
              </div>

              {order.user && (
                <div className="pt-3 border-t">
                  <Link
                    href={`/admin/users/${order.userId}`}
                    className="text-sm font-medium hover:underline underline-offset-3"
                  >
                    Ver perfil del usuario →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AVISOS DE DEVOLUCIÓN */}
          {(order.returnReason ||
            order.rejectionReason ||
            requestedItems.length > 0) && (
            <Card className="overflow-hidden border-orange-200 bg-orange-50/30">
              <CardContent className="py-4 px-4">
                <Link
                  href={`/admin/orders/${order.id}/history`}
                  className="flex items-center gap-2 text-sm font-medium text-orange-800 hover:underline underline-offset-3"
                >
                  <FaClipboardList className="size-4" />
                  Ver Historial de Eventos
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
