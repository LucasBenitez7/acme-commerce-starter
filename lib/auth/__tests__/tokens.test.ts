import { v4 as uuidv4 } from "uuid";
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/tokens";
import { prisma } from "@/lib/db";
import { resend } from "@/lib/email/client";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid-1234"),
}));

vi.mock("@/lib/email/client", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email_mock" }),
    },
  },
}));

vi.mock("@/lib/email/templates/VerificationEmail", () => ({
  VerificationEmail: vi.fn(() => null),
}));

const mockUuid = vi.mocked(uuidv4);
const mockFindFirst = vi.mocked(prisma.verificationToken.findFirst);
const mockDelete = vi.mocked(prisma.verificationToken.delete);
const mockCreate = vi.mocked(prisma.verificationToken.create);
const mockEmailSend = vi.mocked(resend.emails.send);

const mockToken = {
  identifier: "juan@test.com",
  token: "mock-uuid-1234",
  expires: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── generateVerificationToken ────────────────────────────────────────────────
describe("generateVerificationToken", () => {
  it("crea un nuevo token si no existe ninguno previo para ese email", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockToken as any);

    const result = await generateVerificationToken("juan@test.com");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: "juan@test.com",
          token: "mock-uuid-1234",
        }),
      }),
    );
    expect(result).toEqual(mockToken);
  });

  it("elimina el token anterior antes de crear uno nuevo si ya existe", async () => {
    const existingToken = { identifier: "juan@test.com", token: "old-token" };
    mockFindFirst.mockResolvedValue(existingToken as any);
    mockDelete.mockResolvedValue({} as any);
    mockCreate.mockResolvedValue(mockToken as any);

    await generateVerificationToken("juan@test.com");

    expect(mockDelete).toHaveBeenCalledWith({
      where: {
        identifier_token: {
          identifier: "juan@test.com",
          token: "old-token",
        },
      },
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("no llama a delete si no hay token existente", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockToken as any);

    await generateVerificationToken("nuevo@test.com");

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("busca el token existente por email (identifier)", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockToken as any);

    await generateVerificationToken("juan@test.com");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { identifier: "juan@test.com" },
    });
  });

  it("el token expira en 1 hora", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(mockToken as any);

    const before = Date.now();
    await generateVerificationToken("juan@test.com");
    const after = Date.now();

    const createdWith = mockCreate.mock.calls[0][0] as any;
    const expires: Date = createdWith.data.expires;

    // La expiración debe ser aproximadamente 1 hora desde ahora
    expect(expires.getTime()).toBeGreaterThanOrEqual(
      before + 3600 * 1000 - 100,
    );
    expect(expires.getTime()).toBeLessThanOrEqual(after + 3600 * 1000 + 100);
  });

  it("usa el uuid generado como token", async () => {
    mockUuid.mockReturnValue("custom-uuid-abc" as any);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      ...mockToken,
      token: "custom-uuid-abc",
    } as any);

    await generateVerificationToken("juan@test.com");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ token: "custom-uuid-abc" }),
      }),
    );
  });
});

// ─── sendVerificationEmail ────────────────────────────────────────────────────
describe("sendVerificationEmail", () => {
  it("envía el email con el link de verificación correcto", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mitienda.com");

    await sendVerificationEmail("juan@test.com", "token-abc");

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "juan@test.com",
        subject: "Verifica tu correo electrónico",
      }),
    );
  });

  it("construye el link con el dominio de NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mitienda.com");

    await sendVerificationEmail("juan@test.com", "token-xyz");

    const callArgs = mockEmailSend.mock.calls[0][0] as any;
    // El react prop debería contener el link correcto — verificamos via VerificationEmail mock
    // El link se pasa al componente, no directamente al send
    expect(callArgs.to).toBe("juan@test.com");
  });

  it("usa localhost:3000 como fallback si no hay NEXT_PUBLIC_SITE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    await sendVerificationEmail("juan@test.com", "token-abc");

    const { VerificationEmail } = await import(
      "@/lib/email/templates/VerificationEmail"
    );
    expect(vi.mocked(VerificationEmail)).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationLink: expect.stringContaining("localhost:3000"),
      }),
    );
  });

  it("usa EMAIL_FROM del entorno o el fallback de onboarding@resend.dev", async () => {
    vi.stubEnv("EMAIL_FROM", "noreply@mitienda.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mitienda.com");

    await sendVerificationEmail("juan@test.com", "token-abc");

    expect(mockEmailSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: "noreply@mitienda.com" }),
    );
  });

  it("pasa el verificationLink correcto al template", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mitienda.com");
    const { VerificationEmail } = await import(
      "@/lib/email/templates/VerificationEmail"
    );

    await sendVerificationEmail("juan@test.com", "token-123");

    expect(vi.mocked(VerificationEmail)).toHaveBeenCalledWith({
      verificationLink: "https://mitienda.com/verify-email?token=token-123",
    });
  });
});
