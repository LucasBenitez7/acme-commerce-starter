"use server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";

export async function registerAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  // Validar Zod
  const result = registerSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "validation_error" };
  }

  const { email, password, name } = result.data;
  const emailLower = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return { error: "exists" };
    }

    // Crear usuario
    const passwordHash = await hash(password, 10);
    await prisma.user.create({
      data: {
        email: emailLower,
        name,
        passwordHash,
        role: "user",
      },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "unknown" };
  }
}
