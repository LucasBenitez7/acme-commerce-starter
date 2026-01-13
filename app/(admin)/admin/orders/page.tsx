import Link from "next/link";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminOrders } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";

import { OrderListToolbar } from "./_components/OrderListToolbar";
import { OrderTable } from "./_components/OrderTable";

import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    status?: string;
    status_filter?: string;
    sort?: string;
    query?: string;
    page?: string;
  }>;
};

// Tabs superiores (Estilo filtro rápido)
const TABS = [
  { label: "Todos", value: undefined },
  { label: "Pagados", value: "PAID" },
  { label: "Pendientes", value: "PENDING_PAYMENT" },
  { label: "Devoluciones", value: "RETURNS" },
  { label: "Cancelados", value: "CANCELLED" },
];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const statusFilter = sp.status_filter
    ?.split(",")
    .filter(Boolean) as OrderStatus[];

  // QUERY
  const { orders, total, totalPages } = await getAdminOrders({
    page,
    statusTab: sp.status,
    statusFilter,
    sort: sp.sort,
    query: sp.query,
  });

  const isReturnsTab = sp.status === "RETURNS";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
      </div>

      {/* TABS DE FILTRO RÁPIDO (Igual que en Productos) */}
      <div className="flex gap-6 text-sm overflow-x-auto pb-1">
        {TABS.map((tab) => {
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
                "pb-0.5 border-b-2 font-semibold transition-colors whitespace-nowrap",
                isActive
                  ? "border-foreground"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <CardTitle className="text-lg text-left font-semibold">
            Total <span className="text-base">({total})</span>
          </CardTitle>

          <div className="w-full md:w-auto">
            <OrderListToolbar />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <OrderTable orders={orders} showRefunds={isReturnsTab} />

          {totalPages > 1 && (
            <div className="py-4 flex justify-end px-4 border-t">
              <PaginationNav totalPages={totalPages} page={page} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
