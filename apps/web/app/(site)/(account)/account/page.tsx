import Link from "next/link";
import { FaUser, FaBoxOpen, FaSignOutAlt } from "react-icons/fa";

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
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { name, email, role } = session.user;

  return (
    <div className="space-y-6">
      {/* Encabezado simple */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Bienvenido, {name}
        </h2>
        <p className="text-muted-foreground">
          Desde aquí puedes ver tus pedidos recientes y gestionar tu cuenta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta de Perfil */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Información Personal
            </CardTitle>
            <FaUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{name || "Sin nombre"}</div>
            <p className="text-xs text-muted-foreground">{email}</p>
            {role === "admin" && (
              <span className="mt-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Admin
              </span>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de Acceso Rápido a Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Pedidos</CardTitle>
            <FaBoxOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Consulta el estado de tus compras recientes.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/account/orders">Ver historial completo</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tarjeta de Sesión (Cerrar sesión) */}
        <Card className="border-red-100 bg-red-50/50 dark:border-red-900/20 dark:bg-red-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Zona de peligro
            </CardTitle>
            <FaSignOutAlt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
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
