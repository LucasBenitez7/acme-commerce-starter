"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/account/schema";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resend } from "@/lib/email/client";
import { PasswordChangedEmail } from "@/lib/email/templates/PasswordChangedEmail";

export async function updatePassword(data: ChangePasswordValues) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "No autorizado" };
    }

    // 1. Validar datos
    const validated = changePasswordSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Datos inválidos" };
    }

    const { currentPassword, newPassword } = validated.data;

    // 2. Obtener usuario con su hash actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error:
          "Usuario no encontrado o configurado incorrectamente (Google Auth?)",
      };
    }

    // 3. Verificar contraseña actual
    const isValid = await compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "La contraseña actual es incorrecta" };
    }

    // 4. Hashear nueva password
    const newHash = await hash(newPassword, 10);

    // 5. Actualizar en DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    // 6. Enviar notificación
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: user.email!,
        subject: "Tu contraseña ha sido actualizada",
        react: PasswordChangedEmail({ userEmail: user.email! }),
      });
    } catch (emailError) {
      console.error("Error sending password change email:", emailError);
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}
