import { redirect } from "next/navigation";

import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";

import { registerAction } from "./actions";
import { RegisterForm } from "./RegisterForm";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
