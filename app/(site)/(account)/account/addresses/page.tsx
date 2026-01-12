import { FaMapLocationDot } from "react-icons/fa6";

import { AddressCard } from "@/components/account/AddressCard";
import { AddressFormDialog } from "@/components/account/AddressFormDialog";

import { getUserAddresses } from "@/lib/account/queries";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const addresses = await getUserAddresses(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mis Direcciones</h2>
          <p className="text-muted-foreground">
            Gestiona tus direcciones de envío.
          </p>
        </div>
        <AddressFormDialog />
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center bg-neutral-50/50">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <FaMapLocationDot className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium">
            No tienes direcciones guardadas
          </h3>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">
            Añade una ahora.
          </p>
          <AddressFormDialog />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </div>
  );
}
