import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import {
  getPresetSizes,
  createPresetSize,
  deletePresetSize,
  getPresetColors,
  createPresetColor,
  updatePresetColor,
  deletePresetColor,
} from "@/app/(admin)/admin/products/_action/attributes-actions";

const mockAuth = vi.mocked(auth);
const mockPresetSizeFindMany = vi.mocked(prisma.presetSize.findMany);
const mockPresetSizeDelete = vi.mocked(prisma.presetSize.delete);
const mockPresetColorFindMany = vi.mocked(prisma.presetColor.findMany);
const mockPresetColorFindFirst = vi.mocked(prisma.presetColor.findFirst);
const mockPresetColorCreate = vi.mocked(prisma.presetColor.create);
const mockPresetColorUpdate = vi.mocked(prisma.presetColor.update);
const mockPresetColorDelete = vi.mocked(prisma.presetColor.delete);
const mockVariantCount = vi.mocked(prisma.productVariant.count);

// presetSize.upsert y presetSize.delete no están en el mock global - los añadimos inline
beforeEach(() => {
  vi.clearAllMocks();
  (prisma.presetSize as any).upsert = vi.fn();
  (prisma.presetSize as any).delete = vi.fn();
});

function asAdmin() {
  mockAuth.mockResolvedValue({ user: { role: "admin" } } as any);
}

function asUser() {
  mockAuth.mockResolvedValue({ user: { role: "user" } } as any);
}

// ─── assertAdmin (comportamiento común) ──────────────────────────────────────
describe("assertAdmin — aplicado en todas las actions", () => {
  it("lanza error si el usuario no es admin", async () => {
    asUser();
    await expect(getPresetSizes()).rejects.toThrow("No autorizado");
  });

  it("lanza error si no hay sesión", async () => {
    mockAuth.mockResolvedValue(null as any);
    await expect(getPresetSizes()).rejects.toThrow("No autorizado");
  });
});

// ─── getPresetSizes ───────────────────────────────────────────────────────────
describe("getPresetSizes", () => {
  it("devuelve todas las tallas ordenadas por createdAt", async () => {
    asAdmin();
    mockPresetSizeFindMany.mockResolvedValue([
      { id: "s1", name: "S", type: "clothing" },
      { id: "s2", name: "M", type: "clothing" },
    ] as any);

    const result = await getPresetSizes();

    expect(mockPresetSizeFindMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
    expect(result).toHaveLength(2);
  });
});

// ─── createPresetSize ─────────────────────────────────────────────────────────
describe("createPresetSize", () => {
  it("crea o reutiliza una talla y devuelve success:true", async () => {
    asAdmin();
    const mockSize = { id: "s1", name: "S", type: "clothing" };
    (prisma.presetSize as any).upsert.mockResolvedValue(mockSize);

    const result = await createPresetSize("S", "clothing");

    expect(result).toEqual({ success: true, size: mockSize });
  });

  it("llama a upsert con name como clave where", async () => {
    asAdmin();
    (prisma.presetSize as any).upsert.mockResolvedValue({
      id: "s1",
      name: "M",
    });

    await createPresetSize("M", "clothing");

    expect((prisma.presetSize as any).upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: "M" },
        create: expect.objectContaining({ name: "M", type: "clothing" }),
      }),
    );
  });

  it("devuelve error si el upsert falla", async () => {
    asAdmin();
    (prisma.presetSize as any).upsert.mockRejectedValue(new Error("DB error"));

    const result = await createPresetSize("S", "clothing");
    expect(result).toEqual({ error: "Error al guardar la talla." });
  });
});

// ─── deletePresetSize ─────────────────────────────────────────────────────────
describe("deletePresetSize", () => {
  it("impide borrar si hay variantes usando esa talla", async () => {
    asAdmin();
    mockVariantCount.mockResolvedValue(5);

    const result = await deletePresetSize("s1", "M");

    expect(result).toHaveProperty("error");
    expect(result.error).toContain("5 variantes");
    expect(result.error).toContain("M");
    expect((prisma.presetSize as any).delete).not.toHaveBeenCalled();
  });

  it("borra la talla si no hay variantes usándola", async () => {
    asAdmin();
    mockVariantCount.mockResolvedValue(0);
    (prisma.presetSize as any).delete.mockResolvedValue({});

    const result = await deletePresetSize("s1", "M");

    expect(result).toEqual({ success: true });
    expect((prisma.presetSize as any).delete).toHaveBeenCalledWith({
      where: { id: "s1" },
    });
  });
});

// ─── getPresetColors ──────────────────────────────────────────────────────────
describe("getPresetColors", () => {
  it("devuelve todos los colores ordenados por createdAt", async () => {
    asAdmin();
    mockPresetColorFindMany.mockResolvedValue([
      { id: "c1", name: "Rojo", hex: "#ff0000" },
    ] as any);

    const result = await getPresetColors();

    expect(mockPresetColorFindMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
    expect(result).toHaveLength(1);
  });
});

// ─── createPresetColor ────────────────────────────────────────────────────────
describe("createPresetColor", () => {
  it("devuelve el color existente si ya existe con ese nombre", async () => {
    asAdmin();
    const existing = { id: "c1", name: "Rojo", hex: "#ff0000" };
    mockPresetColorFindFirst.mockResolvedValue(existing as any);

    const result = await createPresetColor("Rojo", "#ff0000");

    expect(result).toEqual({ success: true, color: existing });
    expect(mockPresetColorCreate).not.toHaveBeenCalled();
  });

  it("crea un color nuevo si no existe", async () => {
    asAdmin();
    mockPresetColorFindFirst.mockResolvedValue(null);
    const newColor = { id: "c2", name: "Azul", hex: "#0000ff" };
    mockPresetColorCreate.mockResolvedValue(newColor as any);

    const result = await createPresetColor("Azul", "#0000ff");

    expect(result).toEqual({ success: true, color: newColor });
    expect(mockPresetColorCreate).toHaveBeenCalledWith({
      data: { name: "Azul", hex: "#0000ff" },
    });
  });

  it("devuelve error si el create falla", async () => {
    asAdmin();
    mockPresetColorFindFirst.mockResolvedValue(null);
    mockPresetColorCreate.mockRejectedValue(new Error("DB error"));

    const result = await createPresetColor("Verde", "#00ff00");
    expect(result).toEqual({ error: "Error al guardar el color." });
  });
});

// ─── updatePresetColor ────────────────────────────────────────────────────────
describe("updatePresetColor", () => {
  it("actualiza el hex del color correctamente", async () => {
    asAdmin();
    const updated = { id: "c1", name: "Rojo", hex: "#cc0000" };
    mockPresetColorUpdate.mockResolvedValue(updated as any);

    const result = await updatePresetColor("c1", "#cc0000");

    expect(result).toEqual({ success: true, color: updated });
    expect(mockPresetColorUpdate).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { hex: "#cc0000" },
    });
  });

  it("devuelve error si el update falla", async () => {
    asAdmin();
    mockPresetColorUpdate.mockRejectedValue(new Error("DB error"));

    const result = await updatePresetColor("c1", "#cc0000");
    expect(result).toEqual({ error: "Error al actualizar el color." });
  });
});

// ─── deletePresetColor ────────────────────────────────────────────────────────
describe("deletePresetColor", () => {
  it("impide borrar si hay variantes usando ese color", async () => {
    asAdmin();
    mockVariantCount.mockResolvedValue(3);

    const result = await deletePresetColor("c1", "Rojo");

    expect(result).toHaveProperty("error");
    expect(result.error).toContain("3 variantes");
    expect(result.error).toContain("Rojo");
    expect(mockPresetColorDelete).not.toHaveBeenCalled();
  });

  it("borra el color si no hay variantes usándolo", async () => {
    asAdmin();
    mockVariantCount.mockResolvedValue(0);
    mockPresetColorDelete.mockResolvedValue({} as any);

    const result = await deletePresetColor("c1", "Rojo");

    expect(result).toEqual({ success: true });
    expect(mockPresetColorDelete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });

  it("devuelve error si no es admin", async () => {
    asUser();
    await expect(deletePresetColor("c1", "Rojo")).rejects.toThrow(
      "No autorizado",
    );
  });
});
