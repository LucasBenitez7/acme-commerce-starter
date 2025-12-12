import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

import { prisma } from "@/lib/db";

import { ReturnForm } from "../../_components/ReturnForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderReturnPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  // Validar que tenga sentido estar aquí
  if (
    order.status !== "PAID" &&
    order.status !== "RETURN_REQUESTED" &&
    order.status !== "RETURNED"
  ) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Acción no válida</h1>
        <p>Este pedido no está en un estado que permita devoluciones.</p>
        <Button asChild className="mt-4">
          <Link href={`/admin/orders/${id}`}>Volver</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href={`/admin/orders/${id}`}>
          <FaArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <ReturnForm orderId={order.id} items={order.items} />
    </div>
  );
}
