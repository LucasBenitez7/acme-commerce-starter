import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";
import {
  createOrder,
  updateOrderAddress,
} from "@/lib/orders/services/creation";

// ─── Mock de la transacción ────────────────────────────────────────────────────

const makeTxMock = () => ({
  productVariant: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  order: {
    create: vi.fn(),
  },
  orderHistory: {
    create: vi.fn().mockResolvedValue({}),
  },
});

const mockTransaction = vi.mocked(prisma.$transaction);
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique);
const mockOrderUpdate = vi.mocked(prisma.order.update);

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const baseInput: any = {
  shippingType: "home",
  firstName: "Lucas",
  lastName: "García",
  email: "lucas@test.com",
  phone: "600000000",
  street: "Calle Mayor 1",
  postalCode: "28001",
  city: "Madrid",
  province: "Madrid",
  country: "España",
  details: null,
  paymentMethod: "card",
  cartItems: [
    { productId: "p1", variantId: "v1", quantity: 2, priceCents: 1000 },
  ],
};

const makeVariant = (overrides = {}): any => ({
  id: "v1",
  productId: "p1",
  size: "M",
  color: "Rojo",
  stock: 10,
  priceCents: null,
  product: { name: "Camiseta", priceCents: 1500 },
  ...overrides,
});

const makeCreatedOrder = (overrides = {}): any => ({
  id: "order-new",
  totalMinor: 3000,
  paymentStatus: "PENDING",
  ...overrides,
});

// ─── createOrder ───────────────────────────────────────────────────────────────

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea la orden con el total calculado correctamente", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder({ totalMinor: 3000 }));
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalMinor: 3000,
          itemsTotalMinor: 3000,
          paymentStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          currency: "EUR",
        }),
      }),
    );
  });

  it("usa priceCents de la variante si está definido", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(
      makeVariant({ priceCents: 2000 }),
    );
    tx.order.create.mockResolvedValue(makeCreatedOrder({ totalMinor: 4000 }));
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalMinor: 4000 }),
      }),
    );
  });

  it("usa priceCents del producto si la variante no tiene precio propio", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(
      makeVariant({
        priceCents: null,
        product: { name: "Camiseta", priceCents: 1500 },
      }),
    );
    tx.order.create.mockResolvedValue(makeCreatedOrder({ totalMinor: 3000 }));
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalMinor: 3000 }),
      }),
    );
  });

  it("lanza error si la variante no existe", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(null);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(createOrder(baseInput)).rejects.toThrow("ya no existe");
  });

  it("lanza error si no hay stock suficiente", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant({ stock: 1 }));
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    const input = {
      ...baseInput,
      cartItems: [{ productId: "p1", variantId: "v1", quantity: 5 }],
    };

    await expect(createOrder(input)).rejects.toThrow("Stock insuficiente");
  });

  it("decrementa el stock de la variante al crear la orden", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "v1" },
        data: { stock: { decrement: 2 } },
      }),
    );
  });

  it("crea el evento de historial inicial con actor 'guest' para invitados", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshotStatus: SYSTEM_MSGS.ORDER_CREATED,
          actor: "guest",
        }),
      }),
    );
  });

  it("crea el evento de historial con actor 'user' para usuarios registrados", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput, "user-123");

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actor: "user" }),
      }),
    );
  });

  it("asigna stripePaymentIntentId si se pasa", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput, "user-123", "pi_test");

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stripePaymentIntentId: "pi_test" }),
      }),
    );
  });

  it("mapea correctamente la dirección para shippingType home", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await createOrder(baseInput);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          street: "Calle Mayor 1",
          postalCode: "28001",
          city: "Madrid",
          province: "Madrid",
          storeLocationId: null,
          pickupLocationId: null,
        }),
      }),
    );
  });

  it("mapea correctamente storeLocationId para shippingType store", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    tx.order.create.mockResolvedValue(makeCreatedOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    const storeInput = {
      ...baseInput,
      shippingType: "store",
      storeLocationId: "store-1",
    };

    await createOrder(storeInput);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeLocationId: "store-1",
          street: null,
          city: null,
        }),
      }),
    );
  });

  it("devuelve la orden creada", async () => {
    const tx = makeTxMock();
    tx.productVariant.findUnique.mockResolvedValue(makeVariant());
    const expectedOrder = makeCreatedOrder({ id: "order-abc" });
    tx.order.create.mockResolvedValue(expectedOrder);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    const result = await createOrder(baseInput);

    expect(result.id).toBe("order-abc");
  });
});

// ─── updateOrderAddress ────────────────────────────────────────────────────────

describe("updateOrderAddress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lanza error si el pedido no existe", async () => {
    mockOrderFindUnique.mockResolvedValue(null);

    await expect(updateOrderAddress("no-existe", baseInput)).rejects.toThrow(
      "Pedido no encontrado",
    );
  });

  it("lanza error si el pedido no está en estado PENDING", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: null,
      paymentStatus: "PAID",
    } as any);

    await expect(updateOrderAddress("order-1", baseInput)).rejects.toThrow(
      "No se puede modificar",
    );
  });

  it("lanza error si el pedido pertenece a otro usuario", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: "otro-usuario",
      paymentStatus: "PENDING",
    } as any);

    await expect(
      updateOrderAddress("order-1", baseInput, "user-actual"),
    ).rejects.toThrow("No autorizado");
  });

  it("permite modificar si el usuario es el propietario", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: "user-123",
      paymentStatus: "PENDING",
    } as any);
    mockOrderUpdate.mockResolvedValue({ id: "order-1" } as any);

    await expect(
      updateOrderAddress("order-1", baseInput, "user-123"),
    ).resolves.not.toThrow();
  });

  it("permite modificar pedidos de invitados sin actorUserId", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: null,
      paymentStatus: "PENDING",
    } as any);
    mockOrderUpdate.mockResolvedValue({ id: "order-1" } as any);

    await expect(
      updateOrderAddress("order-1", baseInput),
    ).resolves.not.toThrow();
  });

  it("actualiza los campos de dirección correctamente para shippingType home", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: null,
      paymentStatus: "PENDING",
    } as any);
    mockOrderUpdate.mockResolvedValue({ id: "order-1" } as any);

    await updateOrderAddress("order-1", baseInput);

    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: "Lucas",
          lastName: "García",
          street: "Calle Mayor 1",
          city: "Madrid",
          postalCode: "28001",
        }),
      }),
    );
  });

  it("devuelve la orden actualizada", async () => {
    mockOrderFindUnique.mockResolvedValue({
      userId: null,
      paymentStatus: "PENDING",
    } as any);
    const updated = { id: "order-1", firstName: "Lucas" } as any;
    mockOrderUpdate.mockResolvedValue(updated);

    const result = await updateOrderAddress("order-1", baseInput);

    expect(result.id).toBe("order-1");
  });
});
