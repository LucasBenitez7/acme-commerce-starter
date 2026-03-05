import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import {
  requestGuestAccess,
  verifyGuestAccess,
  requestReturnGuestAction,
} from "@/lib/guest-access/actions";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCookieSet = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: mockCookieSet,
      get: mockCookieGet,
    }),
  ),
}));

const { mockRequestOrderReturn } = vi.hoisted(() => ({
  mockRequestOrderReturn: vi.fn(),
}));

vi.mock("@/lib/orders/service", () => ({
  requestOrderReturn: mockRequestOrderReturn,
}));

vi.mock("@/lib/email/templates/GuestAccessEmail", () => ({
  GuestAccessEmail: vi.fn(() => "<div>email</div>"),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return {
      emails: { send: vi.fn(() => Promise.resolve({ id: "mock-email-id" })) },
    };
  }),
}));

const mockOrder = {
  id: "order-1",
  email: "lucas@test.com",
  guestAccessCode: "123456",
  guestAccessCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min futuro
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── requestGuestAccess ───────────────────────────────────────────────────────

describe("requestGuestAccess", () => {
  it("devuelve error si faltan orderId o email", async () => {
    const result = await requestGuestAccess("", "");
    expect(result.error).toBeDefined();
  });

  it("devuelve error si el pedido no existe", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const result = await requestGuestAccess("order-1", "lucas@test.com");

    expect(result.error).toMatch(/no encontramos/i);
  });

  it("devuelve error si el email no coincide con el pedido", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

    const result = await requestGuestAccess("order-1", "otro@test.com");

    expect(result.error).toMatch(/no encontramos/i);
  });

  it("devuelve success y guarda el OTP si todo es correcto", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
    vi.mocked(prisma.order.update).mockResolvedValue(mockOrder as any);

    const result = await requestGuestAccess("order-1", "lucas@test.com");

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: expect.objectContaining({
          guestAccessCode: expect.any(String),
          guestAccessCodeExpiry: expect.any(Date),
        }),
      }),
    );
    expect(result.success).toBe(true);
  });
});

// ─── verifyGuestAccess ────────────────────────────────────────────────────────

describe("verifyGuestAccess", () => {
  it("devuelve error si faltan datos", async () => {
    const result = await verifyGuestAccess("", "", "");
    expect(result.error).toBeDefined();
  });

  it("devuelve error si el pedido no existe", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const result = await verifyGuestAccess(
      "order-1",
      "lucas@test.com",
      "123456",
    );

    expect(result.error).toMatch(/datos incorrectos/i);
  });

  it("devuelve error si el código no coincide", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...mockOrder,
      guestAccessCode: "999999",
    } as any);

    const result = await verifyGuestAccess(
      "order-1",
      "lucas@test.com",
      "123456",
    );

    expect(result.error).toMatch(/inválido/i);
  });

  it("devuelve error si el código ha expirado", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      ...mockOrder,
      guestAccessCodeExpiry: new Date(Date.now() - 1000), // pasado
    } as any);

    const result = await verifyGuestAccess(
      "order-1",
      "lucas@test.com",
      "123456",
    );

    expect(result.error).toMatch(/inválido/i);
  });

  it("crea la cookie y limpia el código si el código es válido", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
    vi.mocked(prisma.order.update).mockResolvedValue(mockOrder as any);

    const result = await verifyGuestAccess(
      "order-1",
      "lucas@test.com",
      "123456",
    );

    expect(mockCookieSet).toHaveBeenCalledWith(
      "guest_access_order-1",
      "true",
      expect.any(Object),
    );
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { guestAccessCode: null, guestAccessCodeExpiry: null },
      }),
    );
    expect(result.success).toBe(true);
  });
});

// ─── requestReturnGuestAction ─────────────────────────────────────────────────

describe("requestReturnGuestAction", () => {
  it("devuelve error si no hay cookie de acceso", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const result = await requestReturnGuestAction("order-1", "Motivo válido", [
      { itemId: "item-1", qty: 1 },
    ]);

    expect(result.error).toMatch(/sesión/i);
  });

  it("devuelve error si el motivo es muy corto", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const result = await requestReturnGuestAction("order-1", "abc", [
      { itemId: "item-1", qty: 1 },
    ]);

    expect(result.error).toMatch(/motivo/i);
  });

  it("devuelve error si no hay items", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const result = await requestReturnGuestAction(
      "order-1",
      "Motivo suficientemente largo",
      [],
    );

    expect(result.error).toMatch(/producto/i);
  });

  it("llama a requestOrderReturn con userId null si todo es correcto", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });
    mockRequestOrderReturn.mockResolvedValue(undefined);

    const result = await requestReturnGuestAction(
      "order-1",
      "Motivo suficientemente largo",
      [{ itemId: "item-1", qty: 1 }],
    );

    expect(mockRequestOrderReturn).toHaveBeenCalledWith(
      "order-1",
      null,
      "Motivo suficientemente largo",
      [{ itemId: "item-1", qty: 1 }],
    );
    expect(result.success).toBe(true);
  });

  it("devuelve error si requestOrderReturn lanza una excepción", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });
    mockRequestOrderReturn.mockRejectedValue(new Error("Fallo interno"));

    const result = await requestReturnGuestAction(
      "order-1",
      "Motivo suficientemente largo",
      [{ itemId: "item-1", qty: 1 }],
    );

    expect(result.error).toBe("Fallo interno");
  });
});
