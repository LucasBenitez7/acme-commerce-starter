import { revalidatePath } from "next/cache";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleFavoriteAction } from "@/lib/favorites/actions";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(prisma.favorite.findUnique);
const mockDelete = vi.mocked(prisma.favorite.delete);
const mockCreate = vi.mocked(prisma.favorite.create);
const mockRevalidatePath = vi.mocked(revalidatePath);

function asLoggedIn(userId = "user_1") {
  mockAuth.mockResolvedValue({ user: { id: userId } } as any);
}

function asGuest() {
  mockAuth.mockResolvedValue(null as any);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("toggleFavoriteAction", () => {
  it("devuelve error e isFavorite:false si no hay sesión", async () => {
    asGuest();

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({
      error: "Debes iniciar sesión",
      isFavorite: false,
    });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  // ─── Eliminar favorito existente ──────────────────────────────────────────
  it("elimina el favorito y devuelve isFavorite:false si ya existía", async () => {
    asLoggedIn();
    mockFindUnique.mockResolvedValue({
      id: "fav_1",
      userId: "user_1",
      productId: "product_1",
    } as any);
    mockDelete.mockResolvedValue({} as any);

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({ isFavorite: false });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "fav_1" } });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("llama a findUnique con la clave compuesta userId_productId", async () => {
    asLoggedIn("user_1");
    mockFindUnique.mockResolvedValue({ id: "fav_1" } as any);
    mockDelete.mockResolvedValue({} as any);

    await toggleFavoriteAction("product_1");

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        userId_productId: { userId: "user_1", productId: "product_1" },
      },
    });
  });

  it("llama a revalidatePath en /favoritos, / y /products/[slug] al eliminar", async () => {
    asLoggedIn();
    mockFindUnique.mockResolvedValue({ id: "fav_1" } as any);
    mockDelete.mockResolvedValue({} as any);

    await toggleFavoriteAction("product_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/favoritos");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/products/[slug]");
  });

  // ─── Crear favorito nuevo ─────────────────────────────────────────────────
  it("crea el favorito y devuelve isFavorite:true si no existía", async () => {
    asLoggedIn("user_1");
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "fav_new" } as any);

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({ isFavorite: true });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: "user_1", productId: "product_1" },
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("llama a revalidatePath en /favoritos al crear", async () => {
    asLoggedIn();
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "fav_new" } as any);

    await toggleFavoriteAction("product_1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/favoritos");
  });

  // ─── Manejo de errores ────────────────────────────────────────────────────
  it("devuelve error genérico si Prisma lanza al buscar el favorito", async () => {
    asLoggedIn();
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({ error: "Error al actualizar favoritos" });
  });

  it("devuelve error genérico si Prisma lanza al eliminar", async () => {
    asLoggedIn();
    mockFindUnique.mockResolvedValue({ id: "fav_1" } as any);
    mockDelete.mockRejectedValue(new Error("DB error"));

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({ error: "Error al actualizar favoritos" });
  });

  it("devuelve error genérico si Prisma lanza al crear", async () => {
    asLoggedIn();
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await toggleFavoriteAction("product_1");

    expect(result).toEqual({ error: "Error al actualizar favoritos" });
  });
});
