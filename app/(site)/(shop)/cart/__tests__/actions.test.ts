import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";

import { validateStockAction } from "@/app/(site)/(shop)/cart/actions";

// ─── db está mockeado globalmente en vitest.setup.ts ─────────────────────────
const mockFindMany = vi.mocked(prisma.productVariant.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Helper para construir variantes mock de Prisma ───────────────────────────
const makeVariant = (overrides = {}) => ({
  id: "var_1",
  stock: 10,
  isActive: true,
  size: "M",
  color: "Rojo",
  product: { name: "Camiseta Roja" },
  ...overrides,
});

describe("validateStockAction", () => {
  // ── Caso feliz ─────────────────────────────────────────────────────────────
  it("devuelve success:true cuando todos los items tienen stock suficiente", async () => {
    mockFindMany.mockResolvedValue([makeVariant()] as any);

    const result = await validateStockAction([{ variantId: "var_1", qty: 2 }]);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("valida múltiples items correctamente", async () => {
    mockFindMany.mockResolvedValue([
      makeVariant({ id: "var_1", stock: 5 }),
      makeVariant({ id: "var_2", stock: 3, size: "L", color: "Azul" }),
    ] as any);

    const result = await validateStockAction([
      { variantId: "var_1", qty: 2 },
      { variantId: "var_2", qty: 3 },
    ]);

    expect(result.success).toBe(true);
  });

  // ── Variante inactiva o no encontrada ──────────────────────────────────────
  it("devuelve error cuando la variante no existe en BD", async () => {
    mockFindMany.mockResolvedValue([] as any); // no devuelve nada

    const result = await validateStockAction([
      { variantId: "var_inexistente", qty: 1 },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toContain("ya no está disponible");
    expect(result.stockUpdate).toEqual({
      variantId: "var_inexistente",
      realStock: 0,
    });
  });

  it("devuelve error cuando la variante está inactiva", async () => {
    mockFindMany.mockResolvedValue([makeVariant({ isActive: false })] as any);

    const result = await validateStockAction([{ variantId: "var_1", qty: 1 }]);

    expect(result.success).toBe(false);
    expect(result.error).toContain("ya no está disponible");
    expect(result.stockUpdate?.realStock).toBe(0);
  });

  // ── Stock agotado ──────────────────────────────────────────────────────────
  it("devuelve error cuando el stock es 0", async () => {
    mockFindMany.mockResolvedValue([makeVariant({ stock: 0 })] as any);

    const result = await validateStockAction([{ variantId: "var_1", qty: 1 }]);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Agotado");
    expect(result.error).toContain("Camiseta Roja");
    expect(result.stockUpdate).toEqual({ variantId: "var_1", realStock: 0 });
  });

  // ── Stock insuficiente ─────────────────────────────────────────────────────
  it("devuelve error cuando la cantidad solicitada supera el stock", async () => {
    mockFindMany.mockResolvedValue([makeVariant({ stock: 3 })] as any);

    const result = await validateStockAction([{ variantId: "var_1", qty: 5 }]);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Stock insuficiente");
    expect(result.error).toContain("Camiseta Roja");
    expect(result.error).toContain("quedan disponibles 3 unidades");
    expect(result.stockUpdate).toEqual({ variantId: "var_1", realStock: 3 });
  });

  it("usa singular 'queda disponible 1 unidad' cuando stock es 1", async () => {
    mockFindMany.mockResolvedValue([makeVariant({ stock: 1 })] as any);

    const result = await validateStockAction([{ variantId: "var_1", qty: 3 }]);

    expect(result.success).toBe(false);
    expect(result.error).toContain("queda disponible 1 unidad");
  });

  // ── Manejo de errores ──────────────────────────────────────────────────────
  it("devuelve error genérico cuando Prisma lanza una excepción", async () => {
    mockFindMany.mockRejectedValue(new Error("DB connection failed"));

    const result = await validateStockAction([{ variantId: "var_1", qty: 1 }]);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Error al verificar el inventario.");
  });

  it("devuelve success:true para lista de items vacía", async () => {
    mockFindMany.mockResolvedValue([] as any);

    const result = await validateStockAction([]);

    expect(result.success).toBe(true);
  });
});
