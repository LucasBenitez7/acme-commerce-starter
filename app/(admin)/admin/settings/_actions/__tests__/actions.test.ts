import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/settings/schema", () => ({
  storeConfigSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock("@/lib/settings/service", () => ({
  updateStoreConfig: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { storeConfigSchema } from "@/lib/settings/schema";
import { updateStoreConfig } from "@/lib/settings/service";

import { updateSettingsAction } from "@/app/(admin)/admin/settings/_actions/actions";

const mockAuth = vi.mocked(auth);
const mockSafeParse = vi.mocked(storeConfigSchema.safeParse);
const mockUpdateStoreConfig = vi.mocked(updateStoreConfig);
const mockRevalidatePath = vi.mocked(revalidatePath);

function asAdmin() {
  mockAuth.mockResolvedValue({ user: { role: "admin" } } as any);
}

function asUser() {
  mockAuth.mockResolvedValue({ user: { role: "user" } } as any);
}

const validSettings = {
  storeName: "Mi Tienda",
  currency: "EUR",
  freeShippingThreshold: 5000,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateSettingsAction", () => {
  it("devuelve error No autorizado si no es admin", async () => {
    asUser();

    const result = await updateSettingsAction(validSettings);

    expect(result).toEqual({ error: "No autorizado" });
    expect(mockSafeParse).not.toHaveBeenCalled();
  });

  it("devuelve error si los datos no superan la validación del schema", async () => {
    asAdmin();
    mockSafeParse.mockReturnValue({ success: false, error: {} } as any);

    const result = await updateSettingsAction({ storeName: "" });

    expect(result).toEqual({ error: "Datos inválidos. Revisa el formulario." });
    expect(mockUpdateStoreConfig).not.toHaveBeenCalled();
  });

  it("actualiza la configuración y devuelve success:true", async () => {
    asAdmin();
    mockSafeParse.mockReturnValue({
      success: true,
      data: validSettings,
    } as any);
    mockUpdateStoreConfig.mockResolvedValue(undefined as any);

    const result = await updateSettingsAction(validSettings);

    expect(result).toEqual({ success: true });
    expect(mockUpdateStoreConfig).toHaveBeenCalledWith(validSettings);
  });

  it("llama a revalidatePath en todas las rutas afectadas", async () => {
    asAdmin();
    mockSafeParse.mockReturnValue({
      success: true,
      data: validSettings,
    } as any);
    mockUpdateStoreConfig.mockResolvedValue(undefined as any);

    await updateSettingsAction(validSettings);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/novedades");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/rebajas");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/settings");
  });

  it("devuelve error genérico si updateStoreConfig lanza", async () => {
    asAdmin();
    mockSafeParse.mockReturnValue({
      success: true,
      data: validSettings,
    } as any);
    mockUpdateStoreConfig.mockRejectedValue(new Error("DB error"));

    const result = await updateSettingsAction(validSettings);

    expect(result).toEqual({
      error: "Ocurrió un error al guardar la configuración.",
    });
  });

  it("pasa los datos parseados (no los raw) a updateStoreConfig", async () => {
    asAdmin();
    const parsedData = { ...validSettings, storeName: "Nombre Limpio" };
    mockSafeParse.mockReturnValue({ success: true, data: parsedData } as any);
    mockUpdateStoreConfig.mockResolvedValue(undefined as any);

    // Pasamos datos distintos a los parseados para verificar que usa los del schema
    await updateSettingsAction({ storeName: "  Nombre Sucio  " });

    expect(mockUpdateStoreConfig).toHaveBeenCalledWith(
      expect.objectContaining({ storeName: "Nombre Limpio" }),
    );
  });
});
