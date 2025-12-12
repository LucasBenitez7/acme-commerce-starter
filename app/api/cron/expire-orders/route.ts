import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const timeLimit = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING_PAYMENT",
        createdAt: {
          lt: timeLimit,
        },
      },
      include: {
        items: true,
      },
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ message: "No pending orders to expire." });
    }

    const results = await Promise.allSettled(
      expiredOrders.map(async (order) => {
        return prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stock: { increment: item.quantity },
                },
              });
            }
          }

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
