import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  slugify,
  createCategory,
  updateCategory,
  deleteCategory,
  createQuickCategory,
} from "@/lib/categories/service";
import { prisma } from "@/lib/db";

// revalidateTag ya está mockeado en vitest.setup.ts

const mockCategory = {
  id: "cat-1",
  name: "Camisetas",
  slug: "camisetas",
  sort: 1,
  isFeatured: false,
  featuredAt: null,
  image: null,
  mobileImage: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── slugify ──────────────────────────────────────────────────────────────────

describe("slugify", () => {
  it("convierte texto a slug en minúsculas con guiones", () => {
    expect(slugify("Camisetas de Verano")).toBe("camisetas-de-verano");
  });

  it("elimina caracteres especiales", () => {
    expect(slugify("Café & Té!")).toBe("caf-t");
  });

  it("elimina guiones dobles", () => {
    expect(slugify("hola  mundo")).toBe("hola-mundo");
  });

  it("elimina espacios al inicio y al final", () => {
    expect(slugify("  zapatos  ")).toBe("zapatos");
  });
});

// ─── createCategory ───────────────────────────────────────────────────────────

describe("createCategory", () => {
  it("crea una categoría con slug generado automáticamente", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    const result = await createCategory({
      name: "Camisetas",
      sort: 0,
      isFeatured: false,
    });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Camisetas",
          slug: "camisetas",
        }),
      }),
    );
    expect(result).toEqual(mockCategory);
  });

  it("usa el slug proporcionado si se especifica", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.create).mockResolvedValue({
      ...mockCategory,
      slug: "mi-slug-custom",
    } as any);

    await createCategory({
      name: "Camisetas",
      slug: "mi-slug-custom",
      sort: 0,
      isFeatured: false,
    });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "mi-slug-custom" }),
      }),
    );
  });

  it("lanza error si el slug ya existe", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );

    await expect(
      createCategory({ name: "Camisetas", sort: 0, isFeatured: false }),
    ).rejects.toThrow("Ya existe una categoría con este slug (URL).");
  });

  it("asigna sort = lastSort + 1 si sort es 0", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue({
      ...mockCategory,
      sort: 5,
    } as any);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    await createCategory({ name: "Camisetas", sort: 0, isFeatured: false });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sort: 6 }),
      }),
    );
  });

  it("asigna sort = 1 si no hay categorías previas y sort es 0", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    await createCategory({ name: "Camisetas", sort: 0, isFeatured: false });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sort: 1 }),
      }),
    );
  });

  it("hace makeRoom si sort > 0 y hay colisión", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    // findFirst para collision check
    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any);
    vi.mocked(prisma.category.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    await createCategory({ name: "Camisetas", sort: 1, isFeatured: false });

    expect(prisma.category.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sort: { gte: 1 } },
        data: { sort: { increment: 1 } },
      }),
    );
  });

  it("establece featuredAt si isFeatured es true", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    await createCategory({ name: "Camisetas", sort: 0, isFeatured: true });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isFeatured: true,
          featuredAt: expect.any(Date),
        }),
      }),
    );
  });
});

// ─── updateCategory ───────────────────────────────────────────────────────────

describe("updateCategory", () => {
  it("actualiza una categoría correctamente", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

    const result = await updateCategory("cat-1", {
      name: "Camisetas",
      sort: 1,
      isFeatured: false,
    });

    expect(prisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cat-1" },
      }),
    );
    expect(result).toEqual(mockCategory);
  });

  it("lanza error si el slug está en uso por otra categoría", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      ...mockCategory,
      id: "otro-id",
    } as any);

    await expect(
      updateCategory("cat-1", {
        name: "Camisetas",
        sort: 1,
        isFeatured: false,
      }),
    ).rejects.toThrow("Este slug ya está en uso por otra categoría.");
  });

  it("no lanza error si el slug pertenece a la misma categoría", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

    await expect(
      updateCategory("cat-1", {
        name: "Camisetas",
        sort: 1,
        isFeatured: false,
      }),
    ).resolves.not.toThrow();
  });

  it("establece featuredAt cuando isFeatured pasa de false a true", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

    await updateCategory("cat-1", {
      name: "Camisetas",
      sort: 1,
      isFeatured: true,
    });

    expect(prisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          featuredAt: expect.any(Date),
        }),
      }),
    );
  });

  it("pone featuredAt a null cuando isFeatured es false", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      ...mockCategory,
      isFeatured: true,
      featuredAt: new Date(),
    } as any);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

    await updateCategory("cat-1", {
      name: "Camisetas",
      sort: 1,
      isFeatured: false,
    });

    expect(prisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ featuredAt: null }),
      }),
    );
  });

  it("llama a makeRoom si el sort cambia y hay colisión", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );
    vi.mocked(prisma.category.findFirst).mockResolvedValue({
      ...mockCategory,
      id: "otro-id",
      sort: 3,
    } as any);
    vi.mocked(prisma.category.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.category.update).mockResolvedValue(mockCategory as any);

    await updateCategory("cat-1", {
      name: "Camisetas",
      sort: 3,
      isFeatured: false,
    });

    expect(prisma.category.updateMany).toHaveBeenCalled();
  });
});

// ─── deleteCategory ───────────────────────────────────────────────────────────

describe("deleteCategory", () => {
  it("elimina una categoría sin productos", async () => {
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.category.delete).mockResolvedValue(mockCategory as any);

    await deleteCategory("cat-1");

    expect(prisma.category.delete).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });
  });

  it("lanza error si la categoría tiene productos", async () => {
    vi.mocked(prisma.product.count).mockResolvedValue(3);

    await expect(deleteCategory("cat-1")).rejects.toThrow(
      "No se puede borrar: Hay 3 productos en esta categoría.",
    );
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });
});

// ─── createQuickCategory ──────────────────────────────────────────────────────

describe("createQuickCategory", () => {
  it("crea una categoría rápida correctamente", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue({
      ...mockCategory,
      sort: 4,
    } as any);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    const result = await createQuickCategory("Zapatos");

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Zapatos",
          slug: "zapatos",
          sort: 5,
        }),
      }),
    );
    expect(result).toEqual(mockCategory);
  });

  it("lanza error si el nombre es muy corto", async () => {
    await expect(createQuickCategory("ab")).rejects.toThrow(
      "Nombre muy corto.",
    );
  });

  it("lanza error si el slug ya existe", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(
      mockCategory as any,
    );

    await expect(createQuickCategory("Camisetas")).rejects.toThrow(
      "Ya existe.",
    );
  });

  it("asigna sort = 1 si no hay categorías previas", async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

    await createQuickCategory("Zapatos");

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sort: 1 }),
      }),
    );
  });
});
