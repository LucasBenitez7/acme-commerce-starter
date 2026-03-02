import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Stripe: vi.hoisted() ─────────────────────────────────────────────────────
const { mockPaymentIntentsCreate, mockPaymentIntentsRetrieve } = vi.hoisted(
  () => ({
    mockPaymentIntentsCreate: vi.fn(),
    mockPaymentIntentsRetrieve: vi.fn(),
  }),
);

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/orders/service", () => ({
  cancelOrder: vi.fn(),
  requestOrderReturn: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: vi.fn(function StripeMock() {
    return {
      paymentIntents: {
        create: mockPaymentIntentsCreate,
        retrieve: mockPaymentIntentsRetrieve,
      },
      refunds: { create: vi.fn() },
      webhooks: { constructEvent: vi.fn() },
    };
  }),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelOrder, requestOrderReturn } from "@/lib/orders/service";

import {
  cancelOrderUserAction,
  requestReturnUserAction,
  getPaymentIntentAction,
} from "@/app/(site)/(account)/account/orders/actions";

const mockAuth = vi.mocked(auth);
const mockCancelOrder = vi.mocked(cancelOrder);
const mockRequestReturn = vi.mocked(requestOrderReturn);
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique);
const mockOrderUpdate = vi.mocked(prisma.order.update);
const mockRevalidatePath = vi.mocked(revalidatePath);

function asLoggedIn(userId = "user_1") {
  mockAuth.mockResolvedValue({ user: { id: userId } } as any);
}

function asGuest() {
  mockAuth.mockResolvedValue(null as any);
}

const makeOrder = (overrides: Record<string, any> = {}) => ({
  id: "order_1",
  userId: "user_1",
  paymentStatus: "FAILED",
  totalMinor: 3999,
  currency: "EUR",
  stripePaymentIntentId: null,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── cancelOrderUserAction ────────────────────────────────────────────────────
describe("cancelOrderUserAction", () => {
  it("devuelve error si no hay sesión", async () => {
    asGuest();
    expect(await cancelOrderUserAction("order_1")).toEqual({
      error: "Debes iniciar sesión",
    });
  });

  it("cancela el pedido y devuelve success:true", async () => {
    asLoggedIn();
    mockCancelOrder.mockResolvedValue(undefined as any);

    const result = await cancelOrderUserAction("order_1");

    expect(result).toEqual({ success: true });
    expect(mockCancelOrder).toHaveBeenCalledWith("order_1", "user_1", "user");
  });

  it("llama a revalidatePath tras cancelar", async () => {
    asLoggedIn();
    mockCancelOrder.mockResolvedValue(undefined as any);

    await cancelOrderUserAction("order_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/orders");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/orders/order_1");
  });

  it("devuelve el mensaje de error si cancelOrder lanza", async () => {
    asLoggedIn();
    mockCancelOrder.mockRejectedValue(new Error("No se puede cancelar"));

    const result = await cancelOrderUserAction("order_1");
    expect(result).toEqual({ error: "No se puede cancelar" });
  });

  it("devuelve error genérico si el error no tiene mensaje", async () => {
    asLoggedIn();
    mockCancelOrder.mockRejectedValue(new Error());

    const result = await cancelOrderUserAction("order_1");
    expect(result).toHaveProperty("error");
  });
});

// ─── requestReturnUserAction ──────────────────────────────────────────────────
describe("requestReturnUserAction", () => {
  const validItems = [{ itemId: "item_1", qty: 1 }];

  it("devuelve error si no hay sesión", async () => {
    asGuest();
    expect(
      await requestReturnUserAction("order_1", "Motivo", validItems),
    ).toEqual({ error: "Debes iniciar sesión" });
  });

  it("devuelve error si el motivo tiene menos de 5 caracteres", async () => {
    asLoggedIn();
    const result = await requestReturnUserAction("order_1", "mal", validItems);
    expect(result.error).toContain("mínimo 5 caracteres");
  });

  it("devuelve error si no se pasan items", async () => {
    asLoggedIn();
    const result = await requestReturnUserAction(
      "order_1",
      "Motivo válido",
      [],
    );
    expect(result.error).toContain("al menos un producto");
  });

  it("solicita la devolución y devuelve success:true", async () => {
    asLoggedIn();
    mockRequestReturn.mockResolvedValue(undefined as any);

    const result = await requestReturnUserAction(
      "order_1",
      "Motivo válido detallado",
      validItems,
    );

    expect(result).toEqual({ success: true });
    expect(mockRequestReturn).toHaveBeenCalledWith(
      "order_1",
      "user_1",
      "Motivo válido detallado",
      validItems,
    );
  });

  it("llama a revalidatePath tras solicitar devolución", async () => {
    asLoggedIn();
    mockRequestReturn.mockResolvedValue(undefined as any);

    await requestReturnUserAction(
      "order_1",
      "Motivo válido detallado",
      validItems,
    );

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/orders/order_1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/account/orders");
  });

  it("devuelve el mensaje de error si requestOrderReturn lanza", async () => {
    asLoggedIn();
    mockRequestReturn.mockRejectedValue(new Error("Ya existe una solicitud"));

    const result = await requestReturnUserAction(
      "order_1",
      "Motivo válido",
      validItems,
    );
    expect(result).toEqual({ error: "Ya existe una solicitud" });
  });
});

// ─── getPaymentIntentAction ───────────────────────────────────────────────────
describe("getPaymentIntentAction", () => {
  it("devuelve error si no hay sesión", async () => {
    asGuest();
    expect(await getPaymentIntentAction("order_1")).toEqual({
      error: "Debes iniciar sesión",
    });
  });

  it("devuelve error si el pedido no existe", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(null);

    expect(await getPaymentIntentAction("order_1")).toEqual({
      error: "Pedido no encontrado.",
    });
  });

  it("devuelve error si el pedido ya está pagado", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(
      makeOrder({ paymentStatus: "PAID" }) as any,
    );

    expect(await getPaymentIntentAction("order_1")).toEqual({
      error: "El pedido ya está pagado.",
    });
  });

  it("crea un nuevo PaymentIntent si el pedido no tiene stripePaymentIntentId", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(makeOrder() as any);
    mockOrderUpdate.mockResolvedValue({} as any);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_new",
      client_secret: "cs_new_secret",
    });

    const result = await getPaymentIntentAction("order_1");

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("clientSecret", "cs_new_secret");
    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stripePaymentIntentId: "pi_new" } }),
    );
  });

  it("reutiliza el PaymentIntent existente si no está cancelado", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(
      makeOrder({ stripePaymentIntentId: "pi_existing" }) as any,
    );
    mockPaymentIntentsRetrieve.mockResolvedValue({
      id: "pi_existing",
      status: "requires_payment_method",
      client_secret: "cs_existing_secret",
    });

    const result = await getPaymentIntentAction("order_1");

    expect(result).toHaveProperty("clientSecret", "cs_existing_secret");
    expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
  });

  it("crea nuevo PaymentIntent si el existente está cancelado", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(
      makeOrder({ stripePaymentIntentId: "pi_cancelled" }) as any,
    );
    mockOrderUpdate.mockResolvedValue({} as any);
    mockPaymentIntentsRetrieve.mockResolvedValue({
      status: "canceled",
      client_secret: null,
    });
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_new",
      client_secret: "cs_after_cancel",
    });

    const result = await getPaymentIntentAction("order_1");

    expect(result).toHaveProperty("clientSecret", "cs_after_cancel");
    expect(mockPaymentIntentsCreate).toHaveBeenCalled();
  });

  it("devuelve error si Stripe lanza una excepción", async () => {
    asLoggedIn();
    mockOrderFindUnique.mockResolvedValue(makeOrder() as any);
    mockPaymentIntentsCreate.mockRejectedValue(new Error("Stripe unavailable"));

    const result = await getPaymentIntentAction("order_1");
    expect(result).toHaveProperty("error");
  });
});
