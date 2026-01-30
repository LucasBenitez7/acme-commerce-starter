import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/db";
import { resend } from "@/lib/email/client";
import { VerificationEmail } from "@/lib/email/templates/VerificationEmail";

export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hora

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: email, token: existingToken.token },
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function sendVerificationEmail(email: string, token: string) {
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const confirmationLink = `${domain}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Verifica tu correo electrónico",
    react: VerificationEmail({ verificationLink: confirmationLink }),
  });
}
