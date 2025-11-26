import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";

import { RegisterForm } from "./RegisterForm";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function registerAction(formData: FormData) {
  "use server";

  const rawData = Object.fromEntries(formData.entries());

  // 1. Validar en servidor con Zod
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

    // Usuario nuevo
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

export default async function RegisterPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;

  const redirectTo = sp.redirectTo ?? "/";

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <Container className="max-w-md py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Regístrate para guardar tus datos y ver el historial de pedidos.
      </p>

      <div className="mt-6">
        {/* Pasamos la acción directamente */}
        <RegisterForm action={registerAction} redirectTo={redirectTo} />
      </div>
    </Container>
  );
}
