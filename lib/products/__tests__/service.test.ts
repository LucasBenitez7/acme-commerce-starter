import { describe, it, expect, beforeEach, vi } from "vitest";

import { prisma } from "@/lib/db";
import {
  createProductInDb,
  updateProductInDb,
  getProductFormDependencies,
} from "@/lib/products/service";

// ─── Mock de la transacción con callback async ────────────────────────────────
const makeTxMock = () => ({
  product: { update: vi.fn().mockResolvedValue({}) },
  productImage: {
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
  },
  productVariant: {
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
  },
});

const mockProductCreate = vi.mocked(prisma.product.create);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockCategoryFindMany = vi.mocked(prisma.category.findMany);
const mockVariantFindMany = vi.mocked(prisma.productVariant.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Fixture de datos de formulario válidos ───────────────────────────────────
const makeFormData = (overrides = {}) => ({
  name: "Camiseta Roja",
  description: "Descripción del producto",
  priceCents: 1999,
  compareAtPrice: null,
  categoryId: "cat_1",
  isArchived: false,
  sortOrder: null,
  images: [
    { id: undefined, url: "https://img.jpg", alt: "Camiseta", color: "Rojo" },
  ],
  variants: [
    {
      id: undefined,
      size: "M",
      color: "Rojo",
      colorHex: "#ff0000",
      colorOrder: 0,
      priceCents: null,
      stock: 5,
    },
  ],
  ...overrides,
});

// ─── createProductInDb ────────────────────────────────────────────────────────
describe("createProductInDb", () => {
  it("llama a prisma.product.create con los datos correctos", async () => {
    mockProductCreate.mockResolvedValue({ id: "new_prod" } as any);

    const data = makeFormData() as any;
    await createProductInDb(data);

    expect(mockProductCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Camiseta Roja",
          priceCents: 1999,
          categoryId: "cat_1",
          isArchived: false,
        }),
      }),
    );
  });

  it("genera un slug a partir del nombre", async () => {
    mockProductCreate.mockResolvedValue({ id: "new_prod" } as any);

    await createProductInDb(makeFormData() as any);

    const callArg = mockProductCreate.mock.calls[0][0] as any;
    expect(callArg.data.slug).toMatch(/^camiseta-roja_\d+$/);
  });

  it("usa descripción vacía si description es null/undefined", async () => {
    mockProductCreate.mockResolvedValue({ id: "new_prod" } as any);

    await createProductInDb(makeFormData({ description: "" }) as any);

    const callArg = mockProductCreate.mock.calls[0][0] as any;
    expect(callArg.data.description).toBe("");
  });

  it("mapea imágenes con alt = nombre si alt es null", async () => {
    mockProductCreate.mockResolvedValue({ id: "new_prod" } as any);

    await createProductInDb(
      makeFormData({
        images: [{ id: undefined, url: "img.jpg", alt: null, color: null }],
      }) as any,
    );

    const callArg = mockProductCreate.mock.calls[0][0] as any;
    expect(callArg.data.images.create[0].alt).toBe("Camiseta Roja");
  });

  it("crea variantes con isActive:true", async () => {
    mockProductCreate.mockResolvedValue({ id: "new_prod" } as any);

    await createProductInDb(makeFormData() as any);

    const callArg = mockProductCreate.mock.calls[0][0] as any;
    expect(callArg.data.variants.create[0].isActive).toBe(true);
  });
});

// ─── updateProductInDb ────────────────────────────────────────────────────────
describe("updateProductInDb", () => {
  it("ejecuta $transaction con un callback async", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await updateProductInDb("prod_1", makeFormData() as any);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(txMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "prod_1" },
        data: expect.objectContaining({ name: "Camiseta Roja" }),
      }),
    );
  });

  it("borra imágenes que no están en el listado entrante", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await updateProductInDb("prod_1", makeFormData() as any);

    expect(txMock.productImage.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productId: "prod_1" }),
      }),
    );
  });

  it("actualiza imagen existente si tiene id", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    const data = makeFormData({
      images: [{ id: "img_1", url: "img.jpg", alt: "alt", color: "Rojo" }],
    });

    await updateProductInDb("prod_1", data as any);

    expect(txMock.productImage.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "img_1" } }),
    );
  });

  it("crea imagen nueva si no tiene id", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    const data = makeFormData({
      images: [{ id: undefined, url: "nueva.jpg", alt: "nueva", color: null }],
    });

    await updateProductInDb("prod_1", data as any);

    expect(txMock.productImage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          url: "nueva.jpg",
          productId: "prod_1",
        }),
      }),
    );
  });

  it("actualiza variante existente si tiene id", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    const data = makeFormData({
      variants: [
        {
          id: "var_1",
          size: "M",
          color: "Rojo",
          colorHex: null,
          colorOrder: 0,
          priceCents: null,
          stock: 3,
        },
      ],
    });

    await updateProductInDb("prod_1", data as any);

    expect(txMock.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "var_1" } }),
    );
  });

  it("crea variante nueva si no tiene id", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await updateProductInDb("prod_1", makeFormData() as any);

    expect(txMock.productVariant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ productId: "prod_1", size: "M" }),
      }),
    );
  });

  it("borra variantes que no están en el listado entrante", async () => {
    const txMock = makeTxMock();
    mockTransaction.mockImplementation(async (fn: any) => fn(txMock));

    await updateProductInDb("prod_1", makeFormData() as any);

    expect(txMock.productVariant.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productId: "prod_1" }),
      }),
    );
  });
});

// ─── getProductFormDependencies ───────────────────────────────────────────────
describe("getProductFormDependencies", () => {
  it("devuelve categorías, tallas y colores únicos ordenados", async () => {
    mockCategoryFindMany.mockResolvedValue([
      { id: "cat_1", name: "Camisetas" },
      { id: "cat_2", name: "Accesorios" },
    ] as any);
    mockVariantFindMany.mockResolvedValue([
      { size: "M", color: "Rojo" },
      { size: "L", color: "Azul" },
      { size: "M", color: "Rojo" }, // duplicado
    ] as any);

    const result = await getProductFormDependencies();

    expect(result.categories).toHaveLength(2);
    expect(result.existingSizes).toEqual(["L", "M"]); // ordenado, sin duplicados
    expect(result.existingColors).toEqual(["Azul", "Rojo"]); // ordenado, sin duplicados
  });

  it("devuelve arrays vacíos si no hay datos", async () => {
    mockCategoryFindMany.mockResolvedValue([]);
    mockVariantFindMany.mockResolvedValue([]);

    const result = await getProductFormDependencies();

    expect(result.categories).toEqual([]);
    expect(result.existingSizes).toEqual([]);
    expect(result.existingColors).toEqual([]);
  });
});
