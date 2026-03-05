import { headers } from "next/headers";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { POST } from "@/app/api/webhooks/stripe/route";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/email/client", () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({ id: "email_mock" }) } },
}));

vi.mock("@/lib/email/templates/OrderSuccessEmail", () => ({
  OrderSuccessEmail: vi.fn(() => null),
}));

vi.mock("@/lib/orders/utils", () => ({
  formatOrderForDisplay: vi.fn((order) => ({ ...order })),
}));

// ─── Env vars + Stripe: vi.hoisted() ─────────────────────────────────────────
const { mockConstructEvent, mockPaymentIntentsRetrieve } = vi.hoisted(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  process.env.STRIPE_SECRET_KEY = "sk_test_key";

  return {
    mockConstructEvent: vi.fn(),
    mockPaymentIntentsRetrieve: vi.fn(),
  };
});

vi.mock("stripe", () => ({
  // function keyword requerido — arrow functions no son constructores válidos
  default: vi.fn().mockImplementation(function () {
    return {
      webhooks: { constructEvent: mockConstructEvent },
      paymentIntents: { retrieve: mockPaymentIntentsRetrieve },
    };
  }),
}));

const mockHeaders = vi.mocked(headers);
const mockOrderFindUnique = vi.mocked(prisma.order.findUnique);
const mockOrderUpdate = vi.mocked(prisma.order.update);
const mockOrderHistoryCreate = vi.mocked(prisma.orderHistory.create);
const mockTransaction = vi.mocked(prisma.$transaction);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeHeadersList(sig: string | null = "valid-signature") {
  return {
    get: vi.fn((key: string) => (key === "stripe-signature" ? sig : null)),
  };
}

function makeRequest(body = "{}") {
  return { text: vi.fn().mockResolvedValue(body) } as unknown as Request;
}

function makePaymentIntentEvent(
  type: string,
  orderId: string | null,
  extra: Record<string, any> = {},
) {
  return {
    type,
    data: {
      object: {
        id: "pi_test_123",
        metadata: { orderId },
        last_payment_error: null,
        ...extra,
      },
    },
  };
}

const mockOrder = {
  id: "order_1",
  email: "juan@test.com",
  totalMinor: 3999,
  items: [{ id: "item_1", quantity: 1, product: { images: [] } }],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHeaders.mockResolvedValue(makeHeadersList() as any);

  mockTransaction.mockImplementation(async (fn: any) => {
    const tx = {
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    return fn(tx);
  });
});

// ─── Validación de firma ──────────────────────────────────────────────────────
describe("POST /api/webhooks/stripe — validación de firma", () => {
  it("devuelve 400 si no hay stripe-signature", async () => {
    mockHeaders.mockResolvedValue({ get: vi.fn(() => null) } as any);

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si constructEvent lanza (firma inválida)", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });
});

// ─── payment_intent.succeeded ─────────────────────────────────────────────────
describe("POST /api/webhooks/stripe — payment_intent.succeeded", () => {
  beforeEach(() => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.succeeded", "order_1"),
    );
    mockPaymentIntentsRetrieve.mockResolvedValue({
      payment_method: { card: { brand: "visa", last4: "4242" } },
    });
    mockOrderFindUnique.mockResolvedValue(mockOrder as any);
  });

  it("devuelve 200 con received:true", async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("busca el pedido por orderId del metadata", async () => {
    await POST(makeRequest());

    expect(mockOrderFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order_1" } }),
    );
  });

  it("ejecuta $transaction una vez para actualizar pedido e historial", async () => {
    await POST(makeRequest());
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("formatea el método de pago con brand capitalizado y last4", async () => {
    const txMock = {
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await POST(makeRequest());

    expect(txMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: "PAID",
          fulfillmentStatus: "PREPARING",
          paymentMethod: "Visa •••• 4242",
        }),
      }),
    );
  });

  it("usa 'Tarjeta de Crédito' como fallback si no hay datos de tarjeta", async () => {
    mockPaymentIntentsRetrieve.mockResolvedValue({ payment_method: null });

    const txMock = {
      order: { update: vi.fn().mockResolvedValue({}) },
      orderHistory: { create: vi.fn().mockResolvedValue({}) },
    };
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await POST(makeRequest());

    expect(txMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentMethod: "Tarjeta de Crédito" }),
      }),
    );
  });

  it("no llama a findUnique si el metadata no tiene orderId", async () => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.succeeded", null),
    );

    await POST(makeRequest());
    expect(mockOrderFindUnique).not.toHaveBeenCalled();
  });

  it("devuelve 200 aunque el pedido no exista en BD", async () => {
    mockOrderFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it("devuelve 200 aunque falle el retrieve del PaymentIntent (fallback)", async () => {
    mockPaymentIntentsRetrieve.mockRejectedValue(new Error("Stripe error"));

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });
});

// ─── payment_intent.payment_failed ────────────────────────────────────────────
describe("POST /api/webhooks/stripe — payment_intent.payment_failed", () => {
  beforeEach(() => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.payment_failed", "order_1", {
        last_payment_error: { message: "Fondos insuficientes" },
      }),
    );
    mockOrderUpdate.mockResolvedValue({} as any);
    mockOrderHistoryCreate.mockResolvedValue({} as any);
  });

  it("devuelve 200 con received:true", async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("actualiza el pedido a paymentStatus FAILED", async () => {
    await POST(makeRequest());

    expect(mockOrderUpdate).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { paymentStatus: "FAILED" },
    });
  });

  it("crea historial con el mensaje del error de pago", async () => {
    await POST(makeRequest());

    expect(mockOrderHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order_1",
          snapshotStatus: "Pago Fallido",
          reason: expect.stringContaining("Fondos insuficientes"),
        }),
      }),
    );
  });

  it("usa mensaje genérico si last_payment_error es null", async () => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.payment_failed", "order_1", {
        last_payment_error: null,
      }),
    );

    await POST(makeRequest());

    expect(mockOrderHistoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: expect.stringContaining("rechazada por el banco"),
        }),
      }),
    );
  });

  it("no hace nada si no hay orderId en metadata", async () => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.payment_failed", null),
    );

    await POST(makeRequest());

    expect(mockOrderUpdate).not.toHaveBeenCalled();
    expect(mockOrderHistoryCreate).not.toHaveBeenCalled();
  });
});

// ─── Otros casos ──────────────────────────────────────────────────────────────
describe("POST /api/webhooks/stripe — otros casos", () => {
  it("devuelve 200 para eventos no manejados", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it("devuelve 500 si Prisma lanza durante el procesamiento", async () => {
    mockConstructEvent.mockReturnValue(
      makePaymentIntentEvent("payment_intent.payment_failed", "order_1"),
    );
    mockOrderUpdate.mockRejectedValue(new Error("DB error"));

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });
});
