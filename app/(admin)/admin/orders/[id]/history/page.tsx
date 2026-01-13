import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaUser,
  FaUserShield,
  FaCalendar,
  FaClipboardCheck,
  FaBoxOpen,
} from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { getAdminOrderById } from "@/lib/orders/queries";
import { formatHistoryReason } from "@/lib/orders/utils";
import { cn } from "@/lib/utils";

import type { HistoryDetailsJson } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderHistoryPage({ params }: Props) {
  const { id } = await params;

  const order = await getAdminOrderById(id);

  if (!order) notFound();

  const { originalQty, returnedQty } = order.summary;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3 border-b pb-4">
        <Link
          href={`/admin/orders/${id}`}
          className="hover:bg-neutral-100 p-2 rounded-full transition-colors"
        >
          <FaArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          Historial de Cambios
        </h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabecera ID */}
        <div className="flex flex-col border-b pb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            ID Pedido
          </span>
          <span className="text-lg font-mono">{order.id.toUpperCase()}</span>
        </div>

        {order.history.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-neutral-50 rounded border border-dashed">
            No hay eventos registrados.
          </div>
        )}

        {order.history.map((event) => {
          const isAdmin = event.actor.toLowerCase().includes("admin");
          const details =
            (event.details as unknown as HistoryDetailsJson) || {};
          const itemsList = details.items || [];
          const note = details.note;

          const totalAffectedQty = itemsList.reduce(
            (acc, item) => acc + item.quantity,
            0,
          );

          const iconColor = isAdmin
            ? "bg-orange-100 text-orange-700 border-orange-200"
            : "bg-blue-100 text-blue-700 border-blue-200";

          return (
            <div
              key={event.id}
              className="flex items-start group relative pl-4 md:pl-0"
            >
              <div className="absolute left-[-25px] top-4 bottom-[-20px] w-px bg-neutral-200 md:hidden"></div>

              <div className="w-full">
                {/* Header del Evento */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full border-2 shadow-sm z-10",
                        iconColor,
                      )}
                    >
                      {isAdmin ? (
                        <FaUserShield className="h-5 w-5" />
                      ) : (
                        <FaUser className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-bold text-foreground">
                        {isAdmin ? "Administrador" : "Cliente"}
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <FaCalendar className="h-3 w-3" />
                        {new Date(event.createdAt).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <Card
                  className={cn(
                    "shadow-sm overflow-hidden transition-all",
                    isAdmin
                      ? "border-orange-200/60 bg-orange-50"
                      : "border-blue-200/60 bg-blue-50",
                  )}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-medium text-foreground">
                        {isAdmin && (
                          <span>{formatHistoryReason(event.reason)}</span>
                        )}

                        {!isAdmin && (
                          <div className="flex flex-col">
                            Motivo de devolución:{" "}
                            <span className="text-sm p-3 px-2 rounded-xs border ">
                              "{formatHistoryReason(event.reason)}"
                            </span>
                          </div>
                        )}
                      </h3>
                      {note && (
                        <div className="text-sm p-3 px-2 rounded-xs border ">
                          "{note}"
                        </div>
                      )}
                    </div>

                    {itemsList.length > 0 && (
                      <div className="mt-2 bg-white rounded-xs border border-neutral-200 overflow-hidden">
                        <div className="p-4 text-base font-semibold border-b">
                          Productos ({totalAffectedQty})
                        </div>

                        <div className="py-2">
                          {itemsList.map((historyItem, idx) => {
                            const matchedLiveItem = order.items.find(
                              (i) => i.nameSnapshot === historyItem.name,
                            );

                            const productImages =
                              matchedLiveItem?.product?.images || [];
                            const variantString = historyItem.variant || "";
                            const matchingImg =
                              productImages.find((img) =>
                                variantString.includes(img.color || "###"),
                              ) || productImages[0];
                            const imgUrl = matchingImg?.url;

                            return (
                              <div
                                key={idx}
                                className="flex items-start gap-3 py-2 px-3"
                              >
                                {/* FOTO */}
                                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xs bg-neutral-100">
                                  {imgUrl ? (
                                    <Image
                                      src={imgUrl}
                                      alt={historyItem.name}
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
                                <div className="flex flex-col h-full">
                                  <span className="font-medium text-sm pb-1">
                                    {historyItem.name}
                                  </span>
                                  {historyItem.variant && (
                                    <span className="text-xs font-medium">
                                      {historyItem.variant}
                                    </span>
                                  )}
                                  <span className="text-xs font-medium">
                                    Cant: {historyItem.quantity}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
