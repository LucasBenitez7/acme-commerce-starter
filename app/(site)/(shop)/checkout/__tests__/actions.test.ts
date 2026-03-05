import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks con vi.hoisted ──────────────────────────────────────────────────────
const {
  mockCreateOrder,
  mockUpdateOrderAddress,
  mockPaymentIntentsCreate,
  mockPaymentIntentsRetrieve,
} = vi.hoisted(() => ({
  mockCreateOrder: vi.fn(),
  mockUpdateOrderAddress: vi.fn(),
  mockPaymentIntentsCreate: vi.fn(),
  mockPaymentIntentsRetrieve: vi.fn(),
}));

vi.mock("@/lib/orders/service", () => ({
  createOrder: mockCreateOrder,
  updateOrderAddress: mockUpdateOrderAddress,
}));

vi.mock("stripe", () => ({
  default: vi.fn(function StripeMock() {
    return {
      paymentIntents: {
        create: mockPaymentIntentsCreate,
        retrieve: mockPaymentIntentsRetrieve,
        update: vi.fn(),
      },
      refunds: { create: vi.fn() },
      webhooks: { constructEvent: vi.fn() },
    };
  }),
}));

import { createOrderAction } from "@/app/(site)/(shop)/checkout/actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.append("shippingType", "home");
  fd.append("firstName", "Lucas");
  fd.append("lastName", "García");
  fd.append("email", "lucas@test.com");
  fd.append("phone", "600000000");
  fd.append("street", "Calle Mayor 1");
  fd.append("postalCode", "28001");
  fd.append("city", "Madrid");
  fd.append("province", "Madrid");
  fd.append("country", "España");
  fd.append("details", "");
  fd.append("paymentMethod", "card");
  fd.append(
    "cartItems",
    JSON.stringify([
      { productId: "p1", variantId: "v1", quantity: 1, priceCents: 1999 },
    ]),
  );
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

const mockOrder = {
  id: "order-123",
  totalMinor: 1999,
  stripePaymentIntentId: null,
};

// ─── createOrderAction ────────────────────────────────────────────────────────
describe("createOrderAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve error si el schema de validación falla", async () => {
    const fd = makeFormData({ email: "no-es-un-email" });
    const result = await createOrderAction({ error: undefined }, fd);
    expect(result.error).toBeDefined();
    expect(result.success).toBeUndefined();
  });

  it("devuelve error si cartItems está vacío", async () => {
    const fd = makeFormData({ cartItems: "[]" });
    const result = await createOrderAction({ error: undefined }, fd);
    expect(result.error).toBeDefined();
  });

  it("crea una orden nueva cuando no hay existingOrderId", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test",
      client_secret: "secret_test",
    });

    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );

    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrderAddress).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.orderId).toBe("order-123");
    expect(result.clientSecret).toBe("secret_test");
    expect(result.isStripe).toBe(true);
  });

  it("actualiza la orden existente cuando se pasa existingOrderId", async () => {
    mockUpdateOrderAddress.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test",
      client_secret: "secret_test",
    });

    const fd = makeFormData();
    fd.append("existingOrderId", "order-123");

    const result = await createOrderAction({ error: undefined }, fd);

    expect(mockUpdateOrderAddress).toHaveBeenCalledTimes(1);
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("reutiliza el PaymentIntent existente si la orden ya tiene uno", async () => {
    const orderWithIntent = {
      ...mockOrder,
      stripePaymentIntentId: "pi_existing",
    };
    mockCreateOrder.mockResolvedValue(orderWithIntent);
    mockPaymentIntentsRetrieve.mockResolvedValue({
      client_secret: "secret_existing",
    });

    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );

    expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith("pi_existing");
    expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    expect(result.clientSecret).toBe("secret_existing");
  });

  it("crea un nuevo PaymentIntent cuando la orden no tiene uno", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_new",
      client_secret: "secret_new",
    });

    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );

    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: mockOrder.totalMinor,
        currency: "EUR",
      }),
    );
    expect(result.clientSecret).toBe("secret_new");
  });

  it("devuelve error si createOrder devuelve una orden sin id", async () => {
    mockCreateOrder.mockResolvedValue({ id: null });
    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );
    expect(result.error).toBe("Error al procesar el pedido.");
  });

  it("devuelve error si createOrder lanza una excepción", async () => {
    mockCreateOrder.mockRejectedValue(new Error("DB error"));
    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );
    expect(result.error).toBeDefined();
  });

  it("devuelve error si Stripe lanza una excepción al crear el PaymentIntent", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockRejectedValue(new Error("Stripe error"));
    const result = await createOrderAction(
      { error: undefined },
      makeFormData(),
    );
    expect(result.error).toBeDefined();
  });

  it("convierte 'true'/'false' de FormData a booleanos correctamente", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test",
      client_secret: "secret_test",
    });

    const fd = makeFormData({ isDefault: "true" });
    await createOrderAction({ error: undefined }, fd);

    const callArg = mockCreateOrder.mock.calls[0][0];
    expect(callArg.isDefault).toBe(true);
  });

  it("convierte strings vacíos a null correctamente", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test",
      client_secret: "secret_test",
    });

    const fd = makeFormData({ details: "" });
    await createOrderAction({ error: undefined }, fd);

    const callArg = mockCreateOrder.mock.calls[0][0];
    expect(callArg.details).toBeNull();
  });

  it("devuelve isStripe:false si el método de pago no es card", async () => {
    mockCreateOrder.mockResolvedValue(mockOrder);

    const fd = makeFormData({ paymentMethod: "transfer" });
    const result = await createOrderAction({ error: undefined }, fd);

    expect(result.isStripe).toBe(false);
    expect(result.clientSecret).toBeUndefined();
  });
});
