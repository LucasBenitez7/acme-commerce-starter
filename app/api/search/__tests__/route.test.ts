import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/products/queries", () => ({
  getPublicProducts: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { getPublicProducts } from "@/lib/products/queries";

import { GET } from "@/app/api/search/route";

const mockGetPublicProducts = vi.mocked(getPublicProducts);
const mockCategoryFindMany = vi.mocked(prisma.category.findMany);

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/search");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

const mockProducts = [
  { id: "p1", name: "Camiseta Roja", slug: "camiseta-roja" },
  { id: "p2", name: "Camiseta Azul", slug: "camiseta-azul" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockCategoryFindMany.mockResolvedValue([]);
});

// ─── query vacía ──────────────────────────────────────────────────────────────
describe("GET /api/search — query vacía", () => {
  it("devuelve productos vacíos si no hay query", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ products: [], total: 0, suggestions: [] });
    expect(mockGetPublicProducts).not.toHaveBeenCalled();
  });

  it("devuelve vacío si la query es solo espacios", async () => {
    const res = await GET(makeRequest({ q: "   " }));
    const body = await res.json();

    expect(body.products).toEqual([]);
    expect(mockGetPublicProducts).not.toHaveBeenCalled();
  });
});

// ─── búsqueda normal ──────────────────────────────────────────────────────────
describe("GET /api/search — búsqueda con query", () => {
  beforeEach(() => {
    mockGetPublicProducts.mockResolvedValue({
      rows: mockProducts as any,
      total: 2,
    });
  });

  it("llama a getPublicProducts con la query y límite correctos", async () => {
    await GET(makeRequest({ q: "camiseta", limit: "3" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: "camiseta", limit: 3, page: 1 }),
    );
  });

  it("usa límite 6 por defecto si no se especifica", async () => {
    await GET(makeRequest({ q: "camiseta" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 6 }),
    );
  });

  it("devuelve productos y total correctamente", async () => {
    const res = await GET(makeRequest({ q: "camiseta" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.products).toHaveLength(2);
    expect(body.total).toBe(2);
  });
});

// ─── sugerencias ─────────────────────────────────────────────────────────────
describe("GET /api/search — sugerencias", () => {
  beforeEach(() => {
    mockGetPublicProducts.mockResolvedValue({
      rows: [{ id: "p1", name: "Camiseta Roja" }] as any,
      total: 1,
    });
  });

  it("incluye categorías cuyas palabras empiezan con la query", async () => {
    mockCategoryFindMany.mockResolvedValue([
      { name: "Camisetas" },
      { name: "Pantalones" },
    ] as any);

    const res = await GET(makeRequest({ q: "cam" }));
    const body = await res.json();

    expect(body.suggestions).toContain("Camisetas");
    expect(body.suggestions).not.toContain("Pantalones");
  });

  it("incluye nombres de productos en las sugerencias", async () => {
    mockCategoryFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest({ q: "cam" }));
    const body = await res.json();

    expect(body.suggestions).toContain("Camiseta Roja");
  });

  it("no duplica sugerencias", async () => {
    mockCategoryFindMany.mockResolvedValue([{ name: "Camiseta Roja" }] as any);

    const res = await GET(makeRequest({ q: "cam" }));
    const body = await res.json();

    const count = body.suggestions.filter(
      (s: string) => s === "Camiseta Roja",
    ).length;
    expect(count).toBe(1);
  });

  it("limita las sugerencias a 6", async () => {
    mockCategoryFindMany.mockResolvedValue([
      { name: "Cat A" },
      { name: "Cat B" },
      { name: "Cat C" },
      { name: "Cat D" },
      { name: "Cat E" },
      { name: "Cat F" },
      { name: "Cat G" },
    ] as any);
    mockGetPublicProducts.mockResolvedValue({
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: `p${i}`,
        name: `Producto ${i}`,
      })) as any,
      total: 10,
    });

    const res = await GET(makeRequest({ q: "c" }));
    const body = await res.json();

    expect(body.suggestions.length).toBeLessThanOrEqual(6);
  });

  it("ordena sugerencias que empiezan por la query antes que las que no", async () => {
    mockCategoryFindMany.mockResolvedValue([{ name: "Sudaderas" }] as any);
    mockGetPublicProducts.mockResolvedValue({
      rows: [{ id: "p1", name: "Camisa" }] as any,
      total: 1,
    });

    const res = await GET(makeRequest({ q: "cam" }));
    const body = await res.json();

    // "Camisa" empieza por "cam", "Sudaderas" no
    const idx_camisa = body.suggestions.indexOf("Camisa");
    const idx_sudaderas = body.suggestions.indexOf("Sudaderas");

    if (idx_sudaderas !== -1) {
      expect(idx_camisa).toBeLessThan(idx_sudaderas);
    }
  });
});

// ─── manejo de errores ────────────────────────────────────────────────────────
describe("GET /api/search — manejo de errores", () => {
  it("devuelve 500 si getPublicProducts lanza", async () => {
    mockGetPublicProducts.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest({ q: "camiseta" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toHaveProperty("error");
  });
});
