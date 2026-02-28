import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { POST } from "@/app/api/auth/forgot-password/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────
// resend es import directo en forgot-password/route.ts
vi.mock("@/lib/email/client", () => ({
  resend: {
    emails: {
      send: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

vi.mock("@/lib/email/templates/ResetPasswordEmail", () => ({
  default: vi.fn(() => null),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid-token-123"),
}));

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockTokenDeleteMany = vi.mocked(prisma.passwordResetToken.deleteMany);
const mockTokenCreate = vi.mocked(prisma.passwordResetToken.create);

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  vi.clearAllMocks();
  mockTokenDeleteMany.mockResolvedValue({ count: 0 } as any);
  mockTokenCreate.mockResolvedValue({} as any);
  // Reseteamos el mock de send a éxito por defecto
  const { resend } = await import("@/lib/email/client");
  vi.mocked(resend.emails.send).mockResolvedValue({ error: null } as any);
});

describe("POST /api/auth/forgot-password", () => {
  it("devuelve 400 si no se proporciona email", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si email no es string", async () => {
    const res = await POST(makeRequest({ email: 123 }));
    expect(res.status).toBe(400);
  });

  it("devuelve success:false con reason email_not_found si el usuario no existe", async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ email: "noexiste@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(false);
    expect(body.reason).toBe("email_not_found");
  });

  it("borra tokens previos y crea uno nuevo para usuario existente", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "juan@example.com",
    } as any);

    await POST(makeRequest({ email: "juan@example.com" }));

    expect(mockTokenDeleteMany).toHaveBeenCalledWith({
      where: { email: "juan@example.com" },
    });
    expect(mockTokenCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "juan@example.com",
          token: "mock-uuid-token-123",
        }),
      }),
    );
  });

  it("devuelve success:true para usuario existente", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "user_1" } as any);

    const res = await POST(makeRequest({ email: "juan@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("normaliza el email a minúsculas antes de buscar", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "user_1" } as any);

    await POST(makeRequest({ email: "JUAN@EXAMPLE.COM" }));

    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: "juan@example.com" },
    });
  });

  it("devuelve 500 si el envío del email falla (resend devuelve error)", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "user_1" } as any);

    const { resend } = await import("@/lib/email/client");
    vi.mocked(resend.emails.send).mockResolvedValueOnce({
      error: { message: "Resend unavailable" },
    } as any);

    const res = await POST(makeRequest({ email: "juan@example.com" }));
    expect(res.status).toBe(500);
  });

  it("devuelve 500 si Prisma lanza un error", async () => {
    mockUserFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await POST(makeRequest({ email: "juan@example.com" }));
    expect(res.status).toBe(500);
  });
});
