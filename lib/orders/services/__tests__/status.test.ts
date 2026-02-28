import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import { SYSTEM_MSGS } from "@/lib/orders/constants";
import {
  updateFulfillmentStatus,
  cancelOrder,
} from "@/lib/orders/services/status";

const mockTransaction = vi.mocked(prisma.$transaction);

// ─── Helpers de transacción ────────────────────────────────────────────────────

const makeTxMock = () => ({
  order: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  orderHistory: {
    create: vi.fn().mockResolvedValue({}),
  },
  productVariant: {
    update: vi.fn().mockResolvedValue({}),
  },
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const makePaidOrder = (overrides = {}): any => ({
  id: "order-1",
  userId: null,
  paymentStatus: "PAID",
  fulfillmentStatus: "UNFULFILLED",
  isCancelled: false,
  items: [],
  ...overrides,
});

const makePendingOrder = (overrides = {}): any => ({
  id: "order-1",
  userId: null,
  paymentStatus: "PENDING",
  fulfillmentStatus: "UNFULFILLED",
  isCancelled: false,
  items: [],
  ...overrides,
});

// ─── updateFulfillmentStatus ───────────────────────────────────────────────────

describe("updateFulfillmentStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lanza error si el pedido no existe", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(null);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      updateFulfillmentStatus("no-existe", "PREPARING"),
    ).rejects.toThrow("Pedido no encontrado");
  });

  it("lanza error al mover a PREPARING si el pedido no está pagado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      updateFulfillmentStatus("order-1", "PREPARING"),
    ).rejects.toThrow("aún no ha sido pagado");
  });

  it("lanza error al mover a SHIPPED si el pedido no está pagado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(updateFulfillmentStatus("order-1", "SHIPPED")).rejects.toThrow(
      "aún no ha sido pagado",
    );
  });

  it("lanza error al mover a DELIVERED si el pedido no está pagado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      updateFulfillmentStatus("order-1", "DELIVERED"),
    ).rejects.toThrow("aún no ha sido pagado");
  });

  it("actualiza el fulfillmentStatus del pedido", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await updateFulfillmentStatus("order-1", "SHIPPED");

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: expect.objectContaining({ fulfillmentStatus: "SHIPPED" }),
      }),
    );
  });

  it("establece deliveredAt cuando el nuevo estado es DELIVERED", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await updateFulfillmentStatus("order-1", "DELIVERED");

    const updateData = tx.order.update.mock.calls[0][0].data;
    expect(updateData.deliveredAt).toBeInstanceOf(Date);
  });

  it("no establece deliveredAt para estados distintos de DELIVERED", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await updateFulfillmentStatus("order-1", "SHIPPED");

    const updateData = tx.order.update.mock.calls[0][0].data;
    expect(updateData.deliveredAt).toBeUndefined();
  });

  it("permite READY_FOR_PICKUP sin validar pago", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(
      updateFulfillmentStatus("order-1", "READY_FOR_PICKUP"),
    ).resolves.not.toThrow();
  });

  it("crea un evento de historial con el actor correcto", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await updateFulfillmentStatus("order-1", "SHIPPED", "admin");

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-1",
          type: "STATUS_CHANGE",
          actor: "admin",
        }),
      }),
    );
  });
});

// ─── cancelOrder ───────────────────────────────────────────────────────────────

describe("cancelOrder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lanza error si el pedido no existe", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(null);
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("no-existe")).rejects.toThrow(
      "Pedido no encontrado",
    );
  });

  it("lanza error si el pedido ya está cancelado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makePendingOrder({ isCancelled: true }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("order-1")).rejects.toThrow("ya está cancelado");
  });

  it("lanza error si el actor es user y el pedido ya está pagado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("order-1", undefined, "user")).rejects.toThrow(
      "No puedes cancelar un pedido pagado",
    );
  });

  it("lanza error si el pedido ya ha sido enviado", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makePaidOrder({ fulfillmentStatus: "SHIPPED" }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("order-1")).rejects.toThrow("ya ha sido enviado");
  });

  it("lanza error si userId no coincide con el propietario del pedido", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makePendingOrder({ userId: "otro-user" }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("order-1", "user-actual")).rejects.toThrow(
      "No autorizado",
    );
  });

  it("devuelve el stock de los items al cancelar", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makePendingOrder({
        items: [{ variantId: "v1", quantity: 3 }],
      }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await cancelOrder("order-1");

    expect(tx.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "v1" },
        data: { stock: { increment: 3 } },
      }),
    );
  });

  it("establece paymentStatus a FAILED cuando el pedido está PENDING", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await cancelOrder("order-1");

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isCancelled: true,
          paymentStatus: "FAILED",
        }),
      }),
    );
  });

  it("establece paymentStatus a REFUNDED cuando admin cancela un pedido PAID", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await cancelOrder("order-1", undefined, "admin");

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isCancelled: true,
          paymentStatus: "REFUNDED",
        }),
      }),
    );
  });

  it("registra historial con motivo CANCELLED_BY_USER para actor user", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePendingOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await cancelOrder("order-1", undefined, "user");

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: SYSTEM_MSGS.CANCELLED_BY_USER,
          actor: "user",
        }),
      }),
    );
  });

  it("registra historial con motivo CANCELLED_BY_ADMIN_REFUND si había pago", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(makePaidOrder());
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await cancelOrder("order-1", undefined, "admin");

    expect(tx.orderHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: SYSTEM_MSGS.CANCELLED_BY_ADMIN_REFUND,
        }),
      }),
    );
  });

  it("no falla si algún item no tiene variantId", async () => {
    const tx = makeTxMock();
    tx.order.findUnique.mockResolvedValue(
      makePendingOrder({
        items: [{ variantId: null, quantity: 2 }],
      }),
    );
    mockTransaction.mockImplementation((fn: any) => fn(tx));

    await expect(cancelOrder("order-1")).resolves.not.toThrow();
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });
});
