import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/orders/service", () => ({
  updateFulfillmentStatus: vi.fn(),
  rejectOrderReturnRequest: vi.fn(),
  processOrderReturn: vi.fn(),
  cancelOrder: vi.fn(),
}));

import { auth } from "@/lib/auth";
import {
  updateFulfillmentStatus,
  rejectOrderReturnRequest,
  processOrderReturn,
  cancelOrder,
} from "@/lib/orders/service";

import {
  updateFulfillmentStatusAction,
  cancelOrderAdminAction,
  rejectReturnAction,
  processPartialReturnAction,
} from "@/app/(admin)/admin/orders/actions";

const mockAuth = vi.mocked(auth);
const mockUpdateFulfillment = vi.mocked(updateFulfillmentStatus);
const mockRejectReturn = vi.mocked(rejectOrderReturnRequest);
const mockProcessReturn = vi.mocked(processOrderReturn);
const mockCancelOrder = vi.mocked(cancelOrder);
const mockRevalidatePath = vi.mocked(revalidatePath);

function asAdmin() {
  mockAuth.mockResolvedValue({ user: { role: "admin" } } as any);
}

function asUser() {
  mockAuth.mockResolvedValue({ user: { role: "user" } } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── updateFulfillmentStatusAction ───────────────────────────────────────────
describe("updateFulfillmentStatusAction", () => {
  it("devuelve error No autorizado si no es admin", async () => {
    asUser();
    const result = await updateFulfillmentStatusAction("order_1", "SHIPPED");
    expect(result).toEqual({ error: "No autorizado" });
    expect(mockUpdateFulfillment).not.toHaveBeenCalled();
  });

  it("actualiza el estado de fulfillment y devuelve success:true", async () => {
    asAdmin();
    mockUpdateFulfillment.mockResolvedValue(undefined as any);

    const result = await updateFulfillmentStatusAction("order_1", "SHIPPED");

    expect(result).toEqual({ success: true });
    expect(mockUpdateFulfillment).toHaveBeenCalledWith(
      "order_1",
      "SHIPPED",
      "admin",
    );
  });

  it("llama a revalidatePath para la lista y el detalle", async () => {
    asAdmin();
    mockUpdateFulfillment.mockResolvedValue(undefined as any);

    await updateFulfillmentStatusAction("order_1", "DELIVERED");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders/order_1");
  });

  it("devuelve el mensaje de error si el servicio lanza", async () => {
    asAdmin();
    mockUpdateFulfillment.mockRejectedValue(new Error("Transición inválida"));

    const result = await updateFulfillmentStatusAction("order_1", "SHIPPED");
    expect(result).toEqual({ error: "Transición inválida" });
  });

  it("devuelve error genérico si el error no tiene mensaje", async () => {
    asAdmin();
    mockUpdateFulfillment.mockRejectedValue(new Error());

    const result = await updateFulfillmentStatusAction("order_1", "SHIPPED");
    expect(result).toHaveProperty("error", "Error al actualizar envío");
  });
});

// ─── cancelOrderAdminAction ───────────────────────────────────────────────────
describe("cancelOrderAdminAction", () => {
  it("devuelve error No autorizado si no es admin", async () => {
    asUser();
    const result = await cancelOrderAdminAction("order_1");
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("cancela el pedido pasando undefined como userId y 'admin' como actor", async () => {
    asAdmin();
    mockCancelOrder.mockResolvedValue(undefined as any);

    const result = await cancelOrderAdminAction("order_1");

    expect(result).toEqual({ success: true });
    expect(mockCancelOrder).toHaveBeenCalledWith("order_1", undefined, "admin");
  });

  it("llama a revalidatePath del detalle del pedido", async () => {
    asAdmin();
    mockCancelOrder.mockResolvedValue(undefined as any);

    await cancelOrderAdminAction("order_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders/order_1");
  });

  it("devuelve el mensaje de error si cancelOrder lanza", async () => {
    asAdmin();
    mockCancelOrder.mockRejectedValue(
      new Error("No se puede cancelar un pedido entregado"),
    );

    const result = await cancelOrderAdminAction("order_1");
    expect(result).toEqual({
      error: "No se puede cancelar un pedido entregado",
    });
  });
});

// ─── rejectReturnAction ───────────────────────────────────────────────────────
describe("rejectReturnAction", () => {
  it("devuelve error No autorizado si no es admin", async () => {
    asUser();
    const result = await rejectReturnAction("order_1", "Motivo válido");
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("devuelve error si el motivo está vacío", async () => {
    asAdmin();
    const result = await rejectReturnAction("order_1", "");
    expect(result).toEqual({ error: "Motivo requerido" });
    expect(mockRejectReturn).not.toHaveBeenCalled();
  });

  it("devuelve error si el motivo tiene menos de 3 caracteres", async () => {
    asAdmin();
    const result = await rejectReturnAction("order_1", "AB");
    expect(result).toEqual({ error: "Motivo requerido" });
  });

  it("rechaza la devolución y devuelve success:true", async () => {
    asAdmin();
    mockRejectReturn.mockResolvedValue(undefined as any);

    const result = await rejectReturnAction(
      "order_1",
      "Producto en buen estado",
    );

    expect(result).toEqual({ success: true });
    expect(mockRejectReturn).toHaveBeenCalledWith(
      "order_1",
      "Producto en buen estado",
      "admin",
    );
  });

  it("llama a revalidatePath del detalle e historial", async () => {
    asAdmin();
    mockRejectReturn.mockResolvedValue(undefined as any);

    await rejectReturnAction("order_1", "Motivo válido");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders/order_1");
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/admin/orders/order_1/history",
    );
  });

  it("devuelve error genérico (no el mensaje del error) si el servicio lanza", async () => {
    asAdmin();
    mockRejectReturn.mockRejectedValue(new Error("Error interno detallado"));

    const result = await rejectReturnAction("order_1", "Motivo válido");
    // El código fuente devuelve mensaje fijo, no el del error
    expect(result).toEqual({ error: "Error al rechazar solicitud" });
  });
});

// ─── processPartialReturnAction ───────────────────────────────────────────────
describe("processPartialReturnAction", () => {
  const validItems = [{ itemId: "item_1", qtyToReturn: 1 }];

  it("devuelve error No autorizado si no es admin", async () => {
    asUser();
    const result = await processPartialReturnAction("order_1", validItems);
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("procesa la devolución y devuelve success:true", async () => {
    asAdmin();
    mockProcessReturn.mockResolvedValue(undefined as any);

    const result = await processPartialReturnAction("order_1", validItems);

    expect(result).toEqual({ success: true });
    expect(mockProcessReturn).toHaveBeenCalledWith(
      "order_1",
      validItems,
      undefined,
      "admin",
    );
  });

  it("pasa rejectionNote al servicio cuando se proporciona", async () => {
    asAdmin();
    mockProcessReturn.mockResolvedValue(undefined as any);

    await processPartialReturnAction("order_1", validItems, "Nota de rechazo");

    expect(mockProcessReturn).toHaveBeenCalledWith(
      "order_1",
      validItems,
      "Nota de rechazo",
      "admin",
    );
  });

  it("llama a revalidatePath del detalle e historial", async () => {
    asAdmin();
    mockProcessReturn.mockResolvedValue(undefined as any);

    await processPartialReturnAction("order_1", validItems);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/orders/order_1");
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/admin/orders/order_1/history",
    );
  });

  it("devuelve el mensaje de error si processOrderReturn lanza", async () => {
    asAdmin();
    mockProcessReturn.mockRejectedValue(new Error("Stock insuficiente"));

    const result = await processPartialReturnAction("order_1", validItems);
    expect(result).toEqual({ error: "Stock insuficiente" });
  });
});
