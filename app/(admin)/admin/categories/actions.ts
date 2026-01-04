"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  categorySchema,
  createCategory,
  updateCategory,
  deleteCategory,
  createQuickCategory,
} from "@/lib/categories/service";

// Helpers Auth
async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("No autorizado");
}

export type CategoryFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// --- ACTION CREAR ---
export async function createCategoryAction(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await assertAdmin();

    const rawData = {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || "") || undefined,
      sort: formData.get("sort"),
    };

    const validated = categorySchema.safeParse(rawData);
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    await createCategory(validated.data);
  } catch (error: any) {
    return { message: error.message || "Error al crear." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

// --- ACTION ACTUALIZAR ---
export async function updateCategoryAction(
  id: string,
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await assertAdmin();

    const rawData = {
      name: String(formData.get("name") || ""),
      slug: String(formData.get("slug") || "") || undefined,
      sort: formData.get("sort"),
    };

    const validated = categorySchema.safeParse(rawData);
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    await updateCategory(id, validated.data);
  } catch (error: any) {
    return { message: error.message || "Error al actualizar." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

// --- ACTION ELIMINAR ---
export async function deleteCategoryAction(id: string) {
  try {
    await assertAdmin();
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al eliminar." };
  }
}

// --- ACTION QUICK CREATE ---
export async function quickCreateCategory(name: string) {
  try {
    await assertAdmin();
    const newCat = await createQuickCategory(name);
    return { success: true, category: newCat };
  } catch (error: any) {
    return { error: error.message };
  }
}
