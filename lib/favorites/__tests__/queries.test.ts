import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getUserFavoriteIds,
  getUserFavorites,
  checkIsFavorite,
} from "@/lib/favorites/queries";

const mockAuth = vi.mocked(auth);
const mockFavoriteFindMany = vi.mocked(prisma.favorite.findMany);
const mockFavoriteCount = vi.mocked(prisma.favorite.count);

function asLoggedIn(userId = "user_1") {
  mockAuth.mockResolvedValue({ user: { id: userId } } as any);
}

function asGuest() {
  mockAuth.mockResolvedValue(null as any);
}

// ─── Fixture ──────────────────────────────────────────────────────────────────
const makeFavoriteRow = (overrides: Record<string, any> = {}) => ({
  id: "fav_1",
  createdAt: new Date("2025-01-01"),
  product: {
    id: "prod_1",
    slug: "camiseta-roja",
    name: "Camiseta Roja",
    priceCents: 2999,
    compareAtPrice: null,
    currency: "EUR",
    isArchived: false,
    category: { name: "Camisetas", slug: "camisetas" },
    images: [{ url: "img.jpg", color: null }],
    variants: [
      {
        id: "var_1",
        size: "M",
        color: "Rojo",
        colorHex: "#ff0000",
        colorOrder: 0,
        stock: 5,
        priceCents: 2999,
        isActive: true,
      },
    ],
  },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── getUserFavoriteIds ───────────────────────────────────────────────────────
describe("getUserFavoriteIds", () => {
  it("devuelve Set vacío si no hay sesión", async () => {
    asGuest();
    const result = await getUserFavoriteIds();
    expect(result).toEqual(new Set());
    expect(mockFavoriteFindMany).not.toHaveBeenCalled();
  });

  it("devuelve Set con los productIds del usuario", async () => {
    asLoggedIn();
    mockFavoriteFindMany.mockResolvedValue([
      { productId: "prod_1" },
      { productId: "prod_2" },
    ] as any);

    const result = await getUserFavoriteIds();

    expect(result).toEqual(new Set(["prod_1", "prod_2"]));
  });

  it("busca solo por userId con select de productId", async () => {
    asLoggedIn("user_1");
    mockFavoriteFindMany.mockResolvedValue([]);

    await getUserFavoriteIds();

    expect(mockFavoriteFindMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      select: { productId: true },
    });
  });

  it("devuelve Set vacío si el usuario no tiene favoritos", async () => {
    asLoggedIn();
    mockFavoriteFindMany.mockResolvedValue([]);

    const result = await getUserFavoriteIds();
    expect(result.size).toBe(0);
  });
});

// ─── getUserFavorites ─────────────────────────────────────────────────────────
describe("getUserFavorites", () => {
  it("devuelve array vacío si no hay sesión", async () => {
    asGuest();
    const result = await getUserFavorites();
    expect(result).toEqual([]);
    expect(mockFavoriteFindMany).not.toHaveBeenCalled();
  });

  it("devuelve array vacío si el usuario no tiene favoritos", async () => {
    asLoggedIn();
    mockFavoriteFindMany.mockResolvedValue([]);

    const result = await getUserFavorites();
    expect(result).toEqual([]);
  });

  it("mapea correctamente los campos del producto favorito", async () => {
    asLoggedIn();
    mockFavoriteFindMany.mockResolvedValue([makeFavoriteRow()] as any);

    const result = await getUserFavorites();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      favoriteId: "fav_1",
      id: "prod_1",
      slug: "camiseta-roja",
      name: "Camiseta Roja",
      priceCents: 2999,
      currency: "EUR",
    });
  });

  it("calcula totalStock sumando el stock de todas las variantes", async () => {
    asLoggedIn();
    const row = makeFavoriteRow({
      product: {
        ...makeFavoriteRow().product,
        variants: [
          { ...makeFavoriteRow().product.variants[0], stock: 3 },
          { ...makeFavoriteRow().product.variants[0], id: "var_2", stock: 7 },
        ],
      },
    });
    mockFavoriteFindMany.mockResolvedValue([row] as any);

    const result = await getUserFavorites();
    expect(result[0].totalStock).toBe(10);
  });

  it("usa null como thumbnail si el producto no tiene imágenes", async () => {
    asLoggedIn();
    const row = makeFavoriteRow({
      product: { ...makeFavoriteRow().product, images: [] },
    });
    mockFavoriteFindMany.mockResolvedValue([row] as any);

    const result = await getUserFavorites();
    expect(result[0].thumbnail).toBeNull();
  });

  it("usa la primera imagen como thumbnail", async () => {
    asLoggedIn();
    mockFavoriteFindMany.mockResolvedValue([makeFavoriteRow()] as any);

    const result = await getUserFavorites();
    expect(result[0].thumbnail).toBe("img.jpg");
  });

  it("usa 'EUR' como currency por defecto si el producto no tiene currency", async () => {
    asLoggedIn();
    const row = makeFavoriteRow({
      product: { ...makeFavoriteRow().product, currency: null },
    });
    mockFavoriteFindMany.mockResolvedValue([row] as any);

    const result = await getUserFavorites();
    expect(result[0].currency).toBe("EUR");
  });

  it("ordena por createdAt desc en la query", async () => {
    asLoggedIn("user_1");
    mockFavoriteFindMany.mockResolvedValue([]);

    await getUserFavorites();

    expect(mockFavoriteFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});

// ─── checkIsFavorite ──────────────────────────────────────────────────────────
describe("checkIsFavorite", () => {
  it("devuelve false si no hay sesión", async () => {
    asGuest();
    const result = await checkIsFavorite("prod_1");
    expect(result).toBe(false);
    expect(mockFavoriteCount).not.toHaveBeenCalled();
  });

  it("devuelve true si el count es mayor que 0", async () => {
    asLoggedIn();
    mockFavoriteCount.mockResolvedValue(1);

    const result = await checkIsFavorite("prod_1");
    expect(result).toBe(true);
  });

  it("devuelve false si el count es 0", async () => {
    asLoggedIn();
    mockFavoriteCount.mockResolvedValue(0);

    const result = await checkIsFavorite("prod_1");
    expect(result).toBe(false);
  });

  it("busca por userId y productId del usuario en sesión", async () => {
    asLoggedIn("user_1");
    mockFavoriteCount.mockResolvedValue(0);

    await checkIsFavorite("prod_abc");

    expect(mockFavoriteCount).toHaveBeenCalledWith({
      where: { userId: "user_1", productId: "prod_abc" },
    });
  });
});
