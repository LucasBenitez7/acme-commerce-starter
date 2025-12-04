import { redirect } from "next/navigation";

import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";

import { LoginForm } from "./LoginForm";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export const metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  const redirectToParam = sp.redirectTo;

  const redirectTo =
    typeof redirectToParam === "string" && redirectToParam.length > 0
      ? redirectToParam
      : "/";

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <Container className="bg-neutral-100 p-6 lg:p-8">
      <div className="max-w-lg mx-auto border p-6 bg-background rounded-xs">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accede a tu cuenta para ver tus pedidos y datos guardados.
        </p>

        <div className="mt-6">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </Container>
  );
}
