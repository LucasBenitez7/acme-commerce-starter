import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getUserAddresses,
  getUserOrders,
  getUserOrderById,
  getUserOrderFullDetails,
  getOrderSuccessDetails,
} from "@/lib/account/queries";
import { prisma } from "@/lib/db";

const mockAddressFindMany = vi.mocked(prisma.userAddress.findMany);
const mockOrderFindMany = vi.mocked(prisma.order.findMany);
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique);
const mockOrderCount = vi.mocked(prisma.order.count);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Fixture ──────────────────────────────────────────────────────────────────
const makeOrder = (overrides: Record<string, any> = {}) => ({
  id: "order_1",
  userId: "user_1",
  paymentStatus: "PAID",
  fulfillmentStatus: "DELIVERED",
  isCancelled: false,
  totalMinor: 5000,
  currency: "EUR",
  createdAt: new Date("2025-01-01"),
  items: [
    {
      id: "item_1",
      quantity: 2,
      quantityReturned: 0,
      priceMinorSnapshot: 1999,
      product: { slug: "camiseta", compareAtPrice: null, images: [] },
    },
  ],
  history: [],
  ...overrides,
});

// ─── getUserAddresses ─────────────────────────────────────────────────────────
describe("getUserAddresses", () => {
  it("busca las direcciones del usuario con orden correcto", async () => {
    mockAddressFindMany.mockResolvedValue([{ id: "addr_1" }] as any);

    await getUserAddresses("user_1");

    expect(mockAddressFindMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  });

  it("devuelve array vacío si no hay direcciones", async () => {
    mockAddressFindMany.mockResolvedValue([]);
    expect(await getUserAddresses("user_1")).toEqual([]);
  });
});

// ─── getUserOrders ────────────────────────────────────────────────────────────
describe("getUserOrders", () => {
  beforeEach(() => {
    mockOrderFindMany.mockResolvedValue([makeOrder()] as any);
    mockOrderCount.mockResolvedValue(1);
  });

  it("devuelve orders, totalCount y totalPages", async () => {
    const result = await getUserOrders("user_1");
    expect(result.orders).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("calcula totalPages correctamente con múltiples páginas", async () => {
    mockOrderCount.mockResolvedValue(12);
    const result = await getUserOrders("user_1", 1, 5);
    expect(result.totalPages).toBe(3);
  });

  it("excluye paymentStatus PENDING por defecto", async () => {
    await getUserOrders("user_1");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.paymentStatus).toEqual({ not: "PENDING" });
  });

  it("aplica skip correcto según la página", async () => {
    await getUserOrders("user_1", 3, 5);
    const callArgs = mockOrderFindMany.mock.calls[0][0] as any;
    expect(callArgs.skip).toBe(10); // (3-1) * 5
  });

  it("añade filtro OR de búsqueda cuando hay query", async () => {
    await getUserOrders("user_1", 1, 5, undefined, "camiseta");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.OR).toBeDefined();
    expect(callWhere.OR[0].id.contains).toBe("camiseta");
  });

  it("statusTab ACTIVE filtra por PAID y estados de fulfillment activos", async () => {
    await getUserOrders("user_1", 1, 5, "ACTIVE");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.paymentStatus).toBe("PAID");
    expect(callWhere.isCancelled).toBe(false);
    expect(callWhere.fulfillmentStatus.in).toContain("SHIPPED");
    expect(callWhere.fulfillmentStatus.in).toContain("UNFULFILLED");
  });

  it("statusTab COMPLETED filtra por DELIVERED y no cancelado", async () => {
    await getUserOrders("user_1", 1, 5, "COMPLETED");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.fulfillmentStatus).toBe("DELIVERED");
    expect(callWhere.isCancelled).toBe(false);
  });

  it("statusTab EXPIRED filtra por cancelado + FAILED + UNFULFILLED", async () => {
    await getUserOrders("user_1", 1, 5, "EXPIRED");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.isCancelled).toBe(true);
    expect(callWhere.paymentStatus).toBe("FAILED");
    expect(callWhere.fulfillmentStatus).toBe("UNFULFILLED");
  });

  it("statusTab CANCELLED filtra por isCancelled:true", async () => {
    await getUserOrders("user_1", 1, 5, "CANCELLED");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.isCancelled).toBe(true);
  });

  it("statusTab RETURNS añade condiciones de devolución en OR", async () => {
    await getUserOrders("user_1", 1, 5, "RETURNS");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.isCancelled).toBe(false);
    expect(callWhere.OR).toBeDefined();
  });

  it("statusTab PENDING_PAYMENT filtra por FAILED y no cancelado", async () => {
    await getUserOrders("user_1", 1, 5, "PENDING_PAYMENT");
    const callWhere = (mockOrderFindMany.mock.calls[0][0] as any).where;
    expect(callWhere.paymentStatus).toBe("FAILED");
    expect(callWhere.isCancelled).toBe(false);
  });
});

// ─── getUserOrderById ─────────────────────────────────────────────────────────
describe("getUserOrderById", () => {
  it("busca el pedido combinando id y userId", async () => {
    mockOrderFindUnique.mockResolvedValue(makeOrder() as any);

    await getUserOrderById("user_1", "order_1");

    expect(mockOrderFindUnique).toHaveBeenCalledWith({
      where: { id: "order_1", userId: "user_1" },
      include: { items: true },
    });
  });

  it("devuelve null si el pedido no existe", async () => {
    mockOrderFindUnique.mockResolvedValue(null);
    expect(await getUserOrderById("user_1", "inexistente")).toBeNull();
  });
});

// ─── getUserOrderFullDetails ──────────────────────────────────────────────────
describe("getUserOrderFullDetails", () => {
  it("devuelve null si el pedido no existe", async () => {
    mockOrderFindUnique.mockResolvedValue(null);
    expect(await getUserOrderFullDetails("user_1", "order_1")).toBeNull();
  });

  it("devuelve null si el pedido pertenece a otro usuario", async () => {
    mockOrderFindUnique.mockResolvedValue(makeOrder({ userId: "otro" }) as any);
    expect(await getUserOrderFullDetails("user_1", "order_1")).toBeNull();
  });

  it("calcula summary correctamente para pedido normal", async () => {
    const order = makeOrder({
      totalMinor: 5000,
      items: [
        {
          quantity: 2,
          quantityReturned: 1,
          priceMinorSnapshot: 1999,
          product: null,
        },
        {
          quantity: 1,
          quantityReturned: 0,
          priceMinorSnapshot: 999,
          product: null,
        },
      ],
    });
    mockOrderFindUnique.mockResolvedValue(order as any);

    const result = await getUserOrderFullDetails("user_1", "order_1");

    expect(result?.summary.originalQty).toBe(3);
    expect(result?.summary.returnedQty).toBe(1);
    expect(result?.summary.refundedAmountMinor).toBe(1999); // 1999 * 1
    expect(result?.summary.netTotalMinor).toBe(3001); // 5000 - 1999
  });

  it("caso especial REFUNDED con quantityReturned=0: usa totalMinor como refundedAmount", async () => {
    const order = makeOrder({
      paymentStatus: "REFUNDED",
      totalMinor: 5000,
      items: [
        {
          quantity: 2,
          quantityReturned: 0,
          priceMinorSnapshot: 2500,
          product: null,
        },
      ],
    });
    mockOrderFindUnique.mockResolvedValue(order as any);

    const result = await getUserOrderFullDetails("user_1", "order_1");

    expect(result?.summary.refundedAmountMinor).toBe(5000);
    expect(result?.summary.returnedQty).toBe(2); // = originalQty
    expect(result?.summary.netTotalMinor).toBe(0);
  });
});

// ─── getOrderSuccessDetails ───────────────────────────────────────────────────
describe("getOrderSuccessDetails", () => {
  it("busca el pedido solo por id (sin restricción de userId)", async () => {
    mockOrderFindUnique.mockResolvedValue(makeOrder() as any);

    await getOrderSuccessDetails("order_1");

    expect(mockOrderFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order_1" } }),
    );
  });

  it("devuelve null si el pedido no existe", async () => {
    mockOrderFindUnique.mockResolvedValue(null);
    expect(await getOrderSuccessDetails("inexistente")).toBeNull();
  });
});
