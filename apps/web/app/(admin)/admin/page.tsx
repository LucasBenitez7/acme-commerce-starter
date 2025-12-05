import {
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaUsers,
  FaRotateLeft,
  FaWallet,
  FaArrowTrendUp,
} from "react-icons/fa6";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatMinor, DEFAULT_CURRENCY } from "@/lib/currency";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. Consultas Generales
  const [totalOrders, totalProducts, totalUsers, pendingOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    ]);

  // 2. Consulta Financiera Compleja
  const financialOrders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "RETURN_REQUESTED", "RETURNED"] },
    },
    select: {
      totalMinor: true,
      items: {
        select: {
          priceMinorSnapshot: true,
          quantityReturned: true,
        },
      },
    },
  });

  // 3. Cálculos en Memoria
  let grossRevenue = 0;
  let totalRefunds = 0;
  let returnedItemsCount = 0;

  for (const order of financialOrders) {
    grossRevenue += order.totalMinor;

    const orderRefundValue = order.items.reduce((acc, item) => {
      returnedItemsCount += item.quantityReturned;
      return acc + item.priceMinorSnapshot * item.quantityReturned;
    }, 0);

    totalRefunds += orderRefundValue;
  }

  const netRevenue = grossRevenue - totalRefunds;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen financiero y operativo de tu tienda.
        </p>
      </div>

      {/* --- SECCIÓN FINANCIERA --- */}
      <div>
        <h3 className="text-lg font-medium mb-4">Finanzas</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Ingresos Brutos */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas Totales (Bruto)
              </CardTitle>
              <FaMoneyBillWave className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMinor(grossRevenue, DEFAULT_CURRENCY)}
              </div>
              <p className="text-xs text-muted-foreground">
                Volumen total transaccionado
              </p>
            </CardContent>
          </Card>

          {/* 2. Reembolsos */}
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reembolsos
              </CardTitle>
              <FaRotateLeft className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                - {formatMinor(totalRefunds, DEFAULT_CURRENCY)}
              </div>
              <p className="text-xs text-muted-foreground">
                Dinero devuelto a clientes
              </p>
            </CardContent>
          </Card>

          {/* 3. Ingresos Netos (El dato más importante) */}
          <Card className="border-l-4 border-l-green-500 shadow-md bg-green-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-green-800">
                Ingresos Netos
              </CardTitle>
              <FaWallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatMinor(netRevenue, DEFAULT_CURRENCY)}
              </div>
              <p className="text-xs text-green-600 font-medium">
                Beneficio real en caja
              </p>
            </CardContent>
          </Card>

          {/* 4. Productos Devueltos (Inventario) */}
          <Card className="border-l-4 border-l-orange-400 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Items Devueltos
              </CardTitle>
              <FaBox className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {returnedItemsCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  u.
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Productos reingresados a stock
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- SECCIÓN OPERATIVA --- */}
      <div>
        <h3 className="text-lg font-medium mb-4">Operaciones</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pedidos
              </CardTitle>
              <FaClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pendientes de pago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catálogo</CardTitle>
              <FaBox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Productos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <FaUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios registrados
              </p>
            </CardContent>
          </Card>

          {/* Card de Crecimiento (Placeholder visual) */}
          <Card className="bg-neutral-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                Estado
              </CardTitle>
              <FaArrowTrendUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activo</div>
              <p className="text-xs text-neutral-400">Tienda operativa v1.0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
