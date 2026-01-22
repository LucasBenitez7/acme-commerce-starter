import Link from "next/link";

import { PaginationNav } from "@/components/catalog/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ORDER_TABS } from "@/lib/orders/constants";
import { getAdminOrders } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";

import { OrderListToolbar } from "./_components/OrderListToolbar";
import { OrderTable } from "./_components/OrderTable";

import type { PaymentStatus, FulfillmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    status?: string;
    payment_filter?: string;
    fulfillment_filter?: string;
    sort?: string;
    query?: string;
    page?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const paymentFilter = sp.payment_filter
    ?.split(",")
    .filter(Boolean) as PaymentStatus[];

  const fulfillmentFilter = sp.fulfillment_filter
    ?.split(",")
    .filter(Boolean) as FulfillmentStatus[];

  const { orders, total, totalPages } = await getAdminOrders({
    page,
    statusTab: sp.status,
    paymentFilter,
    fulfillmentFilter,
    sort: sp.sort,
    query: sp.query,
  });

  const isReturnsTab = sp.status === "RETURNS";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold border-b w-full pb-2">Pedidos</h1>
      </div>

      {/* TABS DE NAVEGACIÓN RÁPIDA */}
      <div className="flex gap-6 text-sm overflow-x-auto pb-1 scrollbar-hide">
        {ORDER_TABS.map((tab) => {
          const isActive =
            sp.status === tab.value || (!sp.status && !tab.value);
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
                  ? "border-foreground text-foreground"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 sm:gap-4">
          <CardTitle className="text-lg text-left font-semibold">
            Total <span className="text-base text-foreground">({total})</span>
          </CardTitle>

          <div className="w-full sm:w-auto">
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
