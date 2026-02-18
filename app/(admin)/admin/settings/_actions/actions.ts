"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { storeConfigSchema } from "@/lib/settings/schema";
import { updateStoreConfig } from "@/lib/settings/service";

export async function updateSettingsAction(rawData: unknown) {
  const session = await auth();
  if (session?.user?.role !== "admin") return { error: "No autorizado" };

  const parseResult = storeConfigSchema.safeParse(rawData);

  if (!parseResult.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  try {
    const cleanData: Record<string, unknown> = { ...parseResult.data };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === null) cleanData[key] = undefined;
    });
    await updateStoreConfig(cleanData);
    revalidatePath("/");
    revalidatePath("/novedades");
    revalidatePath("/rebajas");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { error: "Ocurrió un error al guardar la configuración." };
  }
}
