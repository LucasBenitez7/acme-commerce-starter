"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/tokens";

export async function requestVerificationEmail() {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const token = await generateVerificationToken(session.user.email);
    await sendVerificationEmail(token.identifier, token.token);

    return { success: true };
  } catch (error) {
    console.error("Error requesting verification:", error);
    return { success: false, error: "Error al enviar el email" };
  }
}
