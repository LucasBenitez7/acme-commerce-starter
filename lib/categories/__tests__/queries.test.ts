import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  getCategoryBySlug,
  getAdminCategories,
  getCategoryForEdit,
  getCategoryOrderList,
} from "@/lib/categories/queries";
import { prisma } from "@/lib/db";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockCategory = {
  id: "cat-1",
  name: "Camisetas",
  slug: "camisetas",
  sort: 1,
  isFeatured: false,
  featuredAt: null,
  image: null,
  mobileImage: null,
  _count: { products: 5 },
};

// ─── getCategoryBySlug ────────────────────────────────────────────────────────

describe("getCategoryBySlug", () => {
  it("devuelve la categoría si existe el slug", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );

    const result = await getCategoryBySlug("camisetas");

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { slug: "camisetas" },
      select: { id: true, name: true, slug: true },
    });
    expect(result).toEqual(mockCategory);
  });

  it("devuelve null si no existe el slug", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

    const result = await getCategoryBySlug("no-existe");

    expect(result).toBeNull();
  });

  it("devuelve null sin llamar a prisma si el slug está vacío", async () => {
    const result = await getCategoryBySlug("");

    expect(prisma.category.findUnique).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

// ─── getAdminCategories ───────────────────────────────────────────────────────

describe("getAdminCategories", () => {
  it("devuelve categorías con paginación por defecto", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      mockCategory,
    ] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(1);

    const result = await getAdminCategories({});

    expect(prisma.category.findMany).toHaveBeenCalled();
    expect(result.categories).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("filtra por filter=featured", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(0);

    await getAdminCategories({ filter: "featured" });

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      }),
    );
  });

  it("filtra por filter=with_products", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(0);

    await getAdminCategories({ filter: "with_products" });

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          products: { some: {} },
        }),
      }),
    );
  });

  it("filtra por filter=empty", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(0);

    await getAdminCategories({ filter: "empty" });

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          products: { none: {} },
        }),
      }),
    );
  });

  it("ordena por products count cuando sortBy=products", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(0);

    await getAdminCategories({ sortBy: "products", sortOrder: "desc" });

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { products: { _count: "desc" } },
      }),
    );
  });

  it("calcula paginación correctamente", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(50);

    const result = await getAdminCategories({ page: 2, limit: 10 });

    expect(result.totalPages).toBe(5);
    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it("devuelve 0 páginas si no hay resultados", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.category.count).mockResolvedValue(0);

    const result = await getAdminCategories({});

    expect(result.totalPages).toBe(0);
    expect(result.totalCount).toBe(0);
  });
});

// ─── getCategoryForEdit ───────────────────────────────────────────────────────

describe("getCategoryForEdit", () => {
  it("devuelve la categoría con el count de productos", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );

    const result = await getCategoryForEdit("cat-1");

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      include: { _count: { select: { products: true } } },
    });
    expect(result).toEqual(mockCategory);
  });

  it("devuelve null si no encuentra la categoría", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

    const result = await getCategoryForEdit("no-existe");

    expect(result).toBeNull();
  });
});

// ─── getCategoryOrderList ─────────────────────────────────────────────────────

describe("getCategoryOrderList", () => {
  it("devuelve las categorías ordenadas por sort asc", async () => {
    const mockList = [
      { id: "cat-1", name: "A", sort: 1, isFeatured: false },
      { id: "cat-2", name: "B", sort: 2, isFeatured: true },
    ];
    vi.mocked(prisma.category.findMany).mockResolvedValue(mockList as any);

    const result = await getCategoryOrderList();

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, sort: true, isFeatured: true },
      orderBy: { sort: "asc" },
    });
    expect(result).toEqual(mockList);
  });

  it("devuelve array vacío si no hay categorías", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);

    const result = await getCategoryOrderList();

    expect(result).toEqual([]);
  });
});
