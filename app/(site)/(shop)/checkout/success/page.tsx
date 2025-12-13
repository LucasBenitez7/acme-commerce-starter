import Image from "next/image";
import { redirect } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

import { ClearCartOnMount } from "@/components/checkout/core/ClearCartOnMount";
import {
  buildContactSummary,
  buildShippingSummary,
} from "@/components/checkout/shared/checkout-summary";
import { Container } from "@/components/ui";

import { formatMinor, parseCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

import type { ShippingType } from "@/lib/validation/checkout";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderId = sp.orderId;

  if (!orderId) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              images: {
                orderBy: [{ sort: "asc" }, { id: "asc" }],
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    redirect("/");
  }

  const currency = parseCurrency(order.currency);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Mapeamos el enum de Prisma al tipo de nuestra app (minúsculas)
  let shippingTypeFromDb: ShippingType = "home";
  if (order.shippingType === "STORE") shippingTypeFromDb = "store";
  if (order.shippingType === "PICKUP") shippingTypeFromDb = "pickup";

  const contact = buildContactSummary({
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    phone: order.phone,
  });

  const shipping = buildShippingSummary({
    shippingType: shippingTypeFromDb,
    street: order.street,
    addressExtra: order.addressExtra,
    postalCode: order.postalCode,
    province: order.province,
    city: order.city,
    storeLocationId: order.storeLocationId,
    pickupLocationId: order.pickupLocationId,
    pickupSearch: order.pickupSearch,
  });

  return (
    <Container className="lg:py-6 py-4 px-4 max-w-2xl">
      <ClearCartOnMount />

      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-semibold tracking-tight items-center flex gap-2 md:text-3xl">
          Su pedido se ha realizado correctamente{" "}
          <FaCheckCircle className="bg-background outline-none text-green-700" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Gracias por tu compra. Más adelante conectaremos el envío de correos
          de confirmación.
        </p>
      </div>

      <div className="mb-4 rounded-xs border bg-card p-4">
        <p className="text-lg font-medium">
          Número de pedido:{" "}
          <span className="font-mono text-base md:text-sm">{order.id}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Guarda este identificador por si te hace falta.
        </p>
      </div>

      <section className="mb-4 flex flex-col space-y-4 text-xs text-foreground font-medium bg-card border rounded-xs p-4">
        <div>
          <p className="text-base font-semibold">Datos de contacto</p>
          <div className="space-y-1 mt-1">
            <dd>{contact.fullName}</dd>
            <dd>{contact.phone}</dd>
            <dd className="text-muted-foreground font-normal">
              {contact.email}
            </dd>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold">{shipping.label}</p>
          {/* Usamos el nuevo formato de detalle multi-línea si existe */}
          <div className="space-y-0.5 mt-1 whitespace-pre-line">
            {shipping.methodTitle && (
              <p className="font-medium">{shipping.methodTitle}</p>
            )}
            <p className="text-muted-foreground">{shipping.details}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xs border bg-card">
        <div className="flex items-baseline justify-between gap-2 border-b">
          <h2 className="text-base font-semibold py-4 px-4">
            Resumen de la compra{" "}
            <span className="text-muted-foreground font-normal">
              ({totalQty} artículos)
            </span>
          </h2>
        </div>

        <ul className="space-y-3 text-sm px-4 pb-2">
          {order.items.map((item) => {
            const imageUrl = item.product?.images?.[0]?.url ?? null;
            const lineTotalMinor = item.subtotalMinor;

            return (
              <li
                key={item.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2"
              >
                <div
                  className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xs bg-neutral-100 border"
                  aria-hidden="true"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.nameSnapshot}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Sin img
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-1">
                  <p className="font-medium text-sm leading-tight">
                    {item.nameSnapshot}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {/* Variantes */}
                    {(item.sizeSnapshot || item.colorSnapshot) && (
                      <span>
                        {item.sizeSnapshot}
                        {item.sizeSnapshot && item.colorSnapshot && " / "}
                        {item.colorSnapshot}
                      </span>
                    )}

                    {/* Cantidad */}
                    <span className="font-medium text-foreground px-1.5 py-0.5 bg-neutral-100 rounded text-[10px]">
                      x{item.quantity}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-semibold whitespace-nowrap">
                  {formatMinor(lineTotalMinor, currency)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center text-lg justify-between font-semibold border-t p-4 bg-neutral-50/50">
          <span>Total pagado</span>
          <span className="text-xl">
            {formatMinor(order.totalMinor, currency)}
          </span>
        </div>
      </section>
    </Container>
  );
}
