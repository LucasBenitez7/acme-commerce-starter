import { redirect } from "next/navigation";

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
    <div className="flex items-center justify-center bg-neutral-50 w-full mt-5">
      <div className="w-full sm:w-lg border p-6 bg-background rounded-xs shadow-sm">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
        </div>

        <RegisterForm action={registerAction} redirectTo={redirectTo} />
      </div>
    </div>
  );
}
