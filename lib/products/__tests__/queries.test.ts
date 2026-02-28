import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/db";
import {
  getProductSalesMap,
  getProductSalesAndReturns,
  getProductFullBySlug,
  getMaxPrice,
  getMaxDiscountPercentage,
  getFilterOptions,
  getRelatedProducts,
  getRecentProducts,
  getProductSlugs,
} from "@/lib/products/queries";

const mockProductFindMany = vi.mocked(prisma.product.findMany);
const mockProductFindUnique = vi.mocked(prisma.product.findUnique);
const mockProductFindFirst = vi.mocked(prisma.product.findFirst);

beforeEach(() => {
  vi.clearAllMocks();
  // groupBy y aggregate no están en el mock global del setup
  (prisma.orderItem as any).groupBy = vi.fn();
  (prisma.orderItem as any).aggregate = vi.fn();
});

// ─── Fixture base ─────────────────────────────────────────────────────────────
const makePublicProduct = (overrides: Record<string, any> = {}) => ({
  id: "prod_1",
  slug: "camiseta-roja",
  name: "Camiseta Roja",
  priceCents: 1999,
  compareAtPrice: null,
  currency: "EUR",
  isArchived: false,
  category: { name: "Camisetas", slug: "camisetas" },
  images: [{ url: "img.jpg", color: "Rojo" }],
  variants: [
    {
      id: "v1",
      size: "M",
      color: "Rojo",
      colorHex: "#ff0000",
      colorOrder: 0,
      stock: 5,
      priceCents: null,
      isActive: true,
    },
  ],
  ...overrides,
});

// ─── getProductSalesMap ───────────────────────────────────────────────────────
describe("getProductSalesMap", () => {
  it("devuelve mapa productId → unidades vendidas", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([
      { productId: "prod_1", _sum: { quantity: 10 } },
      { productId: "prod_2", _sum: { quantity: 5 } },
    ]);

    const result = await getProductSalesMap();
    expect(result).toEqual({ prod_1: 10, prod_2: 5 });
  });

  it("usa 0 cuando quantity es null", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([
      { productId: "prod_1", _sum: { quantity: null } },
    ]);

    const result = await getProductSalesMap();
    expect(result["prod_1"]).toBe(0);
  });

  it("devuelve objeto vacío si no hay ventas", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([]);
    expect(await getProductSalesMap()).toEqual({});
  });
});

// ─── getProductSalesAndReturns ────────────────────────────────────────────────
describe("getProductSalesAndReturns", () => {
  it("devuelve totalSold y totalReturned correctamente", async () => {
    (prisma.orderItem as any).aggregate.mockResolvedValue({
      _sum: { quantity: 20, quantityReturned: 3 },
    });

    const result = await getProductSalesAndReturns("prod_1");
    expect(result.totalSold).toBe(20);
    expect(result.totalReturned).toBe(3);
  });

  it("devuelve 0 cuando los sums son null", async () => {
    (prisma.orderItem as any).aggregate.mockResolvedValue({
      _sum: { quantity: null, quantityReturned: null },
    });

    const result = await getProductSalesAndReturns("prod_1");
    expect(result.totalSold).toBe(0);
    expect(result.totalReturned).toBe(0);
  });
});

// ─── getProductFullBySlug ─────────────────────────────────────────────────────
describe("getProductFullBySlug", () => {
  const mockFull = {
    id: "prod_1",
    slug: "camiseta-roja",
    name: "Camiseta Roja",
    description: "Descripción",
    priceCents: 1999,
    compareAtPrice: null,
    currency: "EUR",
    isArchived: false,
    category: { id: "cat_1", slug: "camisetas", name: "Camisetas" },
    images: [
      { id: "img_1", url: "img.jpg", alt: "alt", sort: 0, color: "Rojo" },
    ],
    variants: [
      {
        id: "v1",
        color: "Rojo",
        size: "M",
        priceCents: null,
        stock: 5,
        colorHex: null,
        colorOrder: 0,
        isActive: true,
      },
    ],
  };

  it("devuelve el producto cuando existe y no está archivado", async () => {
    mockProductFindUnique.mockResolvedValue(mockFull as any);

    const result = await getProductFullBySlug("camiseta-roja");
    expect(result).not.toBeNull();
    expect(result?.slug).toBe("camiseta-roja");
    expect(result?.currency).toBe("EUR");
  });

  it("devuelve null si el producto no existe", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    expect(await getProductFullBySlug("no-existe")).toBeNull();
  });

  it("devuelve null si el producto está archivado", async () => {
    mockProductFindUnique.mockResolvedValue({
      ...mockFull,
      isArchived: true,
    } as any);
    expect(await getProductFullBySlug("camiseta-roja")).toBeNull();
  });

  it("usa 'EUR' como currency y '' como description cuando son null", async () => {
    mockProductFindUnique.mockResolvedValue({
      ...mockFull,
      currency: null,
      description: null,
    } as any);

    const result = await getProductFullBySlug("camiseta-roja");
    expect(result?.currency).toBe("EUR");
    expect(result?.description).toBe("");
  });
});

// ─── getMaxPrice ──────────────────────────────────────────────────────────────
describe("getMaxPrice", () => {
  it("convierte el precio máximo de céntimos a euros", async () => {
    mockProductFindFirst.mockResolvedValue({ priceCents: 9999 } as any);
    expect(await getMaxPrice()).toBe(99.99);
  });

  it("devuelve 0 si no hay productos", async () => {
    mockProductFindFirst.mockResolvedValue(null);
    expect(await getMaxPrice()).toBe(0);
  });
});

// ─── getMaxDiscountPercentage ─────────────────────────────────────────────────
describe("getMaxDiscountPercentage", () => {
  it("calcula el mayor porcentaje de descuento correctamente", async () => {
    mockProductFindMany.mockResolvedValue([
      { priceCents: 1000, compareAtPrice: 2000 }, // 50%
      { priceCents: 1500, compareAtPrice: 2000 }, // 25%
    ] as any);

    expect(await getMaxDiscountPercentage()).toBe(50);
  });

  it("devuelve 0 si no hay productos con descuento", async () => {
    mockProductFindMany.mockResolvedValue([]);
    expect(await getMaxDiscountPercentage()).toBe(0);
  });

  it("ignora productos donde compareAtPrice es menor que priceCents", async () => {
    mockProductFindMany.mockResolvedValue([
      { priceCents: 2000, compareAtPrice: 1000 },
    ] as any);
    expect(await getMaxDiscountPercentage()).toBe(0);
  });

  it("ignora productos donde compareAtPrice es null", async () => {
    mockProductFindMany.mockResolvedValue([
      { priceCents: 1000, compareAtPrice: null },
    ] as any);
    expect(await getMaxDiscountPercentage()).toBe(0);
  });
});

// ─── getFilterOptions ─────────────────────────────────────────────────────────
describe("getFilterOptions", () => {
  it("devuelve tallas, colores y rango de precios en céntimos", async () => {
    mockProductFindMany.mockResolvedValue([
      {
        priceCents: 1000,
        variants: [
          { size: "M", color: "Rojo", colorHex: "#ff0000" },
          { size: "L", color: "Azul", colorHex: "#0000ff" },
        ],
      },
      {
        priceCents: 2000,
        variants: [{ size: "S", color: "Rojo", colorHex: "#ff0000" }],
      },
    ] as any);

    const result = await getFilterOptions();
    expect(result.sizes).toContain("S");
    expect(result.sizes).toContain("M");
    expect(result.sizes).toContain("L");
    expect(result.colors.map((c) => c.name)).toContain("Rojo");
    expect(result.colors.map((c) => c.name)).toContain("Azul");
    expect(result.minPrice).toBe(1000);
    expect(result.maxPrice).toBe(2000);
  });

  it("devuelve valores vacíos si no hay productos", async () => {
    mockProductFindMany.mockResolvedValue([]);

    const result = await getFilterOptions();
    expect(result.sizes).toEqual([]);
    expect(result.colors).toEqual([]);
    expect(result.minPrice).toBe(0);
    expect(result.maxPrice).toBe(0);
  });

  it("no duplica colores ni tallas", async () => {
    mockProductFindMany.mockResolvedValue([
      {
        priceCents: 1000,
        variants: [
          { size: "M", color: "Rojo", colorHex: "#ff0000" },
          { size: "M", color: "Rojo", colorHex: "#ff0000" }, // duplicado
        ],
      },
    ] as any);

    const result = await getFilterOptions();
    expect(result.colors.filter((c) => c.name === "Rojo")).toHaveLength(1);
    expect(result.sizes.filter((s) => s === "M")).toHaveLength(1);
  });

  it("usa #000000 como hex por defecto si colorHex es null", async () => {
    mockProductFindMany.mockResolvedValue([
      {
        priceCents: 1000,
        variants: [{ size: "M", color: "Blanco", colorHex: null }],
      },
    ] as any);

    const result = await getFilterOptions();
    expect(result.colors.find((c) => c.name === "Blanco")?.hex).toBe("#000000");
  });
});

// ─── getRelatedProducts ───────────────────────────────────────────────────────
describe("getRelatedProducts", () => {
  it("transforma filas y calcula totalStock sumando todas las variantes", async () => {
    mockProductFindMany.mockResolvedValue([
      makePublicProduct({
        variants: [
          {
            id: "v1",
            size: "M",
            color: "Azul",
            colorHex: null,
            colorOrder: 0,
            stock: 3,
            priceCents: null,
            isActive: true,
          },
          {
            id: "v2",
            size: "L",
            color: "Azul",
            colorHex: null,
            colorOrder: 0,
            stock: 2,
            priceCents: null,
            isActive: true,
          },
        ],
      }),
    ] as any);

    const result = await getRelatedProducts({
      categoryId: "cat_1",
      excludeId: "prod_99",
    });

    expect(result).toHaveLength(1);
    expect(result[0].totalStock).toBe(5);
    expect(result[0].thumbnail).toBe("img.jpg");
  });

  it("devuelve array vacío si no hay productos relacionados", async () => {
    mockProductFindMany.mockResolvedValue([]);
    expect(
      await getRelatedProducts({ categoryId: "cat_1", excludeId: "prod_1" }),
    ).toEqual([]);
  });
});

// ─── getRecentProducts ────────────────────────────────────────────────────────
describe("getRecentProducts", () => {
  it("devuelve productos con thumbnail del primer imagen", async () => {
    mockProductFindMany.mockResolvedValue([
      makePublicProduct({ images: [{ url: "primera.jpg", color: null }] }),
    ] as any);

    const result = await getRecentProducts(4);
    expect(result).toHaveLength(1);
    expect(result[0].thumbnail).toBe("primera.jpg");
  });

  it("thumbnail es null si no hay imágenes", async () => {
    mockProductFindMany.mockResolvedValue([
      makePublicProduct({ images: [], variants: [] }),
    ] as any);

    const result = await getRecentProducts();
    expect(result[0].thumbnail).toBeNull();
    expect(result[0].totalStock).toBe(0);
  });
});

// ─── getProductSlugs ──────────────────────────────────────────────────────────
describe("getProductSlugs", () => {
  it("llama a findMany con isArchived:false y el límite indicado", async () => {
    mockProductFindMany.mockResolvedValue([{ slug: "slug-1" }] as any);

    await getProductSlugs(50);

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isArchived: false }, take: 50 }),
    );
  });

  it("usa 1000 como límite por defecto", async () => {
    mockProductFindMany.mockResolvedValue([]);

    await getProductSlugs();
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1000 }),
    );
  });
});
