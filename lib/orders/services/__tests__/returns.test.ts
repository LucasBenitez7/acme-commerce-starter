import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";
import {
  processOrderReturn,
  rejectOrderReturnRequest,
  requestOrderReturn,
} from "@/lib/orders/services/returns";

const mockTransaction = vi.mocked(prisma.$transaction);

// ─── Helpers de transacción ────────────────────────────────────────────────────

const makeTxMock = () => ({
  order: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  orderItem: {
    findMany: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({}),
  },
  orderHistory: {
    create: vi.fn().mockResolvedValue({}),
  },
  productVariant: {
    update: vi.fn().mockResolvedValue({}),
  },
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const makeOrderItem = (overrides = {}): any => ({
  id: "item-1",
  nameSnapshot: "Camiseta",
  sizeSnapshot: "M",
  colorSnapshot: "Rojo",
  quantity: 2,
  quantityReturned: 0,
  quantityReturnRequested: 0,
  variantId: "v1",
  orderId: "order-1",
  ...overrides,
});

const makeDeliveredOrder = (overrides = {}): any => ({
  id: "order-1",
  userId: null,
  paymentStatus: "PAID",
  fulfillmentStatus: "DELIVERED",
  isCancelled: false,
  items: [makeOrderItem()],
  ...overrides,
});

// ─── processOrderReturn ────────────────────────────────────────────────────────

describe("processOrderReturn", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lanza error si el pedido no tiene items", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 1 }]),
    ).rejects.toThrow("Pedido sin items");
  });

  it("lanza error si la cantidad a devolver supera el máximo", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantityReturnRequested: 1 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 5 }]),
    ).rejects.toThrow("Cantidad excesiva");
  });

  it("actualiza quantityReturned del item correcto", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([makeOrderItem()]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 1 }]);

    expect(tx.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({
          quantityReturned: { increment: 1 },
          quantityReturnRequested: 0,
        }),
      }),
    );
  });

  it("devuelve el stock a la variante", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([makeOrderItem()]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 2 }]);

    expect(tx.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "v1" },
        data: { stock: { increment: 2 } },
      }),
    );
  });

  it("establece REFUNDED y RETURNED cuando se devuelven todos los items", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantity: 2, quantityReturned: 0 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 2 }]);

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: "REFUNDED",
          fulfillmentStatus: "RETURNED",
        }),
      }),
    );
  });

  it("establece PARTIALLY_REFUNDED y DELIVERED en devolución parcial", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantity: 3, quantityReturned: 0 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 1 }]);

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: "PARTIALLY_REFUNDED",
          fulfillmentStatus: "DELIVERED",
        }),
      }),
    );
  });

  it("ignora items con qtyToReturn <= 0", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([makeOrderItem()]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 0 }]);

    expect(tx.orderItem.update).not.toHaveBeenCalled();
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });

  it("crea historial de devolución aceptada", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([makeOrderItem()]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await processOrderReturn("order-1", [{ itemId: "item-1", qtyToReturn: 1 }]);

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: SYSTEM_MSGS.RETURN_ACCEPTED,
        }),
      }),
    );
  });
});

// ─── rejectOrderReturnRequest ──────────────────────────────────────────────────

describe("rejectOrderReturnRequest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lanza error si no hay solicitud activa", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      rejectOrderReturnRequest("order-1", "No procede"),
    ).rejects.toThrow("No hay solicitud activa");
  });

  it("resetea quantityReturnRequested a 0 en todos los items", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantityReturnRequested: 2 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await rejectOrderReturnRequest("order-1", "No procede");

    expect(tx.orderItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderId: "order-1", quantityReturnRequested: { gt: 0 } },
        data: { quantityReturnRequested: 0 },
      }),
    );
  });

  it("guarda el motivo de rechazo en la orden", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantityReturnRequested: 1 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await rejectOrderReturnRequest("order-1", "Producto usado");

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rejectionReason: "Producto usado",
          returnReason: null,
        }),
      }),
    );
  });

  it("crea historial con mensaje de rechazo", async () => {
    const tx = makeTxMock();
    tx.orderItem.findMany.mockResolvedValue([
      makeOrderItem({ quantityReturnRequested: 1 }),
    ]);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await rejectOrderReturnRequest("order-1", "No procede");

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: SYSTEM_MSGS.RETURN_REJECTED,
        }),
      }),
    );
  });
});

// ─── requestOrderReturn ────────────────────────────────────────────────────────

describe("requestOrderReturn", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lanza error si el pedido no existe", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(null);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("no-existe", null, "Talla incorrecta", []),
    ).rejects.toThrow("Pedido no encontrado");
  });

  it("lanza error si el pedido está cancelado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makeDeliveredOrder({ isCancelled: true }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", null, "Motivo", []),
    ).rejects.toThrow("cancelado");
  });

  it("lanza error si el pedido no está pagado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makeDeliveredOrder({ paymentStatus: "PENDING" }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", null, "Motivo", []),
    ).rejects.toThrow("condiciones de pago");
  });

  it("lanza error si el pedido no está entregado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makeDeliveredOrder({ fulfillmentStatus: "SHIPPED" }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", null, "Motivo", []),
    ).rejects.toThrow("entregado");
  });

  it("lanza error si userId no coincide con el del pedido", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makeDeliveredOrder({ userId: "otro-user" }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", "user-actual", "Motivo", []),
    ).rejects.toThrow("permiso");
  });

  it("lanza error si la cantidad supera el máximo devolvible", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makeDeliveredOrder({
        items: [
          makeOrderItem({
            quantity: 2,
            quantityReturned: 0,
            quantityReturnRequested: 0,
          }),
        ],
      }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", null, "Motivo", [
        { itemId: "item-1", qty: 5 },
      ]),
    ).rejects.toThrow("Cantidad inválida");
  });

  it("lanza error si no se selecciona ningún producto", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makeDeliveredOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      requestOrderReturn("order-1", null, "Motivo", [
        { itemId: "item-inexistente", qty: 1 },
      ]),
    ).rejects.toThrow("al menos un producto");
  });

  it("actualiza quantityReturnRequested del item", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makeDeliveredOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await requestOrderReturn("order-1", null, "Talla incorrecta", [
      { itemId: "item-1", qty: 1 },
    ]);

    expect(tx.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: { quantityReturnRequested: { increment: 1 } },
      }),
    );
  });

  it("guarda el motivo de devolución en la orden", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makeDeliveredOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await requestOrderReturn("order-1", null, "Talla incorrecta", [
      { itemId: "item-1", qty: 1 },
    ]);

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          returnReason: "Talla incorrecta",
          rejectionReason: null,
        }),
      }),
    );
  });

  it("crea historial con snapshotStatus RETURN_REQUESTED", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makeDeliveredOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await requestOrderReturn("order-1", null, "Talla incorrecta", [
      { itemId: "item-1", qty: 1 },
    ]);

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshotStatus: SYSTEM_MSGS.RETURN_REQUESTED,
          actor: "user",
        }),
      }),
    );
  });
});
