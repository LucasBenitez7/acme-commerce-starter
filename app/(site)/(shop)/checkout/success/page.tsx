import Link from "next/link";
import { redirect } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";

import { Button, Container } from "@/components/ui";

import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderId = sp.orderId;

  if (!orderId) redirect("/");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) redirect("/");

  return (
    <Container className="py-20 flex flex-col items-center text-center min-h-[60vh] justify-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <FaCheckCircle className="h-10 w-10" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        ¡Gracias por tu pedido!
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Tu pedido ha sido confirmado. Hemos enviado los detalles a{" "}
        <span className="font-medium text-foreground">{order.email}</span>.
      </p>

      <div className="bg-white border p-4 rounded-md mb-8 w-full max-w-xs shadow-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Número de pedido
        </p>
        <p className="text-xl font-mono font-bold mt-1">
          #{order.id.slice(-8).toUpperCase()}
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Seguir comprando</Link>
        </Button>
        <Button asChild className="bg-black text-white">
          <Link href={`/account/orders/${order.id}`}>
            Ver mi pedido <FaArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Container>
  );
}
