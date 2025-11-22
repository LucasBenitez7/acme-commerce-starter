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

import type { ShippingType } from "@/hooks/use-checkout-form";

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

  const shippingTypeFromDb: ShippingType =
    order.shippingType === "STORE"
      ? "store"
      : order.shippingType === "PICKUP"
        ? "pickup"
        : "home";

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
    <Container className="lg:py-6 py-4 px-4 max-w-4xl">
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

      <div className="mb-4 rounded-lb border bg-card p-4">
        <p className="text-lg font-medium">
          Número de pedido:{" "}
          <span className="font-mono text-base md:text-sm">{order.id}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Guarda este identificador por si te haga falta.
        </p>
      </div>

      <section className="mb-4 flex flex-col space-y-1 text-xs text-foreground font-medium border rounded-lb p-4">
        <p className="text-base font-semibold">Datos de contacto</p>
        <div className="space-y-1">
          <dd className="font-semibold">{contact.fullName || "—"}</dd>
          <dd>{contact.phone || "—"}</dd>
          <dd>{shipping.label || "—"}</dd>
          <dd>{shipping.details || "—"} </dd>
        </div>
      </section>

      <section className="space-y-4 rounded-lb border bg-card">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold pt-4 px-4">
            Resumen de la compra <span className="text-base">({totalQty})</span>
          </h2>
        </div>

        <ul className="space-y-3 text-sm px-4">
          {order.items.map((item) => {
            const imageUrl = item.product?.images?.[0]?.url ?? null;
            const lineTotalMinor = item.subtotalMinor;

            return (
              <li
                key={item.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1"
              >
                <div
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lb bg-neutral-100"
                  aria-hidden="true"
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.nameSnapshot}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex h-full justify-between font-medium">
                  <div className="space-y-1">
                    <p className="text-sm">{item.nameSnapshot}</p>

                    <div className="flex flex-col items-baseline gap-1 text-xs">
                      <p className="text-xs">Talla L</p>
                      <p className="text-xs">Marrón</p>
                      <div className="flex gap-1">
                        {item.quantity > 1 && (
                          <span className="text-muted-foreground">
                            {formatMinor(item.priceMinorSnapshot, currency)}
                          </span>
                        )}
                        <span className="font-semibold">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    {formatMinor(lineTotalMinor, currency)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center text-lg justify-between font-semibold border-t p-4">
          <span>Total</span>
          <span className="text-base">
            {formatMinor(order.totalMinor, currency)}
          </span>
        </div>
      </section>
    </Container>
  );
}
