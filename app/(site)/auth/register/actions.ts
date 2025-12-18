"use server";

import { hash } from "bcryptjs";

import { registerSchema } from "@/lib/auth/schema";
import { prisma } from "@/lib/db";

export async function registerAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  // Validar Zod
  const result = registerSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "validation_error" };
  }

  const { email, password, firstName, lastName, phone } = result.data;
  const emailLower = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return { error: "exists" };
    }

    const passwordHash = await hash(password, 10);

    // Concatenamos nombre completo para el campo legacy 'name'
    const fullName = `${firstName} ${lastName}`.trim();

    await prisma.user.create({
      data: {
        email: emailLower,
        firstName,
        lastName,
        phone,
        name: fullName,
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
