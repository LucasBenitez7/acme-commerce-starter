import { describe, it, expect, vi, beforeEach } from "vitest";

import { GET } from "@/app/api/products/load-more/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockGetPublicProducts = vi.fn();

vi.mock("@/lib/products/queries", () => ({
  getPublicProducts: (...args: unknown[]) => mockGetPublicProducts(...args),
}));

// parseSort se mantiene real para validar integración
vi.mock("@/lib/products/utils", async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeRequest(params: Record<string, string | string[]> = {}) {
  const url = new URL("http://localhost/api/products/load-more");
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  }
  return new Request(url.toString());
}

const mockProducts = [
  { id: "p1", name: "Producto 1" },
  { id: "p2", name: "Producto 2" },
];

// ─── GET /api/products/load-more ──────────────────────────────────────────────
describe("GET /api/products/load-more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublicProducts.mockResolvedValue({
      rows: mockProducts,
      total: 2,
    });
  });

  it("devuelve productos con los campos correctos en la respuesta", async () => {
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("products");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("hasMore");
    expect(data).toHaveProperty("nextPage");
  });

  it("calcula hasMore correctamente cuando hay más páginas", async () => {
    mockGetPublicProducts.mockResolvedValue({ rows: mockProducts, total: 30 });
    const response = await GET(makeRequest({ page: "1", limit: "12" }));
    const data = await response.json();

    expect(data.hasMore).toBe(true);
    expect(data.nextPage).toBe(2);
  });

  it("hasMore es false cuando se alcanza la última página", async () => {
    mockGetPublicProducts.mockResolvedValue({ rows: mockProducts, total: 2 });
    const response = await GET(makeRequest({ page: "1", limit: "12" }));
    const data = await response.json();

    expect(data.hasMore).toBe(false);
  });

  it("usa page=1 y limit=12 por defecto cuando no se pasan parámetros", async () => {
    await GET(makeRequest());

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 12 }),
    );
  });

  it("pasa los parámetros de paginación correctamente", async () => {
    await GET(makeRequest({ page: "3", limit: "6" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, limit: 6 }),
    );
  });

  it("pasa categorySlug cuando se proporciona", async () => {
    await GET(makeRequest({ categorySlug: "ropa" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ categorySlug: "ropa" }),
    );
  });

  it("pasa query de búsqueda cuando se proporciona", async () => {
    await GET(makeRequest({ query: "camiseta" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: "camiseta" }),
    );
  });

  it("pasa onlyOnSale=true cuando el parámetro es 'true'", async () => {
    await GET(makeRequest({ onlyOnSale: "true" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ onlyOnSale: true }),
    );
  });

  it("onlyOnSale es false cuando el parámetro no es 'true'", async () => {
    await GET(makeRequest({ onlyOnSale: "false" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ onlyOnSale: false }),
    );
  });

  it("pasa filtros de tallas cuando se proporcionan", async () => {
    await GET(makeRequest({ sizes: ["S", "M"] }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sizes: ["S", "M"] }),
    );
  });

  it("pasa filtros de colores cuando se proporcionan", async () => {
    await GET(makeRequest({ colors: ["Rojo", "Azul"] }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ colors: ["Rojo", "Azul"] }),
    );
  });

  it("pasa minPrice y maxPrice cuando se proporcionan", async () => {
    await GET(makeRequest({ minPrice: "500", maxPrice: "5000" }));

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 500, maxPrice: 5000 }),
    );
  });

  it("minPrice y maxPrice son undefined si no se proporcionan", async () => {
    await GET(makeRequest());

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: undefined, maxPrice: undefined }),
    );
  });

  it("sizes y colors son undefined si no se proporcionan", async () => {
    await GET(makeRequest());

    expect(mockGetPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sizes: undefined, colors: undefined }),
    );
  });

  it("devuelve 500 cuando getPublicProducts lanza un error", async () => {
    mockGetPublicProducts.mockRejectedValue(new Error("DB error"));
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
  });

  it("el nextPage incrementa correctamente en páginas sucesivas", async () => {
    mockGetPublicProducts.mockResolvedValue({ rows: mockProducts, total: 100 });
    const response = await GET(makeRequest({ page: "5" }));
    const data = await response.json();

    expect(data.nextPage).toBe(6);
  });
});
