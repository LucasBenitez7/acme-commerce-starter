import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUS_CONFIG } from "@/lib/orders/constants";
import { getAdminOrders } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";

import { OrderListToolbar } from "./_components/OrderListToolbar";

import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const config =
    ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config?.badge || "bg-gray-100 text-gray-800",
      )}
    >
      {config?.label || status}
    </span>
  );
}

type Props = {
  searchParams: Promise<{
    status?: string;
    status_filter?: string;
    sort?: string;
    query?: string;
    page?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const statusFilter = sp.status_filter
    ?.split(",")
    .filter(Boolean) as OrderStatus[];

  // USAMOS LA QUERY REFACTORIZADA
  const { orders, total } = await getAdminOrders({
    page,
    statusTab: sp.status,
    statusFilter,
    sort: sp.sort,
    query: sp.query,
  });

  const tabs = [
    { label: "Todos", value: undefined },
    { label: "Pagados", value: "PAID" },
    { label: "Pendientes", value: "PENDING_PAYMENT" },
    { label: "Devoluciones", value: "RETURNS" },
    { label: "Cancelados", value: "CANCELLED" },
  ];

  const isReturnsTab = sp.status === "RETURNS";
  const totalLabel = isReturnsTab ? "Total Reembolsado" : "Total";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-5 pb-4 pt-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = sp.status === tab.value;
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
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card className="gap-0">
        <div className="py-6 flex items-center justify-between relative">
          {/* Titulo dinámico del tab */}
          <div className="flex items-center border">
            {tabs.map((tab) => {
              if (sp.status === tab.value) {
                return (
                  <h2
                    key={tab.label}
                    className="text-base font-semibold absolute left-4"
                  >
                    {tab.label} ({total})
                  </h2>
                );
              }
              return null;
            })}
            {/* Si no hay status (Todos) */}
            {!sp.status && (
              <h2 className="text-base font-semibold absolute left-4">
                Todos ({total})
              </h2>
            )}
          </div>
          <OrderListToolbar />
        </div>

        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground font-medium uppercase border-y">
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
                      No hay pedidos.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    // AQUÍ LA DIFERENCIA: Usamos valores ya calculados
                    const amountToShow =
                      isReturnsTab || order.status === "RETURNED"
                        ? order.refundedAmountMinor
                        : order.netTotalMinor;

                    return (
                      <tr
                        key={order.id}
                        className="bg-white hover:bg-neutral-100 transition-colors"
                      >
                        <td className="h-full pl-4 items-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-foreground hover:underline"
                          >
                            Ver detalles
                          </Link>
                        </td>
                        <td className="pl-4 py-4 font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}...
                        </td>
                        <td className="pl-4 py-4 text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-ES",
                          )}
                        </td>
                        <td className="pl-4 py-4">
                          <div className="font-medium">
                            {order.guestInfo.firstName}{" "}
                            {order.guestInfo.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {order.guestInfo.email}
                          </div>
                        </td>
                        <td className="pl-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {formatCurrency(amountToShow, order.currency)}
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
