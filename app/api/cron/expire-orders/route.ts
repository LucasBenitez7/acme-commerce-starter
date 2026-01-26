import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("[CRON] Unauthorized attempt to run expire-orders");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const start = Date.now();
    console.log("[CRON] Starting expire-orders job...");

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
      return NextResponse.json({
        message: "No pending orders to expire.",
        timestamp: new Date().toISOString(),
      });
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
              type: "STATUS_CHANGE",
              snapshotStatus: "Expirado Automatically",
              actor: "system",
              reason: "Tiempo de pago agotado (1h). Stock liberado.",
            },
          });

          return order.id;
        });
      }),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    const duration = Date.now() - start;

    console.log(
      `[CRON] Finished. Success: ${successful}, Failed: ${failed}. Duration: ${duration}ms`,
    );

    return NextResponse.json({
      message: "Expired process completed",
      processed: expiredOrders.length,
      successful,
      failed,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON JOB CRITICAL ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
