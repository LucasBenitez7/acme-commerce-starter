import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";

import { auth } from "@/lib/auth";

export default async function AccountProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  const isVerified = "verified";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl text-center sm:text-left font-semibold pb-2 border-b border-neutral-300">
          Mi Cuenta
        </h2>
      </div>

      <Card className="overflow-hidden pb-0">
        <CardContent className="p-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* GRUPO 1: INFORMACIÓN BÁSICA */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase">
                <FaUser className="size-3" /> Nombre
              </div>
              <p className="text-sm font-medium text-foreground pl-6">
                {user.firstName || "No especificado"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase">
                <FaUser className="size-3" /> Apellidos
              </div>
              <p className="text-sm font-medium text-foreground pl-6">
                {user.lastName || "No especificado"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase">
                <FaEnvelope className="size-3" /> Correo Electrónico
                {isVerified === "verified" && (
                  <div className="flex items-center py-0-5 px-2 rounded-full bg-blue-50 text-blue-600 text-xs font-medium lowercase">
                    verificado
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground pl-6">
                {user.email}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase">
                <FaPhone className="size-3" /> Teléfono
              </div>
              <p className="text-sm font-medium text-foreground pl-6">
                {user.phone || (
                  <span className="text-neutral-400 italic text-sm">
                    No registrado
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
