"use server";

import { revalidatePath } from "next/cache";

import { addressSchema } from "@/lib/account/schema";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// --- CREAR / EDITAR ---
export async function upsertAddressAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const parsed = addressSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const { id, ...fields } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Si esta dirección se marca como Default, desmarcamos las otras del usuario
      if (fields.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        });
      }

      // 2. Crear o Actualizar
      if (id) {
        await tx.userAddress.update({
          where: { id, userId: session.user.id },
          data: fields,
        });
      } else {
        // Crear
        const count = await tx.userAddress.count({
          where: { userId: session.user.id },
        });
        const isFirst = count === 0;

        await tx.userAddress.create({
          data: {
            ...fields,
            isDefault: isFirst || fields.isDefault,
            userId: session.user.id,
          },
        });
      }
    });

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al guardar la dirección." };
  }
}

// --- ELIMINAR ---
export async function deleteAddressAction(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    await prisma.userAddress.delete({
      where: { id: addressId, userId: session.user.id },
    });

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar la dirección." };
  }
}

// --- MARCAR COMO DEFAULT ---
export async function setDefaultAddressAction(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    await prisma.$transaction([
      prisma.userAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      }),
      prisma.userAddress.update({
        where: { id: addressId, userId: session.user.id },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    return { error: "Error al cambiar la dirección principal." };
  }
}
