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
  getPublicProducts,
  getAdminProducts,
  getProductForEdit,
  getProductMetaBySlug,
} from "@/lib/products/queries";

const mockProductFindMany = vi.mocked(prisma.product.findMany);
const mockProductFindUnique = vi.mocked(prisma.product.findUnique);
const mockProductFindFirst = vi.mocked(prisma.product.findFirst);
const mockProductCount = vi.mocked(prisma.product.count);
const mockCategoryFindMany = vi.mocked(prisma.category.findMany);

beforeEach(() => {
  vi.clearAllMocks();
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

const makeAdminProduct = (overrides: Record<string, any> = {}) => ({
  id: "prod_1",
  slug: "camiseta-roja",
  name: "Camiseta Roja",
  description: "Descripción",
  priceCents: 1999,
  compareAtPrice: null,
  currency: "EUR",
  isArchived: false,
  sortOrder: 0,
  createdAt: new Date("2024-01-01"),
  category: { id: "cat_1", name: "Camisetas", slug: "camisetas" },
  images: [{ url: "img.jpg", sort: 0 }],
  variants: [{ id: "v1", size: "M", color: "Rojo", stock: 5, isActive: true }],
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

// ─── getProductMetaBySlug ─────────────────────────────────────────────────────
describe("getProductMetaBySlug", () => {
  it("devuelve name, description e images del producto", async () => {
    mockProductFindUnique.mockResolvedValue({
      name: "Camiseta Roja",
      description: "Una camiseta",
      images: [{ url: "img.jpg", color: "Rojo" }],
    } as any);

    const result = await getProductMetaBySlug("camiseta-roja");
    expect(result?.name).toBe("Camiseta Roja");
    expect(result?.description).toBe("Una camiseta");
    expect(result?.images).toHaveLength(1);
  });

  it("devuelve null si el slug no existe", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    expect(await getProductMetaBySlug("no-existe")).toBeNull();
  });

  it("llama a findUnique con el slug correcto", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    await getProductMetaBySlug("mi-producto");
    expect(mockProductFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "mi-producto" } }),
    );
  });
});

// ─── getProductForEdit ────────────────────────────────────────────────────────
describe("getProductForEdit", () => {
  const mockEditProduct = {
    id: "prod_1",
    name: "Camiseta Roja",
    slug: "camiseta-roja",
    priceCents: 1999,
    category: { id: "cat_1", name: "Camisetas", slug: "camisetas" },
    images: [{ id: "img_1", url: "img.jpg", alt: null, sort: 0, color: null }],
    variants: [{ id: "v1", size: "M", color: "Rojo", stock: 5 }],
  };

  it("devuelve el producto con category, images y variants incluidas", async () => {
    mockProductFindUnique.mockResolvedValue(mockEditProduct as any);

    const result = await getProductForEdit("prod_1");
    expect(result).not.toBeNull();
    expect(result?.category).toBeDefined();
    expect(result?.images).toHaveLength(1);
    expect(result?.variants).toHaveLength(1);
  });

  it("devuelve null si el producto no existe", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    expect(await getProductForEdit("no-existe")).toBeNull();
  });

  it("llama a findUnique con el id correcto", async () => {
    mockProductFindUnique.mockResolvedValue(mockEditProduct as any);
    await getProductForEdit("prod_abc");
    expect(mockProductFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "prod_abc" } }),
    );
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
          { size: "M", color: "Rojo", colorHex: "#ff0000" },
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

// ─── getPublicProducts ────────────────────────────────────────────────────────
describe("getPublicProducts", () => {
  beforeEach(() => {
    mockProductCount.mockResolvedValue(1);
    mockProductFindMany.mockResolvedValue([makePublicProduct()] as any);
  });

  it("devuelve rows transformados y total con valores por defecto", async () => {
    const result = await getPublicProducts({});
    expect(result.rows).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.rows[0].slug).toBe("camiseta-roja");
    expect(result.rows[0].thumbnail).toBe("img.jpg");
    expect(result.rows[0].totalStock).toBe(5);
  });

  it("aplica filtro por categorySlug", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getPublicProducts({ categorySlug: "camisetas" });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: "camisetas" },
        }),
      }),
    );
  });

  it("pagina correctamente con page y limit", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getPublicProducts({ page: 2, limit: 6 });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 6, take: 6 }),
    );
  });

  it("filtra por query en memoria y pagina los resultados filtrados", async () => {
    mockProductFindMany.mockResolvedValue([
      makePublicProduct({ name: "Camiseta Roja" }),
      makePublicProduct({
        id: "prod_2",
        slug: "pantalon-azul",
        name: "Pantalón Azul",
        category: { name: "Pantalones", slug: "pantalones" },
      }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getPublicProducts({
      query: "camiseta",
      page: 1,
      limit: 12,
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].slug).toBe("camiseta-roja");
    expect(result.total).toBe(1);
  });

  it("filtra por rango de precio", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getPublicProducts({ minPrice: 1000, maxPrice: 5000 });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          priceCents: { gte: 1000, lte: 5000 },
        }),
      }),
    );
  });

  it("filtra por tallas y colores via variants", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getPublicProducts({ sizes: ["M", "L"], colors: ["Rojo"] });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          variants: {
            some: expect.objectContaining({
              size: { in: ["M", "L"] },
              color: { in: ["Rojo"] },
            }),
          },
        }),
      }),
    );
  });

  it("aplica sort personalizado cuando se pasa", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    const customSort = [{ priceCents: "asc" as const }];
    await getPublicProducts({ sort: customSort });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: customSort }),
    );
  });

  it("usa sortOrder asc + createdAt desc como orden por defecto", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getPublicProducts({});

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    );
  });

  it("devuelve array vacío si no hay resultados", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    const result = await getPublicProducts({});
    expect(result.rows).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

// ─── getAdminProducts ─────────────────────────────────────────────────────────
describe("getAdminProducts", () => {
  beforeEach(() => {
    mockProductFindMany.mockResolvedValue([makeAdminProduct()] as any);
    mockProductCount.mockResolvedValue(1);
    mockCategoryFindMany.mockResolvedValue([
      { id: "cat_1", name: "Camisetas" },
    ] as any);
    (prisma.orderItem as any).groupBy.mockResolvedValue([]);
  });

  it("devuelve productos, totalCount, totalPages, allCategories y grandTotalStock", async () => {
    const result = await getAdminProducts({});

    expect(result.products).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.allCategories).toHaveLength(1);
    expect(result.grandTotalStock).toBe(5);
  });

  it("calcula _totalStock sumando variantes del producto", async () => {
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({
        variants: [
          { id: "v1", size: "M", color: "Rojo", stock: 3, isActive: true },
          { id: "v2", size: "L", color: "Azul", stock: 7, isActive: true },
        ],
      }),
    ] as any);

    const result = await getAdminProducts({});
    expect(result.products[0]._totalStock).toBe(10);
  });

  it("calcula _totalSold desde el salesMap", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([
      { productId: "prod_1", _sum: { quantity: 42 } },
    ]);

    const result = await getAdminProducts({});
    expect(result.products[0]._totalSold).toBe(42);
  });

  it("filtra productos archivados cuando status es 'archived'", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getAdminProducts({ status: "archived" });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isArchived: true }),
      }),
    );
  });

  it("filtra por categorías cuando se pasan", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    await getAdminProducts({ categories: ["cat_1", "cat_2"] });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: { in: ["cat_1", "cat_2"] },
        }),
      }),
    );
  });

  it("ordena por stock_asc en memoria", async () => {
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({
        id: "prod_1",
        variants: [{ id: "v1", stock: 10, isActive: true }],
      }),
      makeAdminProduct({
        id: "prod_2",
        slug: "prod-2",
        variants: [{ id: "v2", stock: 2, isActive: true }],
      }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getAdminProducts({ sort: "stock_asc" });
    expect(result.products[0]._totalStock).toBe(2);
    expect(result.products[1]._totalStock).toBe(10);
  });

  it("ordena por stock_desc en memoria", async () => {
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({
        id: "prod_1",
        variants: [{ id: "v1", stock: 3, isActive: true }],
      }),
      makeAdminProduct({
        id: "prod_2",
        slug: "prod-2",
        variants: [{ id: "v2", stock: 8, isActive: true }],
      }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getAdminProducts({ sort: "stock_desc" });
    expect(result.products[0]._totalStock).toBe(8);
  });

  it("ordena por sales_desc en memoria", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([
      { productId: "prod_1", _sum: { quantity: 5 } },
      { productId: "prod_2", _sum: { quantity: 20 } },
    ]);
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({ id: "prod_1" }),
      makeAdminProduct({ id: "prod_2", slug: "prod-2" }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getAdminProducts({ sort: "sales_desc" });
    expect(result.products[0]._totalSold).toBe(20);
  });

  it("ordena por sales_asc en memoria", async () => {
    (prisma.orderItem as any).groupBy.mockResolvedValue([
      { productId: "prod_1", _sum: { quantity: 15 } },
      { productId: "prod_2", _sum: { quantity: 3 } },
    ]);
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({ id: "prod_1" }),
      makeAdminProduct({ id: "prod_2", slug: "prod-2" }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getAdminProducts({ sort: "sales_asc" });
    expect(result.products[0]._totalSold).toBe(3);
  });

  it("ordena por price_asc usando Prisma orderBy", async () => {
    mockProductFindMany.mockResolvedValue([makeAdminProduct()] as any);
    mockProductCount.mockResolvedValue(1);

    await getAdminProducts({ sort: "price_asc" });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { priceCents: "asc" } }),
    );
  });

  it("ordena por name_asc usando Prisma orderBy", async () => {
    mockProductFindMany.mockResolvedValue([makeAdminProduct()] as any);
    mockProductCount.mockResolvedValue(1);

    await getAdminProducts({ sort: "name_asc" });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: "asc" } }),
    );
  });

  it("pagina con page y limit correctamente", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(30);

    const result = await getAdminProducts({ page: 2, limit: 10 });

    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result.totalPages).toBe(3);
  });

  it("filtra por query en memoria y ajusta totalCount", async () => {
    mockProductFindMany.mockResolvedValue([
      makeAdminProduct({ name: "Camiseta Roja" }),
      makeAdminProduct({
        id: "prod_2",
        slug: "pantalon",
        name: "Pantalón Azul",
        category: { id: "cat_2", name: "Pantalones", slug: "pantalones" },
      }),
    ] as any);
    mockProductCount.mockResolvedValue(2);

    const result = await getAdminProducts({ query: "camiseta" });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].name).toBe("Camiseta Roja");
    expect(result.totalCount).toBe(1);
  });
});
