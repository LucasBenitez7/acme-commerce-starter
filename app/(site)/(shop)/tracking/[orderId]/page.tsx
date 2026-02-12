import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft, FaCircleCheck } from "react-icons/fa6";

import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { OrderTracker } from "@/components/order/OrderTracker";
import { Container, Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getOrderSuccessDetails } from "@/lib/account/queries";
import { formatOrderForDisplay } from "@/lib/orders/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function GuestOrderPage({ params }: Props) {
  const { orderId } = await params;

  // 1. Verificar Cookie de Acceso
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`guest_access_${orderId}`);

  if (!hasAccess) {
    // Si no tiene acceso, redirigir al form de tracking
    redirect("/tracking");
  }

  // 2. Obtener Pedido
  const order = await getOrderSuccessDetails(orderId);

  if (!order) {
    redirect("/tracking");
  }

  const clientOrder = formatOrderForDisplay(order);

  const deliveryDateFormatted = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const isDelivered =
    (order.fulfillmentStatus === "DELIVERED" ||
      order.fulfillmentStatus === "RETURNED") &&
    deliveryDateFormatted;

  // 3. Renderizar
  return (
    <Container className="py-6 px-4 max-w-3xl mx-auto">
      <div className="mb-4 border-b">
        <Button asChild variant="ghost" className="hover">
          <Link
            href="/tracking"
            className="flex items-center gap-2 text-foreground hover:text-foreground"
          >
            <FaArrowLeft className="size-4" /> Volver
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Detalles del Pedido</h1>
          <p className="text-muted-foreground text-sm">
            Vista de invitado autorizada.
          </p>
        </div>

        <Card className={order.isCancelled ? "hidden" : "pb-2"}>
          <CardHeader className="px-4 py-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-center p-0">
              {isDelivered && (
                <div className="flex border-b py-4 w-full text-left">
                  <h3 className="flex items-center gap-2 font-semibold text-xl text-green-700">
                    Entregado el {deliveryDateFormatted}{" "}
                    <FaCircleCheck className="size-5" />
                  </h3>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <OrderTracker status={order.fulfillmentStatus} />
          </CardContent>
        </Card>

        <OrderSummaryCard {...clientOrder} userId={null} variant="customer" />

        {/* Sección de Acciones (Devolución) */}
        <div className="bg-background p-6 rounded-xs border shadow">
          <h3 className="text-lg font-semibold mb-2">
            ¿Quieres hacer una devolución o necesitas ayuda?
          </h3>
          <p className="text-sm text-foreground mb-4">
            Si necesitas realizar una devolución o tienes problemas con tu
            pedido, puedes iniciar el proceso o contactarnos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="default">Solicitar Devolución</Button>
            <Button variant="default">Ayuda con mi pedido</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
