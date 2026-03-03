import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/categories/service", () => ({
  categorySchema: {
    safeParse: vi.fn(),
  },
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createQuickCategory: vi.fn(),
}));

import { auth } from "@/lib/auth";
import {
  categorySchema,
  createCategory,
  updateCategory,
  deleteCategory,
  createQuickCategory,
} from "@/lib/categories/service";

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  quickCreateCategory,
} from "@/app/(admin)/admin/categories/actions";

const mockAuth = vi.mocked(auth);
const mockCategorySchema = vi.mocked(categorySchema);
const mockCreateCategory = vi.mocked(createCategory);
const mockUpdateCategory = vi.mocked(updateCategory);
const mockDeleteCategory = vi.mocked(deleteCategory);
const mockCreateQuickCategory = vi.mocked(createQuickCategory);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

function asAdmin() {
  mockAuth.mockResolvedValue({ user: { role: "admin" } } as any);
}

function asUser() {
  mockAuth.mockResolvedValue({ user: { role: "user" } } as any);
}

// Simula un safeParse exitoso
function mockValidSchema(data = { name: "Camisetas", slug: "camisetas" }) {
  (mockCategorySchema.safeParse as any).mockReturnValue({
    success: true,
    data,
  });
}

// Simula un safeParse fallido
function mockInvalidSchema() {
  (mockCategorySchema.safeParse as any).mockReturnValue({
    success: false,
    error: {
      flatten: () => ({
        fieldErrors: { name: ["El nombre es requerido"] },
      }),
    },
  });
}

function makeFormData(fields: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults = {
    name: "Camisetas",
    slug: "camisetas",
    sort: "0",
    isFeatured: "",
  };
  Object.entries({ ...defaults, ...fields }).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createCategoryAction ─────────────────────────────────────────────────────
describe("createCategoryAction", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await createCategoryAction({}, makeFormData());
    expect(result).toHaveProperty("message", "No autorizado");
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it("devuelve errores de validación si los datos son inválidos", async () => {
    asAdmin();
    mockInvalidSchema();

    const result = await createCategoryAction({}, makeFormData({ name: "" }));

    expect(result).toHaveProperty("errors");
    expect(result.errors?.name).toContain("El nombre es requerido");
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it("crea la categoría, revalida y redirige tras éxito", async () => {
    asAdmin();
    mockValidSchema();
    mockCreateCategory.mockResolvedValue({} as any);

    await createCategoryAction({}, makeFormData());

    expect(mockCreateCategory).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/categories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/categories");
  });

  it("devuelve error si createCategory lanza", async () => {
    asAdmin();
    mockValidSchema();
    mockCreateCategory.mockRejectedValue(new Error("Slug duplicado"));

    const result = await createCategoryAction({}, makeFormData());
    expect(result).toHaveProperty("message", "Slug duplicado");
  });

  it("lee isFeatured correctamente cuando el checkbox está marcado", async () => {
    asAdmin();
    mockValidSchema({
      name: "Camisetas",
      slug: "camisetas",
      isFeatured: true,
    } as any);
    mockCreateCategory.mockResolvedValue({} as any);

    await createCategoryAction({}, makeFormData({ isFeatured: "on" }));

    expect(mockCategorySchema.safeParse).toHaveBeenCalledWith(
      expect.objectContaining({ isFeatured: true }),
    );
  });
});

// ─── updateCategoryAction ─────────────────────────────────────────────────────
describe("updateCategoryAction", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await updateCategoryAction("cat_1", {}, makeFormData());
    expect(result).toHaveProperty("message", "No autorizado");
    expect(mockUpdateCategory).not.toHaveBeenCalled();
  });

  it("devuelve errores de validación si los datos son inválidos", async () => {
    asAdmin();
    mockInvalidSchema();

    const result = await updateCategoryAction(
      "cat_1",
      {},
      makeFormData({ name: "" }),
    );

    expect(result).toHaveProperty("errors");
    expect(mockUpdateCategory).not.toHaveBeenCalled();
  });

  it("actualiza la categoría con el id correcto", async () => {
    asAdmin();
    mockValidSchema();
    mockUpdateCategory.mockResolvedValue({} as any);

    await updateCategoryAction("cat_1", {}, makeFormData());

    expect(mockUpdateCategory).toHaveBeenCalledWith(
      "cat_1",
      expect.objectContaining({ name: "Camisetas" }),
    );
  });

  it("revalida y redirige tras éxito", async () => {
    asAdmin();
    mockValidSchema();
    mockUpdateCategory.mockResolvedValue({} as any);

    await updateCategoryAction("cat_1", {}, makeFormData());

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/categories");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/categories");
  });

  it("devuelve error si updateCategory lanza", async () => {
    asAdmin();
    mockValidSchema();
    mockUpdateCategory.mockRejectedValue(new Error("Categoría no encontrada"));

    const result = await updateCategoryAction("cat_1", {}, makeFormData());
    expect(result).toHaveProperty("message", "Categoría no encontrada");
  });
});

// ─── deleteCategoryAction ─────────────────────────────────────────────────────
describe("deleteCategoryAction", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await deleteCategoryAction("cat_1");
    expect(result).toHaveProperty("error", "No autorizado");
    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it("elimina la categoría y devuelve success:true", async () => {
    asAdmin();
    mockDeleteCategory.mockResolvedValue(undefined as any);

    const result = await deleteCategoryAction("cat_1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteCategory).toHaveBeenCalledWith("cat_1");
  });

  it("llama a revalidatePath tras eliminar", async () => {
    asAdmin();
    mockDeleteCategory.mockResolvedValue(undefined as any);

    await deleteCategoryAction("cat_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/categories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("devuelve el mensaje de error si deleteCategory lanza", async () => {
    asAdmin();
    mockDeleteCategory.mockRejectedValue(
      new Error("No se puede eliminar: tiene productos"),
    );

    const result = await deleteCategoryAction("cat_1");
    expect(result).toHaveProperty(
      "error",
      "No se puede eliminar: tiene productos",
    );
  });
});

// ─── quickCreateCategory ──────────────────────────────────────────────────────
describe("quickCreateCategory", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await quickCreateCategory("Nueva Cat");
    expect(result).toHaveProperty("error");
    expect(mockCreateQuickCategory).not.toHaveBeenCalled();
  });

  it("crea la categoría rápida y devuelve success:true con la categoría", async () => {
    asAdmin();
    const newCat = { id: "cat_new", name: "Nueva Cat", slug: "nueva-cat" };
    mockCreateQuickCategory.mockResolvedValue(newCat as any);

    const result = await quickCreateCategory("Nueva Cat");

    expect(result).toEqual({ success: true, category: newCat });
    expect(mockCreateQuickCategory).toHaveBeenCalledWith("Nueva Cat");
  });

  it("llama a revalidatePath del layout raíz", async () => {
    asAdmin();
    mockCreateQuickCategory.mockResolvedValue({ id: "cat_new" } as any);

    await quickCreateCategory("Nueva Cat");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("devuelve el mensaje de error si createQuickCategory lanza", async () => {
    asAdmin();
    mockCreateQuickCategory.mockRejectedValue(new Error("Nombre duplicado"));

    const result = await quickCreateCategory("Nueva Cat");
    expect(result).toHaveProperty("error", "Nombre duplicado");
  });
});
