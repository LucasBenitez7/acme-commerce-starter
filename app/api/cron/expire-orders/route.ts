import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { InventoryService } from "@/lib/services/inventory.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const timeLimit = new Date(Date.now() - 30 * 60 * 1000); // 30 min

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING_PAYMENT",
        createdAt: { lt: timeLimit },
      },
      include: { items: true },
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ message: "No pending orders to expire." });
    }

    const results = await Promise.allSettled(
      expiredOrders.map(async (order) => {
        return prisma.$transaction(async (tx) => {
          // 1. Preparamos los items para devolver al stock
          // Filtramos solo los que tienen variantId (por si hay productos borrados o especiales)
          const itemsToRestock = order.items
            .filter((i) => i.variantId)
            .map((i) => ({
              variantId: i.variantId!,
              quantity: i.quantity,
            }));

          // 2. Usamos el servicio pasando la transacción (tx)
          if (itemsToRestock.length > 0) {
            await InventoryService.updateStock(itemsToRestock, "increment", tx);
          }

          // 3. Expiramos la orden
          await tx.order.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });

          return order.id;
        });
      }),
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: "Process completed",
      processed: expiredOrders.length,
      succeeded: successCount,
      failed: failCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON JOB ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
