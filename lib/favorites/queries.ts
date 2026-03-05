import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type FavoriteProductItem } from "@/lib/products/types";

export async function getUserFavoriteIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user?.id) return new Set();

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return new Set(favorites.map((f) => f.productId));
}

export async function getUserFavorites(): Promise<FavoriteProductItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          priceCents: true,
          compareAtPrice: true,
          currency: true,
          isArchived: true,
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: [{ sort: "asc" }, { id: "asc" }],
            select: { url: true, color: true },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              size: true,
              color: true,
              colorHex: true,
              colorOrder: true,
              stock: true,
              priceCents: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return favorites.map((fav) => {
    const p = fav.product;
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

    return {
      favoriteId: fav.id,
      addedAt: fav.createdAt,
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      compareAtPrice: p.compareAtPrice,
      currency: (p.currency ?? "EUR") as any,
      isArchived: p.isArchived,
      category: p.category,
      thumbnail: p.images[0]?.url ?? null,
      images: p.images,
      totalStock,
      variants: p.variants,
    };
  });
}

export async function checkIsFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const count = await prisma.favorite.count({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return count > 0;
}
