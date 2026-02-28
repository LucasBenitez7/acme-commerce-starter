import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createProductInDb, updateProductInDb } from "@/lib/products/service";

import {
  upsertProductAction,
  toggleProductArchive,
  deleteProductAction,
} from "@/app/(admin)/admin/products/_action/actions";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/products/service", () => ({
  createProductInDb: vi.fn(),
  updateProductInDb: vi.fn(),
}));

vi.mock("@/lib/cloudinary/utils", () => ({
  deleteImagesFromCloudinary: vi.fn(() =>
    Promise.resolve({ deleted: 0, errors: [] }),
  ),
}));

const mockAuth = vi.mocked(auth);
const mockProductUpdate = vi.mocked(prisma.product.update);
const mockProductFindUnique = vi.mocked(prisma.product.findUnique);
const mockProductDelete = vi.mocked(prisma.product.delete);
const mockOrderItemCount = vi.mocked(prisma.orderItem.count);
const mockCreateProduct = vi.mocked(createProductInDb);
const mockUpdateProduct = vi.mocked(updateProductInDb);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function asAdmin() {
  mockAuth.mockResolvedValue({ user: { role: "admin" } } as any);
}

function asUser() {
  mockAuth.mockResolvedValue({ user: { role: "user" } } as any);
}

// FormData mínimo válido para upsertProductAction
function makeUpsertFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.append("name", "Camiseta Test");
  fd.append("description", "Una descripción");
  fd.append("priceCents", "1999");
  fd.append("compareAtPrice", "");
  fd.append("categoryId", "cat_1");
  fd.append("isArchived", "false");
  fd.append("sortOrder", "");
  fd.append(
    "imagesJson",
    JSON.stringify([
      {
        url: "https://res.cloudinary.com/test/image/upload/img.jpg",
        alt: "img",
        color: "Rojo",
        sort: 0,
      },
    ]),
  );
  fd.append(
    "variantsJson",
    JSON.stringify([
      { size: "M", color: "Rojo", colorHex: null, colorOrder: 0, stock: 5 },
    ]),
  );
  Object.entries(overrides).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── upsertProductAction ──────────────────────────────────────────────────────
describe("upsertProductAction", () => {
  it("devuelve error de acceso si no es admin", async () => {
    asUser();

    const result = await upsertProductAction({}, makeUpsertFormData());
    expect(result?.message).toContain("Acceso denegado");
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  it("devuelve errores de validación si los datos son inválidos", async () => {
    asAdmin();

    const fd = makeUpsertFormData({ name: "", priceCents: "0" });
    const result = await upsertProductAction({}, fd);

    expect(result?.errors).toBeDefined();
    expect(result?.message).toContain("validación");
  });

  it("llama a createProductInDb cuando no hay id (nuevo producto)", async () => {
    asAdmin();
    mockCreateProduct.mockResolvedValue({ id: "new_prod" } as any);

    await upsertProductAction({}, makeUpsertFormData());

    expect(mockCreateProduct).toHaveBeenCalledTimes(1);
    expect(mockUpdateProduct).not.toHaveBeenCalled();
  });

  it("llama a updateProductInDb cuando hay id (editar producto)", async () => {
    asAdmin();
    mockUpdateProduct.mockResolvedValue(undefined as any);

    await upsertProductAction({}, makeUpsertFormData({ id: "prod_1" }));

    expect(mockUpdateProduct).toHaveBeenCalledWith(
      "prod_1",
      expect.any(Object),
    );
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  it("llama a revalidatePath y redirect tras éxito", async () => {
    asAdmin();
    mockCreateProduct.mockResolvedValue({ id: "new_prod" } as any);

    await upsertProductAction({}, makeUpsertFormData());

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/products");
  });

  it("devuelve mensaje de error genérico si createProductInDb lanza", async () => {
    asAdmin();
    mockCreateProduct.mockRejectedValue(new Error("DB error"));

    const result = await upsertProductAction({}, makeUpsertFormData());
    expect(result?.message).toContain("error inesperado");
  });

  it("parsea imagesJson vacío como array vacío sin explotar", async () => {
    asAdmin();

    const fd = makeUpsertFormData({ imagesJson: "", variantsJson: "" });
    const result = await upsertProductAction({}, fd);

    // Puede fallar validación por no tener variantes, pero no debe lanzar excepción
    expect(result).toBeDefined();
  });
});

// ─── toggleProductArchive ─────────────────────────────────────────────────────
describe("toggleProductArchive", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await toggleProductArchive("prod_1", true);
    expect(result).toHaveProperty("error");
  });

  it("actualiza isArchived a true correctamente", async () => {
    asAdmin();
    mockProductUpdate.mockResolvedValue({} as any);

    const result = await toggleProductArchive("prod_1", true);

    expect(result).toEqual({ success: true });
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: "prod_1" },
      data: { isArchived: true },
    });
  });

  it("actualiza isArchived a false correctamente (desarchivar)", async () => {
    asAdmin();
    mockProductUpdate.mockResolvedValue({} as any);

    const result = await toggleProductArchive("prod_1", false);

    expect(result).toEqual({ success: true });
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: "prod_1" },
      data: { isArchived: false },
    });
  });

  it("llama a revalidatePath tras archivar", async () => {
    asAdmin();
    mockProductUpdate.mockResolvedValue({} as any);

    await toggleProductArchive("prod_1", true);

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/products");
  });

  it("devuelve error si Prisma falla", async () => {
    asAdmin();
    mockProductUpdate.mockRejectedValue(new Error("DB error"));

    const result = await toggleProductArchive("prod_1", true);
    expect(result).toHaveProperty("error");
  });
});

// ─── deleteProductAction ──────────────────────────────────────────────────────
describe("deleteProductAction", () => {
  it("devuelve error si no es admin", async () => {
    asUser();

    const result = await deleteProductAction("prod_1");
    expect(result).toHaveProperty("error");
  });

  it("impide borrar un producto que tiene pedidos", async () => {
    asAdmin();
    mockOrderItemCount.mockResolvedValue(3);

    const result = await deleteProductAction("prod_1");

    expect(result).toHaveProperty("error");
    expect(result.error).toContain("vendido");
    expect(mockProductDelete).not.toHaveBeenCalled();
  });

  it("muestra 'vez' en singular cuando usageCount es 1", async () => {
    asAdmin();
    mockOrderItemCount.mockResolvedValue(1);

    const result = await deleteProductAction("prod_1");
    expect(result.error).toContain("1 vez");
  });

  it("devuelve error si el producto no existe", async () => {
    asAdmin();
    mockOrderItemCount.mockResolvedValue(0);
    mockProductFindUnique.mockResolvedValue(null);

    const result = await deleteProductAction("prod_1");
    expect(result).toEqual({ error: "Producto no encontrado" });
  });

  it("borra el producto y devuelve success:true", async () => {
    asAdmin();
    mockOrderItemCount.mockResolvedValue(0);
    mockProductFindUnique.mockResolvedValue({
      id: "prod_1",
      images: [],
    } as any);
    mockProductDelete.mockResolvedValue({} as any);

    const result = await deleteProductAction("prod_1");

    expect(result).toEqual({ success: true });
    expect(mockProductDelete).toHaveBeenCalledWith({ where: { id: "prod_1" } });
  });

  it("llama a revalidatePath tras borrar", async () => {
    asAdmin();
    mockOrderItemCount.mockResolvedValue(0);
    mockProductFindUnique.mockResolvedValue({
      id: "prod_1",
      images: [],
    } as any);
    mockProductDelete.mockResolvedValue({} as any);

    await deleteProductAction("prod_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/products");
  });
});
