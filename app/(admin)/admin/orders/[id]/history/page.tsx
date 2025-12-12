import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaUser,
  FaUserShield,
  FaCalendar,
  FaClipboardCheck,
} from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";

import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

type HistoryDetailItem = {
  name: string;
  quantity: number;
  variant?: string | null;
};

export default async function OrderHistoryPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: "desc" } },
      user: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href={`/admin/orders/${id}`}>
          <FaArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col border-b">
          <h1 className="text-xl font-semibold tracking-tight text-center p-3">
            Historial de Eventos del Pedido{" "}
            <span className="text-lg">#{order.id.slice().toUpperCase()}</span>
          </h1>
        </div>
        {order.history.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-neutral-50 rounded">
            No hay eventos registrados.
          </div>
        )}

        {order.history.map((event) => {
          const isAdmin = event.actor === "admin";
          const details = event.details
            ? (event.details as unknown as HistoryDetailItem[])
            : [];

          let iconColor = isAdmin
            ? "bg-orange-200 text-orange-600"
            : "bg-blue-100 text-blue-600";

          return (
            <div key={event.id} className="flex items-start group">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center h-9 w-9 rounded-full border-2 border-white shadow-sm",
                        iconColor,
                      )}
                    >
                      {" "}
                      {isAdmin ? (
                        <FaUserShield className="h-4 w-4" />
                      ) : (
                        <FaUser className="h-4 w-4" />
                      )}
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center rounded-xs px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        isAdmin
                          ? "bg-orange-50 text-orange-600 ring-orange-700/10"
                          : "bg-blue-50 text-blue-600 ring-blue-700/10",
                      )}
                    >
                      {isAdmin ? "ADMINISTRADOR" : "CLIENTE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground">
                    <FaCalendar className="h-3 w-3" />
                    {new Date(event.createdAt).toLocaleString("es-ES")}
                  </div>
                </div>

                <Card
                  className={cn(
                    "shadow-sm overflow-hidden",
                    isAdmin
                      ? "border-orange-100 bg-orange-50/10"
                      : "border-blue-100",
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Mensaje Principal */}
                    <div className="flex flex-col">
                      {isAdmin && event.reason && (
                        <h3 className="text-sm font-medium">{event.reason}</h3>
                      )}

                      {!isAdmin && event.reason && (
                        <h3 className="text-sm font-medium">
                          Motivo: "{event.reason}"
                        </h3>
                      )}
                    </div>

                    {/* LISTA DE PRODUCTOS AFECTADOS */}
                    {details.length > 0 && (
                      <div className="mt-3 bg-white rounded-xs border border-neutral-200 p-3">
                        <p className="text-xs font-semibold text-neutral-500 uppercase mb-2 flex items-center gap-2">
                          <FaClipboardCheck /> Productos{" "}
                          {event.status === "RETURN_REQUESTED"
                            ? "Solicitados"
                            : "Procesados"}
                          :
                        </p>
                        <ul className="space-y-1.5">
                          {details.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm flex justify-between items-center border-b border-neutral-100 last:border-0 pb-1 last:pb-0"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-neutral-800">
                                  {item.name}
                                </span>
                                {item.variant && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.variant}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                                x{item.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
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
