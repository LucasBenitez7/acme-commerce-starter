"use server";

import { prisma } from "@/lib/db";

// --- TALLAS ---
export async function getPresetSizes() {
  return prisma.presetSize.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createPresetSize(
  name: string,
  type: "clothing" | "shoe",
) {
  try {
    const size = await prisma.presetSize.upsert({
      where: { name },
      update: {},
      create: { name, type },
    });
    return { success: true, size };
  } catch (error) {
    return { error: "Error al guardar la talla." };
  }
}

export async function deletePresetSize(id: string, name: string) {
  const usageCount = await prisma.productVariant.count({
    where: { size: name },
  });

  if (usageCount > 0) {
    return {
      error: `No se puede borrar: Hay ${usageCount} variantes usando la talla "${name}".`,
    };
  }

  await prisma.presetSize.delete({ where: { id } });
  return { success: true };
}

// --- COLORES ---
export async function getPresetColors() {
  return prisma.presetColor.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createPresetColor(name: string, hex: string) {
  try {
    const color = await prisma.presetColor.upsert({
      where: { name_hex: { name, hex } },
      update: {},
      create: { name, hex },
    });
    return { success: true, color };
  } catch (error) {
    return { error: "Error al guardar el color." };
  }
}

export async function deletePresetColor(id: string, name: string) {
  const usageCount = await prisma.productVariant.count({
    where: { color: name },
  });

  if (usageCount > 0) {
    return {
      error: `No se puede borrar: Hay ${usageCount} variantes usando el color "${name}".`,
    };
  }

  await prisma.presetColor.delete({ where: { id } });
  return { success: true };
}
