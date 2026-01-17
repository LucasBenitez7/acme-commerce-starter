"use server";

import { revalidatePath } from "next/cache";

import { addressFormSchema } from "@/lib/account/schema";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// --- CREAR / EDITAR / UPSERT ---
export async function upsertAddressAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: "Usuario no identificado",
      address: { ...data, id: "guest-temp-id" },
    };
  }

  const parsed = addressFormSchema.safeParse(data);

  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Datos inválidos.";
    return { error: errorMsg };
  }

  const { id, ...fields } = parsed.data;
  let resultAddress;

  const dataToSave = {
    userId: session.user.id,
    firstName: fields.firstName,
    lastName: fields.lastName,
    phone: fields.phone,
    street: fields.street,
    details: fields.details || null,
    postalCode: fields.postalCode,
    city: fields.city,
    province: fields.province,
    country: fields.country || "España",
  };

  try {
    await prisma.$transaction(async (tx) => {
      if (fields.isDefault) {
        await tx.userAddress.updateMany({
          where: {
            userId: session.user.id,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      // 2. Crear o Actualizar
      if (id) {
        // ACTUALIZAR
        resultAddress = await tx.userAddress.update({
          where: { id, userId: session.user.id },
          data: {
            ...dataToSave,
            isDefault: fields.isDefault ?? false,
          },
        });
      } else {
        resultAddress = await tx.userAddress.create({
          data: {
            ...dataToSave,
            isDefault: fields.isDefault ?? false,
          },
        });
      }
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");

    return { success: true, address: resultAddress };
  } catch (error) {
    console.error("Address Upsert Error:", error);
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
    revalidatePath("/checkout");
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
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    return { error: "Error al cambiar la dirección principal." };
  }
}
