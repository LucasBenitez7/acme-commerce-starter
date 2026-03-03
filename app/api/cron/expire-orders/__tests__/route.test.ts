import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { GET } from "@/app/api/cron/expire-orders/route";

const mockOrderFindMany = vi.mocked(prisma.order.findMany);
const mockTransaction = vi.mocked(prisma.$transaction);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(authHeader?: string) {
  return {
    headers: {
      get: vi.fn((key: string) =>
        key === "authorization" ? (authHeader ?? null) : null,
      ),
    },
  } as unknown as Request;
}

const makeOrder = (id: string, itemCount = 1) => ({
  id,
  items: Array.from({ length: itemCount }, (_, i) => ({
    id: `item_${i}`,
    variantId: `variant_${i}`,
    quantity: 2,
  })),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "super-secret-cron-token");
});

// ─── Autenticación ────────────────────────────────────────────────────────────
describe("GET /api/cron/expire-orders — autenticación", () => {
  it("devuelve 401 si no hay authorization header", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("devuelve 401 si el token no coincide con CRON_SECRET", async () => {
    const res = await GET(makeRequest("Bearer token-incorrecto"));
    expect(res.status).toBe(401);
  });

  it("pasa la autenticación con el token correcto", async () => {
    mockOrderFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest("Bearer super-secret-cron-token"));
    expect(res.status).toBe(200);
  });
});

// ─── Sin pedidos expirados ────────────────────────────────────────────────────
describe("GET /api/cron/expire-orders — sin pedidos", () => {
  it("devuelve mensaje informativo si no hay pedidos pendientes", async () => {
    mockOrderFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest("Bearer super-secret-cron-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain("No pending orders");
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

// ─── Procesamiento de pedidos ─────────────────────────────────────────────────
describe("GET /api/cron/expire-orders — procesamiento", () => {
  beforeEach(() => {
    // $transaction con callback por orden
    mockTransaction.mockImplementation(async (fn: any) => {
      const tx = {
        productVariant: { update: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        orderHistory: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });
  });

  it("procesa los pedidos expirados y devuelve estadísticas correctas", async () => {
    mockOrderFindMany.mockResolvedValue([
      makeOrder("order_1"),
      makeOrder("order_2"),
    ] as any);

    const res = await GET(makeRequest("Bearer super-secret-cron-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.processed).toBe(2);
    expect(body.successful).toBe(2);
    expect(body.failed).toBe(0);
  });

  it("ejecuta $transaction una vez por pedido", async () => {
    mockOrderFindMany.mockResolvedValue([
      makeOrder("order_1"),
      makeOrder("order_2"),
      makeOrder("order_3"),
    ] as any);

    await GET(makeRequest("Bearer super-secret-cron-token"));

    expect(mockTransaction).toHaveBeenCalledTimes(3);
  });

  it("devuelve stock de las variantes en la transacción", async () => {
    const txMock = {
      productVariant: { update: vi.fn().mockResolvedValue({}) },
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));
    mockOrderFindMany.mockResolvedValue([makeOrder("order_1", 2)] as any);

    await GET(makeRequest("Bearer super-secret-cron-token"));

    // 2 items → 2 llamadas a productVariant.update
    expect(txMock.productVariant.update).toHaveBeenCalledTimes(2);
    expect(txMock.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stock: { increment: 2 } },
      }),
    );
  });

  it("marca el pedido como cancelado y FAILED en la transacción", async () => {
    const txMock = {
      productVariant: { update: vi.fn().mockResolvedValue({}) },
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));
    mockOrderFindMany.mockResolvedValue([makeOrder("order_1")] as any);

    await GET(makeRequest("Bearer super-secret-cron-token"));

    expect(txMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order_1" },
        data: { isCancelled: true, paymentStatus: "FAILED" },
      }),
    );
  });

  it("crea entrada de historial con actor 'system'", async () => {
    const txMock = {
      productVariant: { update: vi.fn().mockResolvedValue({}) },
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));
    mockOrderFindMany.mockResolvedValue([makeOrder("order_1")] as any);

    await GET(makeRequest("Bearer super-secret-cron-token"));

    expect(txMock.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order_1",
          actor: "system",
          snapshotStatus: "Expirado Automáticamente",
        }),
      }),
    );
  });

  it("no actualiza stock si el item no tiene variantId", async () => {
    const txMock = {
      productVariant: { update: vi.fn().mockResolvedValue({}) },
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));
    mockOrderFindMany.mockResolvedValue([
      {
        id: "order_1",
        items: [{ id: "item_1", variantId: null, quantity: 1 }],
      },
    ] as any);

    await GET(makeRequest("Bearer super-secret-cron-token"));

    expect(txMock.productVariant.update).not.toHaveBeenCalled();
  });

  it("contabiliza failed correctamente cuando una transacción falla", async () => {
    let callCount = 0;
    mockTransaction.mockImplementation(async (fn: any) => {
      callCount++;
      if (callCount === 2) throw new Error("DB error en orden 2");
      const tx = {
        productVariant: { update: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        orderHistory: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });
    mockOrderFindMany.mockResolvedValue([
      makeOrder("order_1"),
      makeOrder("order_2"),
    ] as any);

    const res = await GET(makeRequest("Bearer super-secret-cron-token"));
    const body = await res.json();

    expect(body.successful).toBe(1);
    expect(body.failed).toBe(1);
  });
});

// ─── Error crítico ────────────────────────────────────────────────────────────
describe("GET /api/cron/expire-orders — error crítico", () => {
  it("devuelve 500 si findMany lanza una excepción", async () => {
    mockOrderFindMany.mockRejectedValue(new Error("DB connection lost"));

    const res = await GET(makeRequest("Bearer super-secret-cron-token"));
    expect(res.status).toBe(500);
  });
});
