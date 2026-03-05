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

    // Enviar email de bienvenida
    try {
      const { resend } = await import("@/lib/email/client");
      const { WelcomeEmail } = await import(
        "@/lib/email/templates/WelcomeEmail"
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: emailLower,
        subject: "¡Bienvenido a LSB Shop!",
        react: WelcomeEmail({ firstName, lastName }),
      });
    } catch (emailError) {
      console.error("Error al enviar email de bienvenida:", emailError);
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "unknown" };
  }
}
