import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUser, FaBoxOpen, FaPhone } from "react-icons/fa6";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";

import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Extraemos los nuevos campos
  const { name, email, role, firstName, lastName, phone } = session.user;

  // Construimos el nombre completo real o usamos el fallback
  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : name || "Sin nombre";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1">
        {/* Tarjeta de Perfil */}
        <Card className="py-4 px-4">
          <CardHeader className="px-0 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Información Personal
            </CardTitle>
            <FaUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1 px-0">
            <div className="text-2xl font-bold">{displayName}</div>
            <p className="text-xs text-muted-foreground">{email}</p>
            {phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <FaPhone className="h-3 w-3" />
                <span>{phone}</span>
              </div>
            )}

            {role === "admin" && (
              <span className="mt-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Admin
              </span>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de Acceso Rápido a Pedidos */}
        <Card className="py-4 px-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
            <CardTitle className="text-sm font-medium px-0">
              Mis Pedidos
            </CardTitle>
            <FaBoxOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-xs text-muted-foreground mb-4">
              Consulta el estado de tus compras recientes.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/account/orders">Ver historial completo</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tarjeta de Sesión (Cerrar sesión) */}
        <Card className="border-red-100 bg-red-50/50 dark:border-red-900/20 dark:bg-red-900/10 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
            <CardTitle className="text-sm font-medium text-red-600 px-0">
              Zona de peligro
            </CardTitle>
            <FaSignOutAlt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-xs text-muted-foreground mb-4">
              Cierra la sesión de este dispositivo.
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Cerrar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
