import { revalidateTag } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";

// Helper slugify
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// Esquema Zod
export const categorySchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres").max(50),
  slug: z.string().optional(),
  sort: z.coerce.number().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

async function makeRoomForSortOrder(targetSort: number) {
  const collision = await prisma.category.findFirst({
    where: { sort: targetSort },
  });

  if (collision) {
    await prisma.category.updateMany({
      where: { sort: { gte: targetSort } },
      data: { sort: { increment: 1 } },
    });
  }
}

// --- CREAR ---
export async function createCategory(data: CategoryInput) {
  const slug = data.slug || slugify(data.name);

  // 1. Validar Slug
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new Error("Ya existe una categoría con este slug (URL).");

  // 2. Calcular Orden
  let finalSort = data.sort;

  if (!finalSort || finalSort === 0) {
    const lastCat = await prisma.category.findFirst({
      orderBy: { sort: "desc" },
    });
    finalSort = (lastCat?.sort ?? 0) + 1;
  } else {
    await makeRoomForSortOrder(finalSort);
  }

  const res = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      sort: finalSort,
    },
  });

  revalidateTag("header-categories");

  return res;
}

// --- ACTUALIZAR ---
export async function updateCategory(id: string, data: CategoryInput) {
  const slug = data.slug || slugify(data.name);

  // 1. Validar Slug (excluyendo a sí mismo)
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error("Este slug ya está en uso por otra categoría.");
  }

  // 2. Gestionar cambio de orden
  const current = await prisma.category.findUnique({ where: { id } });

  if (current && current.sort !== data.sort && data.sort !== 0) {
    await makeRoomForSortOrder(data.sort);
  }

  const res = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      sort: data.sort,
    },
  });

  revalidateTag("header-categories");

  return res;
}

// --- ELIMINAR ---
export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `No se puede borrar: Hay ${count} productos en esta categoría.`,
    );
  }

  await prisma.category.delete({ where: { id } });

  revalidateTag("header-categories");
}

// --- QUICK CREATE ---
export async function createQuickCategory(name: string) {
  if (!name || name.length < 3) throw new Error("Nombre muy corto.");

  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new Error("Ya existe.");

  const last = await prisma.category.findFirst({ orderBy: { sort: "desc" } });
  const sort = (last?.sort ?? 0) + 1;

  const res = await prisma.category.create({
    data: { name, slug, sort },
  });

  revalidateTag("header-categories");

  return res;
}
