import Link from "next/link";

import { Card, CardContent } from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 border-green-200",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    EXPIRED: "bg-neutral-100 text-neutral-600 border-neutral-200",
    RETURN_REQUESTED:
      "bg-orange-100 text-orange-800 border-orange-200 animate-pulse",
    RETURNED: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const labels: Record<string, string> = {
    PAID: "Pagado",
    PENDING_PAYMENT: "Pendiente",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
    RETURN_REQUESTED: "Devolución Solicitada",
    RETURNED: "Devuelto",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status] || "bg-gray-100 text-gray-800",
      )}
    >
      {labels[status] || status}
    </span>
  );
}

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const statusParam = sp.status;

  let where: any = {};

  if (statusParam === "PAID") {
    where = { status: { in: ["PAID", "RETURN_REQUESTED"] } };
  } else if (statusParam === "RETURNS") {
    where = {
      OR: [
        { status: "RETURN_REQUESTED" },
        { status: "RETURNED" },
        {
          status: "PAID",
          items: { some: { quantityReturned: { gt: 0 } } },
        },
      ],
    };
  } else if (statusParam) {
    where = { status: statusParam as OrderStatus };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
    take: 50,
  });

  const tabs = [
    { label: "Todos", value: undefined },
    { label: "Pagados", value: "PAID" },
    { label: "Pendientes", value: "PENDING_PAYMENT" },
    { label: "Devoluciones", value: "RETURNS" },
    { label: "Cancelados", value: "CANCELLED" },
  ];

  const isReturnsTab = statusParam === "RETURNS";
  const totalLabel = isReturnsTab ? "Total Reembolsado" : "Total Pagado";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex gap-5 pb-4 pt-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = statusParam === tab.value;
          return (
            <Link
              key={tab.label}
              href={
                tab.value
                  ? `/admin/orders?status=${tab.value}`
                  : "/admin/orders"
              }
              className={cn(
                "px-1 py-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card className="gap-0">
        <div className="px-4 py-4 border-b bg-neutral-50/50">
          <h2 className="text-lg font-semibold">Últimos movimientos</h2>
        </div>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground font-medium uppercase items-center border-b">
                <tr>
                  <th className="px-4 py-4 font-semibold">ID Pedido</th>
                  <th className="px-4 py-4 font-semibold">Fecha</th>
                  <th className="px-4 py-4 font-semibold">Cliente</th>
                  <th className="px-4 py-4 font-semibold text-left">Estado</th>
                  <th className="px-4 py-4 font-semibold text-left">
                    {totalLabel}
                  </th>
                  <th className="px-4 py-4 font-semibold text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-neutral-500"
                    >
                      No hay pedidos en esta categoría.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const currency = parseCurrency(order.currency);

                    const refundedAmount = order.items.reduce(
                      (acc, item) =>
                        acc + item.priceMinorSnapshot * item.quantityReturned,
                      0,
                    );
                    const paidAmount = order.totalMinor - refundedAmount;

                    const amountToShow =
                      isReturnsTab || order.status === "RETURNED"
                        ? refundedAmount
                        : paidAmount;

                    const showPartialWarning =
                      !isReturnsTab &&
                      refundedAmount > 0 &&
                      order.status !== "RETURNED";

                    return (
                      <tr
                        key={order.id}
                        className="bg-white hover:bg-neutral-100 transition-colors"
                      >
                        <td className="px-4 py-4 font-mono text-xs text-foreground">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-4 text-foreground font-medium text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-ES",
                          )}
                          <br />
                          <span className="text-xs text-neutral-500">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "es-ES",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-neutral-900">
                            {order.firstName} {order.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {order.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-left">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-left font-medium">
                          <span
                            className={
                              isReturnsTab ? "text-red-600" : "text-neutral-900"
                            }
                          >
                            {formatMinor(amountToShow, currency)}
                          </span>
                          {showPartialWarning && (
                            <div className="text-[10px] text-red-500 mt-1">
                              (-{formatMinor(refundedAmount, currency)}{" "}
                              devuelto)
                            </div>
                          )}
                        </td>
                        <td className="h-full px-4 items-center justify-center text-foreground">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex h-full w-max mx-auto items-center justify-center border-b-2 border-transparent hover:border-foreground"
                          >
                            Ver detalles
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
