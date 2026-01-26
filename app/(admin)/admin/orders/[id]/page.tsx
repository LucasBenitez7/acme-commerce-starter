import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaClipboardList,
  FaBoxOpen,
  FaCircleCheck,
  FaClock,
  FaBan,
} from "react-icons/fa6";

import { OrderTracker } from "@/components/order/OrderTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { getShippingLabel } from "@/lib/locations";
import { FULFILLMENT_STATUS_CONFIG } from "@/lib/orders/constants";
import { getAdminOrderById } from "@/lib/orders/queries";
import {
  getOrderCancellationDetails,
  getOrderShippingDetails,
} from "@/lib/orders/utils";

import { RejectReturnButton } from "../_components/actions";
import { AdminFulfillmentActions } from "../_components/AdminFulfillmentActions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  const currency = parseCurrency(order.currency);
  const { originalQty, refundedAmountMinor, returnedQty, netTotalMinor } =
    order.summary;

  const createdDate = new Date(order.createdAt).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const deliveryDateFormatted = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const isDelivered =
    (order.fulfillmentStatus === "DELIVERED" ||
      order.fulfillmentStatus === "RETURNED") &&
    deliveryDateFormatted;

  const contactName = [order.firstName, order.lastName]
    .filter(Boolean)
    .join(" ");

  const hasReturnRequest = order.items.some(
    (i) => i.quantityReturnRequested > 0,
  );

  const fulfillmentConfig = FULFILLMENT_STATUS_CONFIG[order.fulfillmentStatus];
  const shippingDetails = getOrderShippingDetails(order);
  const showHistoryButton = true;

  const cancellationData = getOrderCancellationDetails(order);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="hover:bg-neutral-100 p-2 rounded-xs transition-colors"
          >
            <FaArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full sm:w-auto">
          {showHistoryButton && (
            <Button
              asChild
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 w-full sm:w-fit h-9"
            >
              <Link href={`/admin/orders/${order.id}/history`}>
                <FaClipboardList className="size-3.5 mr-2" />
                Historial / Incidencias
              </Link>
            </Button>
          )}

          {!order.isCancelled && hasReturnRequest && (
            <>
              <Button
                asChild
                variant="default"
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-fit h-9"
              >
                <Link href={`/admin/orders/${order.id}/return`}>
                  Gestionar Devolución
                </Link>
              </Button>
              <RejectReturnButton orderId={order.id} />
            </>
          )}
        </div>
      </div>

      {/* --- BANNER DE ESTADO CANCELADO / EXPIRADO --- */}
      {order.isCancelled && (
        <div className="flex flex-col">
          {cancellationData && (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className=" text-red-700">
                {cancellationData.isExpired ? (
                  <FaClock className="size-5" />
                ) : (
                  <FaBan className="size-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-red-700 font-bold text-lg flex items-center gap-2">
                  {cancellationData.bannerTitle}
                </h3>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CARD DEL TRACKER (Con controles de Admin dentro) --- */}
      <Card className={order.isCancelled ? "hidden" : "pb-2"}>
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2 p-0 border-b py-4">
            <div className="flex flex-col">
              {isDelivered ? (
                <span className="flex items-center gap-2 text-xl font-semibold text-green-700">
                  Entregado el {deliveryDateFormatted}{" "}
                  <FaCircleCheck className="size-5" />
                </span>
              ) : (
                <span className="text-lg font-bold">
                  {fulfillmentConfig.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AdminFulfillmentActions
                orderId={order.id}
                currentStatus={order.fulfillmentStatus}
                isCancelled={order.isCancelled}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2 pt-2">
          <OrderTracker status={order.fulfillmentStatus} />
        </CardContent>
      </Card>

      {/* --- CARD PRINCIPAL DE DETALLES --- */}
      <div className="space-y-4 font-medium">
        <Card className="px-4">
          <h2 className="text-lg font-semibold text-center pt-3 pb-2 mb-1 border-b">
            Detalles del Pedido
          </h2>

          <CardContent className="space-y-6 py-3 px-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold uppercase text-sm">
                  Nº de Pedido
                </h3>
                <p className="font-mono text-sm uppercase" title={order.id}>
                  {order.id}
                </p>
              </div>
              <div>
                <h3 className="font-semibold uppercase text-sm">Realizado</h3>
                <p className="text-xs">{createdDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b font-medium">
              <div className="text-xs text-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm uppercase flex items-center gap-2">
                    Datos del Usuario
                  </h3>
                  {order.user && order.userId && (
                    <div className="">
                      <Link
                        href={`/admin/users/${order.userId}`}
                        className="text-xs font-bold text-foreground underline underline-offset-4"
                      >
                        Ver perfil del usuario &rarr;
                      </Link>
                    </div>
                  )}
                </div>
                <p className="font-medium">{contactName}</p>
                <Link
                  href={`mailto:${order.email}`}
                  className="text-blue-600 hover:underline block underline-offset-4"
                >
                  {order.email}
                </Link>
                <p>{order.phone || "Sin teléfono"}</p>
              </div>

              {/* 3. DIRECCIÓN DE ENVÍO */}
              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  {getShippingLabel(order.shippingType?.toLowerCase())}
                </h3>
                {shippingDetails.addressLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div>
                <h3 className="font-semibold uppercase text-sm">
                  Método de Pago
                </h3>
                <p className="text-xs font-medium">
                  {order.paymentMethod
                    ? order.paymentMethod.replace("_", " ")
                    : "Tarjeta"}
                </p>
              </div>
            </div>

            {/* 4. LISTA DE PRODUCTOS (Estilo User pero con badges Admin) */}
            <div className="pt-0">
              <h3 className="text-lg mb-6 font-semibold">
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
                  const lineTotal =
                    (item.priceMinorSnapshot || 0) * item.quantity;

                  return (
                    <li
                      key={item.id}
                      className="flex gap-3 items-start text-sm group"
                    >
                      {/* FOTO */}
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xs bg-neutral-100 border">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={item.nameSnapshot}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-300">
                            <FaBoxOpen className="size-4" />
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="font-medium hover:underline underline-offset-3"
                          >
                            {item.nameSnapshot}
                          </Link>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(lineTotal, currency)}
                          </span>
                        </div>

                        <div className="text-xs flex gap-2 font-medium">
                          {[item.sizeSnapshot, item.colorSnapshot]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>

                        {/* BADGES DE CANTIDAD Y ESTADO (ADMIN) */}
                        <div className="flex flex-wrap gap-2 items-center justify-between text-xs">
                          <span className="font-medium ">x{item.quantity}</span>

                          {item.quantityReturned > 0 && (
                            <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-medium">
                              Devuelto: {item.quantityReturned}
                            </span>
                          )}

                          {item.quantityReturnRequested > 0 && (
                            <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded font-medium">
                              Solicitado: {item.quantityReturnRequested}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 5. TOTALES Y RESUMEN */}
            <div className="pt-4 pb-1 space-y-2 border-t mt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.itemsTotalMinor, currency)}</span>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span>
                  {order.shippingCostMinor === 0
                    ? "Gratis"
                    : formatCurrency(order.shippingCostMinor, currency)}
                </span>
              </div>

              {order.taxMinor > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Impuestos</span>
                  <span>{formatCurrency(order.taxMinor, currency)}</span>
                </div>
              )}

              {/* REEMBOLSOS (Destacado en rojo si hay) */}
              {refundedAmountMinor > 0 && (
                <div className="flex justify-between text-sm text-red-600 font-medium  border-red-100">
                  <span>Reembolsado ({returnedQty})</span>
                  <span>- {formatCurrency(refundedAmountMinor, currency)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 items-center font-bold text-lg mt-2">
                <span>Total</span>
                <span>{formatCurrency(netTotalMinor, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
