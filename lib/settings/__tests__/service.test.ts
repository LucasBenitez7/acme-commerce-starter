import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/lib/db";
import { getStoreConfig, updateStoreConfig } from "@/lib/settings/service";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockConfig = {
  id: "config-1",
  heroImage: "https://res.cloudinary.com/test/image/upload/v123/hero.jpg",
  heroMobileImage: null,
  heroTitle: "Bienvenido",
  heroSubtitle: "Subtítulo",
  heroLink: "/shop",
  saleImage: null,
  saleMobileImage: null,
  saleTitle: "Ofertas",
  saleSubtitle: "Descuentos",
  saleLink: "/sale",
  saleBackgroundColor: "#fff",
};

// ─── getStoreConfig ───────────────────────────────────────────────────────────

describe("getStoreConfig", () => {
  it("devuelve la configuración de la tienda", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(
      mockConfig as any,
    );

    const result = await getStoreConfig();

    expect(prisma.storeConfig.findFirst).toHaveBeenCalled();
    expect(result).toEqual(mockConfig);
  });

  it("devuelve null si no hay configuración", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(null);

    const result = await getStoreConfig();

    expect(result).toBeNull();
  });
});

// ─── updateStoreConfig ────────────────────────────────────────────────────────

describe("updateStoreConfig", () => {
  it("crea la configuración si no existe", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.storeConfig.create).mockResolvedValue(mockConfig as any);

    const result = await updateStoreConfig({ heroTitle: "Nuevo título" });

    expect(prisma.storeConfig.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ heroTitle: "Nuevo título" }),
      }),
    );
    expect(result).toEqual(mockConfig);
  });

  it("actualiza la configuración si ya existe", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(
      mockConfig as any,
    );
    vi.mocked(prisma.storeConfig.update).mockResolvedValue({
      ...mockConfig,
      heroTitle: "Título actualizado",
    } as any);

    const result = await updateStoreConfig({ heroTitle: "Título actualizado" });

    expect(prisma.storeConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "config-1" },
        data: expect.objectContaining({ heroTitle: "Título actualizado" }),
      }),
    );
    expect(result).toMatchObject({ heroTitle: "Título actualizado" });
  });

  it("no llama a create si ya existe config", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(
      mockConfig as any,
    );
    vi.mocked(prisma.storeConfig.update).mockResolvedValue(mockConfig as any);

    await updateStoreConfig({ heroTitle: "Test" });

    expect(prisma.storeConfig.create).not.toHaveBeenCalled();
  });

  it("no llama a update si no existe config", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.storeConfig.create).mockResolvedValue(mockConfig as any);

    await updateStoreConfig({ heroTitle: "Test" });

    expect(prisma.storeConfig.update).not.toHaveBeenCalled();
  });

  it("actualiza sin imágenes a borrar si las URLs son iguales", async () => {
    vi.mocked(prisma.storeConfig.findFirst).mockResolvedValue(
      mockConfig as any,
    );
    vi.mocked(prisma.storeConfig.update).mockResolvedValue(mockConfig as any);

    // misma heroImage → no hay nada que borrar
    await updateStoreConfig({ heroImage: mockConfig.heroImage });

    expect(prisma.storeConfig.update).toHaveBeenCalled();
  });
});
