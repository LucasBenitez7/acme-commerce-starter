import Link from "next/link";

import {
  buildContactSummary,
  buildShippingSummary,
} from "@/components/checkout/shared/checkout-summary";
import { Container } from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import type { ShippingType as ClientShippingType } from "@/hooks/use-checkout-form";
import type { ShippingType as ShippingTypeDb } from "@prisma/client";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

function mapShippingType(type: ShippingTypeDb | null): ClientShippingType {
  if (type === "STORE") return "store";
  if (type === "PICKUP") return "pickup";
  return "home";
}

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const selectedOrderId = sp.orderId;

  const [orders, selectedOrder] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        totalMinor: true,
        currency: true,
        status: true,
        shippingType: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    selectedOrderId
      ? prisma.order.findUnique({
          where: { id: selectedOrderId },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        })
      : null,
  ]);

  return (
    <Container className="max-w-[1400px] px-3 py-6">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pedidos (demo)
        </h1>
        <p className="text-xs text-muted-foreground">
          Vista temporal para revisar pedidos mientras no tenemos admin real.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Lista de pedidos */}
        <section className="rounded-xs border bg-card">
          <header className="flex items-center justify-between border-b px-3 py-3">
            <h2 className="text-sm font-semibold">Últimos pedidos</h2>
            <span className="text-xs text-muted-foreground">
              Pedidos recientes ({orders.length})
            </span>
          </header>

          {orders.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Todavía no hay pedidos creados.
            </p>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 text-[11px] uppercase tracking-wide font-medium text-foreground">
                  <tr>
                    <th className="w-[12rem] px-3 py-2 font-medium">Pedido</th>
                    <th className="w-[12rem] py-2 font-medium">Fecha</th>
                    <th className="w-[10rem] py-2 font-medium">Cliente</th>
                    <th className="px-3 py-2 font-medium">Envío</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currency = parseCurrency(order.currency);
                    const created = new Intl.DateTimeFormat("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(order.createdAt);

                    const fullName =
                      [order.firstName, order.lastName]
                        .filter(Boolean)
                        .join(" ") || "—";

                    const shippingLabel =
                      order.shippingType === "STORE"
                        ? "Tienda"
                        : order.shippingType === "PICKUP"
                          ? "Pickup"
                          : "Domicilio";

                    const isSelected = selectedOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        className={`border-t text-xs hover:bg-slate-50 ${
                          isSelected ? "bg-slate-100" : ""
                        }`}
                      >
                        <td className="w-[12rem] px-3 py-2">
                          <Link
                            href={`/admin/orders/?orderId=${order.id}`}
                            className="fx-underline-anim font-mono text-[11px]"
                          >
                            {order.id.slice(0, 20)}…
                          </Link>
                        </td>
                        <td className="w-[12rem] py-2 align-top">{created}</td>
                        <td className="w-[10rem] py-2 align-top">{fullName}</td>
                        <td className="px-3 py-2 align-top">{shippingLabel}</td>
                        <td className="px-3 py-2 align-top text-foreground">
                          {order.status}
                        </td>
                        <td className="px-3 py-2 align-top text-left font-semibold">
                          {formatMinor(order.totalMinor, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Detalle del pedido seleccionado */}
        <section className="rounded-xs border bg-card">
          <header className="border-b px-3 py-3">
            <h2 className="text-sm font-semibold">Detalle del pedido</h2>
            {!selectedOrder && (
              <p className="mt-1 text-xs text-muted-foreground">
                Selecciona un pedido en la tabla para ver sus detalles.
              </p>
            )}
          </header>

          {selectedOrder ? <OrderDetailCard /> : null}
        </section>
      </div>
    </Container>
  );

  function OrderDetailCard() {
    if (!selectedOrder) return null;

    const shippingTypeClient = mapShippingType(selectedOrder.shippingType);

    const contact = buildContactSummary({
      firstName: selectedOrder.firstName,
      lastName: selectedOrder.lastName,
      email: selectedOrder.email,
      phone: selectedOrder.phone,
    });

    const shipping = buildShippingSummary({
      shippingType: shippingTypeClient,
      street: selectedOrder.street,
      addressExtra: selectedOrder.addressExtra,
      postalCode: selectedOrder.postalCode,
      province: selectedOrder.province,
      city: selectedOrder.city,
      storeLocationId: selectedOrder.storeLocationId,
      pickupLocationId: selectedOrder.pickupLocationId,
      pickupSearch: selectedOrder.pickupSearch,
    });

    const currency = parseCurrency(selectedOrder.currency);

    return (
      <div className="space-y-3 px-3 py-3 text-xs">
        <div>
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">
            Pedido
          </p>
          <p className="font-mono text-[11px]">{selectedOrder.id}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">
            Datos de contacto
          </p>
          <dl className="mt-1 space-y-0.5">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0">Nombre</dt>
              <dd className="font-medium">{contact.fullName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0">E-mail</dt>
              <dd className="font-medium">{contact.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0">Teléfono</dt>
              <dd className="font-medium">{contact.phone}</dd>
            </div>
          </dl>
        </div>

        {/* Datos de envío */}
        <div>
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">
            Datos de envío
          </p>
          <dl className="mt-1 space-y-0.5">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0">Tipo</dt>
              <dd className="font-medium">{shipping.label}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0">Detalles</dt>
              <dd className="font-medium">{shipping.details}</dd>
            </div>
          </dl>
        </div>

        {/* Productos */}
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">
            Productos
          </p>
          <ul>
            {selectedOrder.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex flex-col py-1">
                  <span className="text-[11px] font-medium">
                    {item.nameSnapshot}{" "}
                    <span className="text-[11px] text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </span>
                </div>
                <div className="text-right text-[11px] font-semibold">
                  {formatMinor(item.subtotalMinor, currency)}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center pt-4 justify-between">
          <p className="text-[12px] font-semibold uppercase text-muted-foreground">
            Total
          </p>
          <p className="text-[12px] font-semibold">
            {formatMinor(selectedOrder.totalMinor, currency)}
          </p>
        </div>
      </div>
    );
  }
}
