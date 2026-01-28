import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return new NextResponse("Token inválido", { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return new NextResponse("Contraseña inválida (min 8 caracteres)", {
        status: 400,
      });
    }

    // 1. Buscar Token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return new NextResponse("Token inválido o expirado", { status: 400 });
    }

    // 2. Verificar expiración
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return new NextResponse("Token expirado", { status: 400 });
    }

    // 3. Buscar Usuario
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return new NextResponse("Usuario no encontrado", { status: 400 });
    }

    // 4. Hashear nueva contraseña
    const hashedPassword = await hash(password, 12);

    // 5. Actualizar Usuario y Borrar Token (Transacción)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
