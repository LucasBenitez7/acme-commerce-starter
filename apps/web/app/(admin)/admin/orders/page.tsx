import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

import { OrderListToolbar } from "./_components/OrderListToolbar";

import type { OrderStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 border-green-200",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CANCELLED: "bg-neutra-100 text-neutral-800 border-neutral-200",
    EXPIRED: "bg-neutral-100 text-neutral-600 border-neutral-200",
    RETURN_REQUESTED: "bg-red-100 text-red-800 border-red-200",
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
  searchParams: Promise<{
    status?: string;
    status_filter?: string;
    sort?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const statusParam = sp.status;
  const filterStatuses = sp.status_filter
    ?.split(",")
    .filter(Boolean) as OrderStatus[];

  let where: Prisma.OrderWhereInput = {};

  if (filterStatuses && filterStatuses.length > 0) {
    where = { status: { in: filterStatuses } };
  } else {
    // Lógica de Tabs (si no hay filtro avanzado)
    if (statusParam === "PAID") {
      where = { status: { in: ["PAID", "RETURN_REQUESTED"] } };
    } else if (statusParam === "RETURNS") {
      where = {
        OR: [
          { status: "RETURN_REQUESTED" },
          { status: "RETURNED" },
          { status: "PAID", items: { some: { quantityReturned: { gt: 0 } } } },
        ],
      };
    } else if (statusParam) {
      where = { status: statusParam as OrderStatus };
    }
  }

  // 2. Lógica de Ordenación
  let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
  switch (sp.sort) {
    case "date_asc":
      orderBy = { createdAt: "asc" };
      break;
    case "total_desc":
      orderBy = { totalMinor: "desc" };
      break;
    case "total_asc":
      orderBy = { totalMinor: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy,
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
  const totalLabel = isReturnsTab ? "Total Reembolsado" : "Total";

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
        <div className="py-6 flex items-center justify-between relative">
          <div className="flex items-center border">
            {tabs.map((tab) => {
              const isActive = statusParam === tab.value;
              return (
                <h2
                  key={tab.label}
                  className="text-base font-semibold absolute left-4 items-center"
                >
                  {isActive ? tab.label + ` (${orders.length})` : ""}
                </h2>
              );
            })}
          </div>
          <OrderListToolbar />
        </div>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground font-medium uppercase items-center border-y ">
                <tr>
                  <th className="px-4 py-4 font-semibold">Acciones</th>
                  <th className="px-4 py-4 font-semibold">ID Pedido</th>
                  <th className="px-4 py-4 font-semibold">Fecha</th>
                  <th className="px-4 py-4 font-semibold">Cliente</th>
                  <th className="pl-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold text-right">
                    {totalLabel}
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
                      order.status === "RETURNED";

                    return (
                      <tr
                        key={order.id}
                        className="bg-white hover:bg-neutral-100 transition-colors"
                      >
                        <td className="h-full pl-4 items-center text-foreground">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex h-full w-max items-center text-left border-b-2 border-transparent hover:border-foreground"
                          >
                            Ver detalles
                          </Link>
                        </td>
                        <td className="pl-4 py-4 font-mono text-xs text-foreground">
                          {order.id.slice().toUpperCase()}
                        </td>
                        <td className="pl-4 py-4 text-foreground font-medium text-xs">
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
                        <td className="pl-4 py-4">
                          <div className="font-medium text-neutral-900">
                            {order.firstName} {order.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {order.email}
                          </div>
                        </td>
                        <td className="pl-4 py-4 text-left">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {formatMinor(amountToShow, currency)}
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
