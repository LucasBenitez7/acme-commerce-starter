import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/db";
import { resend } from "@/lib/email/client";
import ResetPasswordEmail from "@/lib/email/templates/ResetPasswordEmail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new NextResponse("Email inválido", { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!existingUser) {
      return NextResponse.json({ success: true });
    }

    // 2. Generar Token
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1800 * 1000);

    // 3. Guardar Token en DB
    await prisma.passwordResetToken.deleteMany({
      where: { email: emailLower },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: emailLower,
        token,
        expires,
      },
    });

    // 4. Enviar Email
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: emailLower,
      subject: "Solicitud de cambio de contraseña",
      react: ResetPasswordEmail({ resetLink }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return new NextResponse("Error al enviar email", { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
