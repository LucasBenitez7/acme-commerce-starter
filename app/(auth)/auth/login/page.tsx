import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { LoginForm } from "./LoginForm";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  let redirectToParam = sp.redirectTo;

  if (redirectToParam && !redirectToParam.startsWith("/")) {
    redirectToParam = "/";
  }

  const redirectTo = redirectToParam || "/";

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex items-center justify-center bg-neutral-50 w-full mt-20">
      <div className="w-full sm:w-md border p-6 bg-background rounded-xs shadow-sm">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Iniciar sesión
          </h1>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
