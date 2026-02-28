import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { registerAction } from "@/app/(auth)/auth/register/actions";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("bcryptjs", () => ({
  hash: vi.fn(() => Promise.resolve("hashed_password_mock")),
}));

vi.mock("@/lib/email/client", () => ({
  resend: {
    emails: {
      send: vi.fn(() => Promise.resolve({ id: "email_mock_id" })),
    },
  },
}));

vi.mock("@/lib/email/templates/WelcomeEmail", () => ({
  WelcomeEmail: vi.fn(() => null),
}));

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserCreate = vi.mocked(prisma.user.create);

// ─── Helper para construir FormData ──────────────────────────────────────────
function makeFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const defaults = {
    firstName: "Juan",
    lastName: "García",
    phone: "612345678",
    email: "juan@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    ...overrides,
  };
  Object.entries(defaults).forEach(([k, v]) => formData.append(k, v));
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerAction", () => {
  describe("validación Zod", () => {
    it("devuelve validation_error si el email es inválido", async () => {
      const result = await registerAction(
        makeFormData({ email: "notanemail" }),
      );
      expect(result).toEqual({ error: "validation_error" });
    });

    it("devuelve validation_error si las contraseñas no coinciden", async () => {
      const result = await registerAction(
        makeFormData({ confirmPassword: "OtherPass1" }),
      );
      expect(result).toEqual({ error: "validation_error" });
    });

    it("devuelve validation_error si el formData está vacío", async () => {
      const result = await registerAction(new FormData());
      expect(result).toEqual({ error: "validation_error" });
    });

    it("devuelve validation_error si el firstName es muy corto", async () => {
      const result = await registerAction(makeFormData({ firstName: "A" }));
      expect(result).toEqual({ error: "validation_error" });
    });
  });

  it("devuelve exists si el email ya está registrado", async () => {
    mockUserFindUnique.mockResolvedValue({ id: "existing_user" } as any);

    const result = await registerAction(makeFormData());
    expect(result).toEqual({ error: "exists" });
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

  it("devuelve success:true con datos válidos", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    const result = await registerAction(makeFormData());
    expect(result).toEqual({ success: true });
  });

  it("guarda el email en minúsculas", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    await registerAction(makeFormData({ email: "JUAN@EXAMPLE.COM" }));

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "juan@example.com" }),
      }),
    );
  });

  it("hashea la contraseña antes de guardarla", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    await registerAction(makeFormData());

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: "hashed_password_mock" }),
      }),
    );
  });

  it("guarda el nombre completo (firstName + lastName) en name", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    await registerAction(
      makeFormData({ firstName: "Juan", lastName: "García" }),
    );

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Juan García" }),
      }),
    );
  });

  it("asigna role:user por defecto", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    await registerAction(makeFormData());

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "user" }),
      }),
    );
  });

  it("devuelve success:true aunque falle el email de bienvenida (email en try/catch interno)", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue({ id: "new_user" } as any);

    const { resend } = await import("@/lib/email/client");
    vi.mocked(resend.emails.send).mockRejectedValueOnce(
      new Error("Email service unavailable"),
    );

    const result = await registerAction(makeFormData());
    // El registro es exitoso aunque el email falle
    expect(result).toEqual({ success: true });
  });

  it("devuelve unknown si Prisma lanza un error al crear el usuario", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockRejectedValue(new Error("DB error"));

    const result = await registerAction(makeFormData());
    expect(result).toEqual({ error: "unknown" });
  });
});
