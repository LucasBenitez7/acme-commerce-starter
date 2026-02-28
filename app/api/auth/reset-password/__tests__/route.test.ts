import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { GET, POST } from "@/app/api/auth/reset-password/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("bcryptjs", () => ({
  hash: vi.fn(() => Promise.resolve("new_hashed_password")),
}));

const mockTokenFindUnique = vi.mocked(prisma.passwordResetToken.findUnique);
const mockTokenDelete = vi.mocked(prisma.passwordResetToken.delete);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockTransaction = vi.mocked(prisma.$transaction);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeGetRequest(token?: string): Request {
  const url = token
    ? `http://localhost/api/auth/reset-password?token=${token}`
    : "http://localhost/api/auth/reset-password";
  return new Request(url, { method: "GET" });
}

function makePostRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const futureDate = new Date(Date.now() + 3600 * 1000);
const pastDate = new Date(Date.now() - 3600 * 1000);

beforeEach(() => {
  vi.clearAllMocks();
  mockTokenDelete.mockResolvedValue({} as any);
  mockTransaction.mockResolvedValue([] as any);
});

// ─── GET /api/auth/reset-password ─────────────────────────────────────────────
describe("GET /api/auth/reset-password", () => {
  it("devuelve 400 y valid:false si no se proporciona token", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it("devuelve valid:false si el token no existe en BD", async () => {
    mockTokenFindUnique.mockResolvedValue(null);

    const res = await GET(makeGetRequest("token-inexistente"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.valid).toBe(false);
  });

  it("devuelve valid:true para token válido y no expirado", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "valid-token",
      email: "juan@example.com",
      expires: futureDate,
    } as any);

    const res = await GET(makeGetRequest("valid-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.valid).toBe(true);
  });

  it("devuelve valid:false y borra el token si ha expirado", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "expired-token",
      email: "juan@example.com",
      expires: pastDate,
    } as any);

    const res = await GET(makeGetRequest("expired-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.valid).toBe(false);
    expect(mockTokenDelete).toHaveBeenCalledWith({
      where: { token: "expired-token" },
    });
  });

  it("devuelve 500 y valid:false si Prisma lanza un error", async () => {
    mockTokenFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeGetRequest("some-token"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.valid).toBe(false);
  });
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
describe("POST /api/auth/reset-password", () => {
  it("devuelve 400 si no se proporciona token", async () => {
    const res = await POST(makePostRequest({ password: "NewPass1234" }));
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si la contraseña tiene menos de 8 caracteres", async () => {
    const res = await POST(
      makePostRequest({ token: "valid-token", password: "short" }),
    );
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si no se proporciona contraseña", async () => {
    const res = await POST(makePostRequest({ token: "valid-token" }));
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si el token no existe en BD", async () => {
    mockTokenFindUnique.mockResolvedValue(null);

    const res = await POST(
      makePostRequest({ token: "inexistente", password: "NewPass1234" }),
    );
    expect(res.status).toBe(400);
  });

  it("devuelve 400 y borra el token si ha expirado", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "expired-token",
      email: "juan@example.com",
      expires: pastDate,
    } as any);

    const res = await POST(
      makePostRequest({ token: "expired-token", password: "NewPass1234" }),
    );

    expect(res.status).toBe(400);
    expect(mockTokenDelete).toHaveBeenCalledWith({
      where: { token: "expired-token" },
    });
  });

  it("devuelve 400 si el usuario no existe", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "valid-token",
      email: "noexiste@example.com",
      expires: futureDate,
    } as any);
    mockUserFindUnique.mockResolvedValue(null);

    const res = await POST(
      makePostRequest({ token: "valid-token", password: "NewPass1234" }),
    );
    expect(res.status).toBe(400);
  });

  it("ejecuta $transaction con array [user.update, token.delete]", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "valid-token",
      email: "juan@example.com",
      expires: futureDate,
    } as any);
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "juan@example.com",
    } as any);

    await POST(
      makePostRequest({ token: "valid-token", password: "NewPass1234" }),
    );

    // Verifica que se llamó $transaction (con array, no función)
    expect(mockTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything(), expect.anything()]),
    );
  });

  it("devuelve success:true tras actualización correcta", async () => {
    mockTokenFindUnique.mockResolvedValue({
      token: "valid-token",
      email: "juan@example.com",
      expires: futureDate,
    } as any);
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "juan@example.com",
    } as any);

    const res = await POST(
      makePostRequest({ token: "valid-token", password: "NewPass1234" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("devuelve 500 si Prisma lanza un error", async () => {
    mockTokenFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await POST(
      makePostRequest({ token: "valid-token", password: "NewPass1234" }),
    );
    expect(res.status).toBe(500);
  });
});
