import { type UserAddress } from "@prisma/client";
import { FaLock } from "react-icons/fa6";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutProvider } from "@/components/checkout/CheckoutProvider";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { CheckoutLocalFooter } from "@/components/checkout/layout/CheckoutFooter";
import { CheckoutHeader } from "@/components/checkout/layout/CheckoutHeader";
import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const user = session?.user || null;

  const defaultValues = {
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  };

  let savedAddresses: UserAddress[] = [];
  if (user?.id) {
    savedAddresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });
  }

  return (
    <Container>
      <CheckoutProvider defaultValues={defaultValues}>
        <div className="grid lg:grid-cols-[1.5fr_1fr] items-start">
          <div className="flex flex-col lg:min-h-screen">
            <div className="flex-1">
              <CheckoutHeader />

              <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-6">
                <div className="flex gap-2 items-center border-b border-neutral-300 my-4 mb-5 pb-1 pr-1">
                  <FaLock />
                  <h1 className="text-xl font-semibold text-left">
                    Proceso de compra segura
                  </h1>
                </div>

                <CheckoutForm savedAddresses={savedAddresses} />
              </div>
            </div>

            <div className="hidden lg:block mt-auto">
              <CheckoutLocalFooter />
            </div>
          </div>

          <div className="lg:sticky lg:top-0 lg:h-screen px-4 lg:px-0">
            <CheckoutSummary />
          </div>

          <div className="lg:hidden mt-8">
            <CheckoutLocalFooter />
          </div>
        </div>
      </CheckoutProvider>
    </Container>
  );
}
