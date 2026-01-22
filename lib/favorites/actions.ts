"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function toggleFavoriteAction(productId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión", isFavorite: false };
  }

  const userId = session.user.id;

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      revalidatePath("/favoritos");
      revalidatePath("/");
      revalidatePath(`/products/[slug]`);
      return { isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          productId,
        },
      });
      revalidatePath("/favoritos");
      return { isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { error: "Error al actualizar favoritos" };
  }
}
