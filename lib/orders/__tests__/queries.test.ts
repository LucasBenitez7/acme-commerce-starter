import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";
import {
  getAdminOrders,
  getAdminOrderById,
  getOrderForReturn,
} from "@/lib/orders/queries";

const mockPrismaOrder = vi.mocked(prisma.order);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeRawOrder(overrides = {}): any {
  return {
    id: "order-1",
    createdAt: new Date("2024-01-15"),
    paymentStatus: "PAID",
    fulfillmentStatus: "UNFULFILLED",
    isCancelled: false,
    totalMinor: 5000,
    currency: "EUR",
    firstName: "Lucas",
    lastName: "García",
    email: "lucas@test.com",
    user: null,
    items: [
      { priceMinorSnapshot: 2500, quantityReturned: 0 },
      { priceMinorSnapshot: 2500, quantityReturned: 0 },
    ],
    history: [],
    ...overrides,
  };
}

function makeDetailOrder(overrides = {}): any {
  return {
    id: "order-1",
    createdAt: new Date("2024-01-15"),
    paymentStatus: "PAID",
    fulfillmentStatus: "UNFULFILLED",
    isCancelled: false,
    totalMinor: 5000,
    currency: "EUR",
    firstName: "Lucas",
    lastName: "García",
    email: "lucas@test.com",
    user: null,
    items: [
      {
        id: "item-1",
        quantity: 2,
        quantityReturned: 0,
        priceMinorSnapshot: 2500,
        product: { images: [], compareAtPrice: null },
      },
    ],
    history: [],
    ...overrides,
  };
}

// ─── getAdminOrders ────────────────────────────────────────────────────────────

describe("getAdminOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("excluye pedidos PENDING por defecto cuando no hay filtros", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(0);

    await getAdminOrders({});

    const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
    expect(whereArg.paymentStatus).toEqual({ not: "PENDING" });
  });

  it("devuelve los pedidos mapeados al DTO correcto", async () => {
    const raw = makeRawOrder({
      items: [{ priceMinorSnapshot: 1000, quantityReturned: 1 }],
      user: { name: "Lucas", email: "lucas@test.com", image: null },
    });
    mockPrismaOrder.findMany.mockResolvedValue([raw]);
    mockPrismaOrder.count.mockResolvedValue(1);

    const { orders, total, totalPages } = await getAdminOrders({});

    expect(total).toBe(1);
    expect(totalPages).toBe(1);
    expect(orders[0].id).toBe("order-1");
    expect(orders[0].refundedAmountMinor).toBe(1000);
    expect(orders[0].netTotalMinor).toBe(4000);
    expect(orders[0].itemsCount).toBe(1);
    expect(orders[0].user?.email).toBe("lucas@test.com");
    expect(orders[0].guestInfo.firstName).toBe("Lucas");
  });

  it("calcula totalPages correctamente con paginación", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(45);

    const { totalPages } = await getAdminOrders({ page: 1, limit: 20 });

    expect(totalPages).toBe(3);
  });

  it("aplica skip correcto según la página", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(0);

    await getAdminOrders({ page: 3, limit: 10 });

    expect(mockPrismaOrder.findMany.mock.calls[0][0]?.skip).toBe(20);
  });

  it("filtra por query buscando en id, email, nombre y apellido", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(0);

    await getAdminOrders({ query: "lucas" });

    const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
    expect(whereArg.OR).toHaveLength(4);
    expect(whereArg.OR[0]).toEqual({
      id: { contains: "lucas", mode: "insensitive" },
    });
  });

  it("expande el filtro PAID para incluir REFUNDED y PARTIALLY_REFUNDED", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(0);

    await getAdminOrders({ paymentFilter: ["PAID"] });

    const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
    const statuses = whereArg.paymentStatus.in;
    expect(statuses).toContain("PAID");
    expect(statuses).toContain("REFUNDED");
    expect(statuses).toContain("PARTIALLY_REFUNDED");
  });

  it("aplica filtro de fulfillmentFilter correctamente", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([]);
    mockPrismaOrder.count.mockResolvedValue(0);

    await getAdminOrders({ fulfillmentFilter: ["SHIPPED", "DELIVERED"] });

    const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
    expect(whereArg.fulfillmentStatus).toEqual({
      in: ["SHIPPED", "DELIVERED"],
    });
  });

  describe("statusTab", () => {
    it("PENDING_PAYMENT: filtra por paymentStatus FAILED y no cancelados", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "PENDING_PAYMENT" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.paymentStatus).toBe("FAILED");
      expect(whereArg.isCancelled).toBe(false);
    });

    it("ACTIVE: filtra pedidos pagados y en proceso", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "ACTIVE" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.paymentStatus).toBe("PAID");
      expect(whereArg.isCancelled).toBe(false);
      expect(whereArg.fulfillmentStatus.in).toContain("UNFULFILLED");
      expect(whereArg.fulfillmentStatus.in).toContain("SHIPPED");
    });

    it("COMPLETED: filtra pedidos entregados", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "COMPLETED" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.fulfillmentStatus).toBe("DELIVERED");
      expect(whereArg.isCancelled).toBe(false);
    });

    it("RETURNS: filtra devoluciones y reembolsos", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "RETURNS" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.isCancelled).toBe(false);
      expect(whereArg.OR).toBeDefined();
      const returnsOR = whereArg.OR;
      expect(
        returnsOR.some((c: any) => c.fulfillmentStatus === "RETURNED"),
      ).toBe(true);
      expect(
        returnsOR.some(
          (c: any) =>
            c.history?.some?.snapshotStatus === SYSTEM_MSGS.RETURN_REQUESTED,
        ),
      ).toBe(true);
    });

    it("EXPIRED: filtra pedidos expirados", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "EXPIRED" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.isCancelled).toBe(true);
      expect(whereArg.paymentStatus).toBe("FAILED");
      expect(whereArg.fulfillmentStatus).toBe("UNFULFILLED");
    });

    it("CANCELLED: filtra pedidos cancelados", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ statusTab: "CANCELLED" });

      const whereArg = mockPrismaOrder.findMany.mock.calls[0][0]?.where as any;
      expect(whereArg.isCancelled).toBe(true);
    });
  });

  describe("ordenamiento", () => {
    const sortCases = [
      { sort: "date_asc", expected: { createdAt: "asc" } },
      { sort: "total_desc", expected: { totalMinor: "desc" } },
      { sort: "total_asc", expected: { totalMinor: "asc" } },
    ];

    sortCases.forEach(({ sort, expected }) => {
      it(`ordena por ${sort} correctamente`, async () => {
        mockPrismaOrder.findMany.mockResolvedValue([]);
        mockPrismaOrder.count.mockResolvedValue(0);

        await getAdminOrders({ sort });

        const orderByArg = mockPrismaOrder.findMany.mock.calls[0][0]?.orderBy;
        expect(orderByArg).toEqual(expected);
      });
    });

    it("ordena por customer_asc con array de criterios", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({ sort: "customer_asc" });

      const orderByArg = mockPrismaOrder.findMany.mock.calls[0][0]?.orderBy;
      expect(Array.isArray(orderByArg)).toBe(true);
      expect(orderByArg).toContainEqual({ firstName: "asc" });
    });

    it("usa createdAt desc por defecto cuando no hay sort", async () => {
      mockPrismaOrder.findMany.mockResolvedValue([]);
      mockPrismaOrder.count.mockResolvedValue(0);

      await getAdminOrders({});

      const orderByArg = mockPrismaOrder.findMany.mock.calls[0][0]?.orderBy;
      expect(orderByArg).toEqual({ createdAt: "desc" });
    });
  });

  it("mapea user como null para pedidos de invitados", async () => {
    mockPrismaOrder.findMany.mockResolvedValue([makeRawOrder({ user: null })]);
    mockPrismaOrder.count.mockResolvedValue(1);

    const { orders } = await getAdminOrders({});

    expect(orders[0].user).toBeNull();
    expect(orders[0].guestInfo.email).toBe("lucas@test.com");
  });
});

// ─── getAdminOrderById ─────────────────────────────────────────────────────────

describe("getAdminOrderById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve null si el pedido no existe", async () => {
    mockPrismaOrder.findUnique.mockResolvedValue(null);

    const result = await getAdminOrderById("no-existe");

    expect(result).toBeNull();
  });

  it("devuelve el pedido con el summary calculado", async () => {
    const order = makeDetailOrder({
      items: [
        {
          id: "i1",
          quantity: 3,
          quantityReturned: 1,
          priceMinorSnapshot: 1000,
          product: null,
        },
        {
          id: "i2",
          quantity: 2,
          quantityReturned: 0,
          priceMinorSnapshot: 2000,
          product: null,
        },
      ],
      totalMinor: 7000,
    });
    mockPrismaOrder.findUnique.mockResolvedValue(order);

    const result = await getAdminOrderById("order-1");

    expect(result).not.toBeNull();
    expect(result!.summary.originalQty).toBe(5);
    expect(result!.summary.returnedQty).toBe(1);
    expect(result!.summary.refundedAmountMinor).toBe(1000);
    expect(result!.summary.netTotalMinor).toBe(6000);
  });

  it("calcula summary con todos los items devueltos", async () => {
    const order = makeDetailOrder({
      items: [
        {
          id: "i1",
          quantity: 2,
          quantityReturned: 2,
          priceMinorSnapshot: 500,
          product: null,
        },
      ],
      totalMinor: 1000,
    });
    mockPrismaOrder.findUnique.mockResolvedValue(order);

    const result = await getAdminOrderById("order-1");

    expect(result!.summary.refundedAmountMinor).toBe(1000);
    expect(result!.summary.netTotalMinor).toBe(0);
  });

  it("busca por el id correcto", async () => {
    mockPrismaOrder.findUnique.mockResolvedValue(null);

    await getAdminOrderById("order-abc");

    expect(mockPrismaOrder.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order-abc" } }),
    );
  });
});

// ─── getOrderForReturn ─────────────────────────────────────────────────────────

describe("getOrderForReturn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve null si el pedido no existe", async () => {
    mockPrismaOrder.findUnique.mockResolvedValue(null);

    const result = await getOrderForReturn("no-existe");

    expect(result).toBeNull();
  });

  it("devuelve el pedido con sus items e imágenes", async () => {
    const order = makeDetailOrder();
    mockPrismaOrder.findUnique.mockResolvedValue(order);

    const result = await getOrderForReturn("order-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("order-1");
  });

  it("busca por el id correcto", async () => {
    mockPrismaOrder.findUnique.mockResolvedValue(null);

    await getOrderForReturn("order-xyz");

    expect(mockPrismaOrder.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order-xyz" } }),
    );
  });
});
