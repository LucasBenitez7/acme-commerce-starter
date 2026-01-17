"use client";

import Link from "next/link";

import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency } from "@/lib/currency";

import type { AdminOrderListItem } from "@/lib/orders/types";

interface OrderTableProps {
  orders: AdminOrderListItem[];
  showRefunds?: boolean;
}

export function OrderTable({ orders, showRefunds }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500 rounded-xs">
        <p className="font-medium">No se encontraron pedidos con este filtro</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">
              {showRefunds ? "Reembolsado" : "Total"}
            </TableHead>
            <TableHead className="text-center px-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const amountToShow = showRefunds
              ? order.refundedAmountMinor
              : order.netTotalMinor;

            return (
              <TableRow
                key={order.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                {/* 1. ID */}
                <TableCell className="font-mono text-xs font-medium">
                  {order.id.toUpperCase()}
                </TableCell>

                {/* 2. FECHA */}
                <TableCell className="text-xs font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>

                {/* 3. CLIENTE */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {order.guestInfo.firstName} {order.guestInfo.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.guestInfo.email}
                    </span>
                  </div>
                </TableCell>

                {/* 4. ESTADO */}
                <TableCell className="text-center">
                  <OrderStatusBadge
                    paymentStatus={order.paymentStatus}
                    fulfillmentStatus={order.fulfillmentStatus}
                    isCancelled={order.isCancelled}
                    className="text-xs uppercase px-2 py-0.5"
                  />
                </TableCell>

                {/* 5. TOTAL */}
                <TableCell className="text-right font-medium">
                  {formatCurrency(amountToShow, order.currency)}
                </TableCell>

                {/* 6. ACCIONES */}
                <TableCell className="text-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="fx-underline-anim font-medium text-sm"
                  >
                    Ver detalles
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
