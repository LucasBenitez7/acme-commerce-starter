import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const TIMEOUT_MS = 60 * 60 * 1000;

    const timeLimit = new Date(Date.now() - TIMEOUT_MS);

    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        isCancelled: false,
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
          // 1. Devolver Stock
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }

          // 2. Marcar orden como Expirada
          await tx.order.update({
            where: { id: order.id },
            data: {
              isCancelled: true,
              paymentStatus: "FAILED",
            },
          });

          // 3. Historial
          await tx.orderHistory.create({
            data: {
              orderId: order.id,
              type: "INCIDENT",
              snapshotStatus: "Expirado",
              actor: "system",
              reason:
                "Tiempo de pago agotado (1h). Pedido expirado automáticamente.",
            },
          });

          return order.id;
        });
      }),
    );

    return NextResponse.json({
      message: "Expired process completed",
      processed: expiredOrders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON JOB ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
