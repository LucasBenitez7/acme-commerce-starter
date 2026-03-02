import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resend } from "@/lib/email/client";

import { updatePassword } from "@/app/(site)/(account)/account/security/actions";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("@/lib/email/client", () => ({
  resend: {
    emails: {
      send: vi.fn(() => Promise.resolve({ id: "email_mock" })),
    },
  },
}));

vi.mock("@/lib/email/templates/PasswordChangedEmail", () => ({
  PasswordChangedEmail: vi.fn(() => null),
}));

const mockAuth = vi.mocked(auth);
const mockCompare = vi.mocked(compare);
const mockHash = vi.mocked(hash);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserUpdate = vi.mocked(prisma.user.update);
const mockRevalidatePath = vi.mocked(revalidatePath);

const validData = {
  currentPassword: "OldPass1",
  newPassword: "NewPass1",
  confirmNewPassword: "NewPass1",
};

const mockUser = {
  id: "user_1",
  email: "juan@test.com",
  passwordHash: "hashed_old_password",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updatePassword", () => {
  it("devuelve error No autorizado si no hay sesión", async () => {
    mockAuth.mockResolvedValue(null as any);

    const result = await updatePassword(validData);
    expect(result).toEqual({ success: false, error: "No autorizado" });
  });

  it("devuelve error No autorizado si no hay email en sesión", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as any);

    const result = await updatePassword(validData);
    expect(result).toEqual({ success: false, error: "No autorizado" });
  });

  it("devuelve error de validación si los datos no son válidos", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);

    const result = await updatePassword({
      currentPassword: "",
      newPassword: "short",
      confirmNewPassword: "short",
    });

    expect(result).toEqual({ success: false, error: "Datos inválidos" });
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("devuelve error si el usuario no existe en BD", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(null);

    const result = await updatePassword(validData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("no encontrado");
  });

  it("devuelve error si el usuario no tiene passwordHash (cuenta OAuth)", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue({
      ...mockUser,
      passwordHash: null,
    } as any);

    const result = await updatePassword(validData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("incorrectamente");
  });

  it("devuelve error si la contraseña actual es incorrecta", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    mockCompare.mockResolvedValue(false as any);

    const result = await updatePassword(validData);

    expect(result).toEqual({
      success: false,
      error: "La contraseña actual es incorrecta",
    });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("actualiza la contraseña y devuelve success:true", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    mockCompare.mockResolvedValue(true as any);
    mockHash.mockResolvedValue("new_hashed_password" as any);
    mockUserUpdate.mockResolvedValue({} as any);

    const result = await updatePassword(validData);

    expect(result).toEqual({ success: true });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { passwordHash: "new_hashed_password" },
    });
  });

  it("hashea la nueva contraseña con coste 10", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    mockCompare.mockResolvedValue(true as any);
    mockHash.mockResolvedValue("hashed" as any);
    mockUserUpdate.mockResolvedValue({} as any);

    await updatePassword(validData);

    expect(mockHash).toHaveBeenCalledWith(validData.newPassword, 10);
  });

  it("llama a revalidatePath tras actualizar", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    mockCompare.mockResolvedValue(true as any);
    mockHash.mockResolvedValue("hashed" as any);
    mockUserUpdate.mockResolvedValue({} as any);

    await updatePassword(validData);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/account");
  });

  it("devuelve success:true aunque falle el email de notificación", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    mockCompare.mockResolvedValue(true as any);
    mockHash.mockResolvedValue("hashed" as any);
    mockUserUpdate.mockResolvedValue({} as any);
    vi.mocked(resend.emails.send).mockRejectedValueOnce(
      new Error("Email error"),
    );

    const result = await updatePassword(validData);

    // El email es best-effort — el resultado debe ser success igual
    expect(result).toEqual({ success: true });
  });

  it("devuelve error genérico si Prisma lanza una excepción", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockUserFindUnique.mockRejectedValue(new Error("DB error"));

    const result = await updatePassword(validData);

    expect(result).toEqual({
      success: false,
      error: "Error interno del servidor",
    });
  });
});
