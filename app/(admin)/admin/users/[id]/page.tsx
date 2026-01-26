import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaUserShield,
  FaPhone,
} from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAdminUserDetails } from "@/lib/admin/queries";

import { RecentOrdersTable } from "./_components/RecentOrdersTable";
import { UserAddressesCard } from "./_components/UserAddressesCard";
import { UserStatsCard } from "./_components/UserStatsCard";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getAdminUserDetails(id);

  if (!data) return notFound();

  const { user, stats } = data;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b pb-2">
        <div className="flex justify-start">
          <Button variant="ghost" size="icon" asChild className="size-8">
            <Link href="/admin/users">
              <FaArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Detalles del Cliente
          </h1>
        </div>

        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMNA IZQUIERDA (Perfil + Direcciones) */}
        <div className="space-y-4 lg:col-span-1">
          {/* 1. PERFIL CARD */}
          <Card>
            <CardContent className="pt-6 pb-4 px-4">
              <div className="flex flex-col items-center text-center">
                <FaUser className="size-10 text-foreground" />

                <h2 className="text-xl font-bold mt-2">
                  {user.name || "Sin nombre"}
                </h2>

                <div className="mt-2 mb-4">
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role === "ADMIN" && (
                      <FaUserShield className="size-3" />
                    )}
                    {user.role.toUpperCase()}
                  </Badge>
                </div>

                <div className="w-full space-y-3 text-sm text-left border-t pt-4">
                  <div className="flex items-center gap-3 text-foreground">
                    <FaEnvelope className="size-4" />
                    <Link
                      href={`mailto:${user.email}`}
                      className="text-blue-500 hover:underline block underline-offset-4 text-sm font-medium"
                    >
                      {user.email}
                    </Link>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3 text-foreground">
                      <FaPhone className="size-4" />
                      <span className="text-foreground font-medium">
                        {user.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 font-medium text-foreground">
                    <FaCalendar className="size-4" />
                    <span>
                      Registrado:{" "}
                      <span className="text-foreground font-medium">
                        {new Date(user.createdAt).toLocaleDateString("es-ES", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-medium text-foreground">
                    <FaUser className="size-4" />
                    <span>
                      ID:{" "}
                      <span className="font-mono text-xs uppercase text-foreground">
                        {user.id}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. DIRECCIONES */}
          <UserAddressesCard addresses={user.addresses} />
        </div>

        {/* COLUMNA DERECHA (Stats + Pedidos) */}
        <div className="space-y-4 lg:col-span-2">
          {/* 3. STATS */}
          <UserStatsCard
            totalOrders={stats.totalOrders}
            totalSpentMinor={stats.totalSpentMinor}
          />

          {/* 4. ÚLTIMOS PEDIDOS */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-neutral-50/50 pb-1 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Últimos Pedidos
                </CardTitle>

                <Link
                  href={`/admin/orders?query=${user.email}`}
                  className="text-sm fx-underline-anim font-medium"
                >
                  Ver todos los pedidos &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentOrdersTable orders={user.orders} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
