"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const categorySchema = z.object({
  name: z
    .string()
    .min(3)
    .max(30, "Máximo 30 caracteres para no romper el diseño"),
  slug: z.string().optional(),
  sort: z.coerce.number().default(0),
});

export type CategoryFormState = {
  errors?: {
    name?: string[];
    slug?: string[];
    sort?: string[];
    _form?: string[];
  };
  message?: string;
};

// --- CREAR ---
export async function createCategoryAction(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { message: "No autorizado" };

  let slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!slug && name) slug = slugify(name);

  const validated = categorySchema.safeParse({
    name,
    slug,
    sort: formData.get("sort"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación",
    };
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { slug: validated.data.slug! },
    });
    if (existing) return { message: "Este slug ya existe." };

    await prisma.category.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug!,
        sort: validated.data.sort,
      },
    });
  } catch (error) {
    return { message: "Error al crear categoría" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

// --- ACTUALIZAR ---
export async function updateCategoryAction(
  id: string,
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") return { message: "No autorizado" };

  const validated = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sort: formData.get("sort"),
  });

  if (!validated.success) return { message: "Error validación" };

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        slug: validated.data.slug!,
        sort: validated.data.sort,
      },
    });
  } catch {
    return { message: "Error al actualizar" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

// --- ELIMINAR ---
export async function deleteCategoryAction(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        error: `No se puede borrar: Tiene ${count} productos asociados.`,
      };
    }
    await prisma.category.delete({ where: { id } });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { error: "Error al eliminar" };
  }
}

// --- QUICK CREATE ---
export async function quickCreateCategory(name: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  if (!name || name.length < 3) return { error: "Nombre muy corto" };

  try {
    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });

    if (existing) return { error: "Ya existe una categoría similar." };

    // Buscamos el último orden para ponerlo al final
    const last = await prisma.category.findFirst({ orderBy: { sort: "desc" } });
    const sort = (last?.sort ?? 0) + 1;

    const newCat = await prisma.category.create({
      data: { name, slug, sort },
    });

    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products/[id]", "page");

    return { success: true, category: newCat };
  } catch (error) {
    return { error: "Error al crear categoría" };
  }
}
