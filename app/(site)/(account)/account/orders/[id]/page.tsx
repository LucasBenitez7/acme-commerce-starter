import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaReceipt,
  FaClipboardList,
  FaCircleCheck,
  FaClock,
  FaBan,
} from "react-icons/fa6";

import { UserOrderActions } from "@/components/account/orders/UserOrderActions";
import { OrderTracker } from "@/components/order/OrderTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { getUserOrderFullDetails } from "@/lib/account/queries";
import { auth } from "@/lib/auth";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { getShippingLabel } from "@/lib/locations";
import { getOrderCancellationDetailsUser } from "@/lib/orders/utils";

import type { UserOrderDetail } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const orderData = await getUserOrderFullDetails(session.user.id, id);
  if (!orderData) notFound();

  const order: UserOrderDetail = orderData;
  const currency = parseCurrency(order.currency);

  const { originalQty, refundedAmountMinor, returnedQty } = order.summary;

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

  const hasRefunds =
    order.paymentStatus === "REFUNDED" ||
    order.paymentStatus === "PARTIALLY_REFUNDED";

  const hasActiveReturn = !!order.returnReason;

  const hasIncidents = order.history.some((h) => h.type === "INCIDENT");

  const showHistoryButton =
    hasRefunds || hasActiveReturn || (hasIncidents && !order.isCancelled);

  const cancellationData = getOrderCancellationDetailsUser(order);

  return (
    <div className="space-y-4 mx-auto">
      {/* HEADER DE NAVEGACIÓN */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b pb-3">
        <Link
          href="/account/orders"
          className="hover:bg-neutral-100 p-2 rounded-xs transition-colors"
        >
          <FaArrowLeft className="size-4" />
        </Link>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
          <UserOrderActions
            orderId={order.id}
            paymentStatus={order.paymentStatus}
            fulfillmentStatus={order.fulfillmentStatus}
            isCancelled={order.isCancelled}
          />

          {showHistoryButton && (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-fit bg-blue-50 hover:bg-blue-100"
            >
              <Link href={`/account/orders/${order.id}/history`}>
                <FaClipboardList className="size-3.5" />
                Detalles de devolución
              </Link>
            </Button>
          )}
        </div>
      </div>

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

      <Card className={order.isCancelled ? "hidden" : "pb-2"}>
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-center p-0">
            {isDelivered && (
              <div className="flex border-b py-4 w-full text-left">
                <h3 className="flex items-center gap-2 font-semibold text-xl text-green-700">
                  Entregado el {deliveryDateFormatted}{" "}
                  <FaCircleCheck className="size-5" />
                </h3>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <OrderTracker status={order.fulfillmentStatus} />
        </CardContent>
      </Card>

      <div className="space-y-4 font-medium">
        <Card className="px-4">
          <h2 className="text-lg font-semibold text-center pt-3 pb-2 mb-1 border-b">
            Detalles del Pedido
          </h2>

          <CardContent className="space-y-4 py-3 px-0">
            {/* DATOS GENERALES */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold uppercase mb-1">Nº de Pedido</h3>
                <p className="font-mono text-xs">{order.id.toUpperCase()}</p>
              </div>
              <div>
                <h3 className="font-semibold uppercase mb-1">Relizado</h3>
                <p className="text-xs">{createdDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  Datos de contacto
                </h3>
                <p>{contactName}</p>
                <p>{order.email}</p>
                <p>{order.phone}</p>
              </div>

              <div className="text-xs text-foreground space-y-1">
                <h3 className="font-semibold text-sm uppercase mb-1">
                  Método de pago
                </h3>
                <p className="font-medium">
                  {order.paymentMethod
                    ? order.paymentMethod.replace("_", " ")
                    : "Tarjeta de Crédito"}
                </p>
              </div>
            </div>

            <div className="text-xs text-foreground space-y-1">
              <h3 className="font-semibold text-sm uppercase mb-1">
                {getShippingLabel(order.shippingType?.toLowerCase())}
              </h3>
              <p>
                {order.street} {order.addressExtra || ""}
              </p>
              <p>
                {order.postalCode} {order.city}
              </p>
              <p>
                {order.province}, {order.country}
              </p>
            </div>

            {/* LISTA DE PRODUCTOS CON FOTOS */}
            <div className="pt-0 border-t">
              <h3 className="text-lg my-3 font-semibold">
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
                      className="flex gap-3 items-start text-sm"
                    >
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
                            <FaReceipt className="size-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <Link
                            href={
                              item.product?.slug
                                ? `/product/${item.product.slug}`
                                : "#"
                            }
                            className="flex font-medium hover:underline underline-offset-3 text-foreground"
                          >
                            {item.nameSnapshot}
                          </Link>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(lineTotal, currency)}
                          </span>
                        </div>

                        <div className="text-xs flex gap-2 text-foreground">
                          {[item.sizeSnapshot, item.colorSnapshot]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span>X{item.quantity}</span>
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
            <div className="pt-4 pb-1 space-y-2 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal ({originalQty})</span>
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

              <div className="flex justify-between pt-2 items-center font-semibold text-lg mt-2">
                <span>Total</span>
                <span>{formatCurrency(order.totalMinor, currency)}</span>
              </div>

              {refundedAmountMinor > 0 && (
                <div className="flex justify-between text-base font-semibold pt-3 border-t">
                  <span>Reembolsado ({returnedQty})</span>
                  <span>{formatCurrency(refundedAmountMinor, currency)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
