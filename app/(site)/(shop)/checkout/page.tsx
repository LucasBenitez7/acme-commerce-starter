import { type UserAddress } from "@prisma/client";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutSummary } from "@/components/checkout/layout/CheckoutSummary";
import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const user = session?.user || null;

  // 1. Obtener Direcciones Guardadas (si hay usuario)
  let savedAddresses: UserAddress[] = [];
  if (user?.id) {
    savedAddresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });
  }

  return (
    <Container className="px-4 py-8 lg:py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          {/* IZQUIERDA: Formulario */}
          <div className="order-2 lg:order-1">
            <CheckoutForm
              defaultValues={{
                email: user?.email || "",
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                phone: user?.phone || "",
              }}
              savedAddresses={savedAddresses}
            />
          </div>

          {/* DERECHA: Resumen (Sticky en escritorio) */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </Container>
  );
}
