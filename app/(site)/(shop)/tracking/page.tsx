import { Suspense } from "react";

import { GuestAccessForm } from "@/components/tracking/GuestAccessForm";
import { Container } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seguimiento de Pedido",
  description: "Consulta el estado de tu pedido o tramita una devolución.",
};

export default function TrackingPage() {
  return (
    <Container className="py-6 px-4 max-w-xl mx-auto">
      <div className="text-center mb-6 space-y-3">
        <h1 className="text-3xl font-semibold">Seguimiento de Pedido</h1>
        <p className="text-muted-foreground">
          Si realizaste tu pedido como invitado, introduce tu número de pedido y
          email para gestionar devoluciones o ver el estado.
        </p>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <GuestAccessForm />
      </Suspense>
    </Container>
  );
}
