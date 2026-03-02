import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth/tokens", () => ({
  generateVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

import { auth } from "@/lib/auth";
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/tokens";

import { requestVerificationEmail } from "@/app/(site)/(account)/account/actions";

const mockAuth = vi.mocked(auth);
const mockGenerateToken = vi.mocked(generateVerificationToken);
const mockSendEmail = vi.mocked(sendVerificationEmail);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requestVerificationEmail", () => {
  it("devuelve error No autorizado si no hay sesión", async () => {
    mockAuth.mockResolvedValue(null as any);

    const result = await requestVerificationEmail();

    expect(result).toEqual({ success: false, error: "No autorizado" });
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });

  it("devuelve error No autorizado si no hay email en la sesión", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1" } } as any);

    const result = await requestVerificationEmail();

    expect(result).toEqual({ success: false, error: "No autorizado" });
  });

  it("genera token y envía email de verificación correctamente", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "juan@test.com" },
    } as any);
    mockGenerateToken.mockResolvedValue({
      identifier: "juan@test.com",
      token: "token_abc123",
    } as any);
    mockSendEmail.mockResolvedValue(undefined as any);

    const result = await requestVerificationEmail();

    expect(result).toEqual({ success: true });
    expect(mockGenerateToken).toHaveBeenCalledWith("juan@test.com");
    expect(mockSendEmail).toHaveBeenCalledWith("juan@test.com", "token_abc123");
  });

  it("devuelve error si generateVerificationToken lanza", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockGenerateToken.mockRejectedValue(new Error("Token error"));

    const result = await requestVerificationEmail();

    expect(result).toEqual({
      success: false,
      error: "Error al enviar el email",
    });
  });

  it("devuelve error si sendVerificationEmail lanza", async () => {
    mockAuth.mockResolvedValue({ user: { email: "juan@test.com" } } as any);
    mockGenerateToken.mockResolvedValue({
      identifier: "juan@test.com",
      token: "token_abc123",
    } as any);
    mockSendEmail.mockRejectedValue(new Error("Email send error"));

    const result = await requestVerificationEmail();

    expect(result).toEqual({
      success: false,
      error: "Error al enviar el email",
    });
  });
});
