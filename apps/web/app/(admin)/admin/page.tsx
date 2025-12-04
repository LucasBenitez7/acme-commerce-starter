import Link from "next/link";
import {
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaUsers,
} from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [totalOrders, totalProducts, totalUsers, pendingOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    ]);

  const revenueAgg = await prisma.order.aggregate({
    _sum: { totalMinor: true },
    where: { status: "PAID" },
  });
  const totalRevenue = revenueAgg._sum.totalMinor ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visión general de tu tienda en tiempo real.
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex flex-row items-center justify-between space-y-0">
            <h2 className="text-base font-medium">Ingresos Totales</h2>
            <FaMoneyBillWave className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent className="p-0">
            <div className="text-xl font-bold">
              {formatMinor(totalRevenue, DEFAULT_CURRENCY)}
            </div>
            <p className="text-xs text-muted-foreground">En pedidos pagados</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <div className="flex flex-row items-center justify-between space-y-0">
            <h2 className="text-base font-medium">Pedidos</h2>
            <FaClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pendientes de pago
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <div className="flex flex-row items-center justify-between space-y-0">
            <h2 className="text-base font-medium">Productos</h2>
            <FaBox className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Activos en catálogo</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <div className="flex flex-row items-center justify-between space-y-0">
            <h2 className="text-base font-medium">Clientes</h2>
            <FaUsers className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent className="p-0">
            <div className="text-xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos directos o Gráficas futuras */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4 p-4">
					<div>
						<h2 className="text-lg font-medium">Acciones Rápidas</h2>
					</div>
					<CardContent className="flex gap-4 p-0">
						<Link
							href="/admin/products"
							className="text-base font-medium text-blue-600 border-b-2 border-background hover:border-blue-600"
						>
							Gestionar Inventario
						</Link>
						<Link
							href="/admin/orders"
							className="text-base font-medium text-blue-600 border-b-2 border-background hover:border-blue-600"
						>
							Ver últimos pedidos
						</Link>
					</CardContent>
				</Card>
			</div> */}
    </div>
  );
}
