"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper simple para slugs
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
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
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

  const rawName = String(formData.get("name") || "").trim();
  let rawSlug = String(formData.get("slug") || "").trim();

  // Generación automática de slug si no viene
  if (!rawSlug && rawName) rawSlug = slugify(rawName);

  const validated = categorySchema.safeParse({
    name: rawName,
    slug: rawSlug,
    sort: formData.get("sort"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación. Revisa los campos.",
    };
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { slug: validated.data.slug! },
    });
    if (existing)
      return { message: "Ya existe una categoría con este slug (URL)." };

    await prisma.category.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug!,
        sort: validated.data.sort,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Error de base de datos al crear." };
  }

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

  const rawName = String(formData.get("name") || "").trim();
  let rawSlug = String(formData.get("slug") || "").trim();
  if (!rawSlug && rawName) rawSlug = slugify(rawName);

  const validated = categorySchema.safeParse({
    name: rawName,
    slug: rawSlug,
    sort: formData.get("sort"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Error de validación.",
    };
  }

  try {
    // Verificamos si el slug ya existe en OTRA categoría
    const existing = await prisma.category.findUnique({
      where: { slug: validated.data.slug! },
    });
    if (existing && existing.id !== id) {
      return { message: "Este slug ya está en uso por otra categoría." };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        slug: validated.data.slug!,
        sort: validated.data.sort,
      },
    });
  } catch (error) {
    return { message: "Error al actualizar la categoría." };
  }

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
        error: `No se puede borrar: Hay ${count} productos en esta categoría. Mueve o borra los productos primero.`,
      };
    }
    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch {
    return { error: "Error técnico al eliminar." };
  }
}

// --- QUICK CREATE (Para el formulario de productos) ---
export async function quickCreateCategory(name: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  if (!name || name.length < 3) return { error: "Nombre muy corto (min 3)." };

  try {
    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });

    if (existing) return { error: "Ya existe una categoría similar." };

    const last = await prisma.category.findFirst({ orderBy: { sort: "desc" } });
    const sort = (last?.sort ?? 0) + 1;

    const newCat = await prisma.category.create({
      data: { name, slug, sort },
    });

    return { success: true, category: newCat };
  } catch (error) {
    return { error: "Error al crear categoría rápida." };
  }
}
