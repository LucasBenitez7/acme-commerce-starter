import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import ChangePasswordForm from "./ChangePasswordForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguridad - Mi Cuenta",
  description: "Gestiona la seguridad de tu cuenta y cambia tu contraseña.",
};

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?redirectTo=/account/security");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-center sm:text-left font-semibold pb-2 border-b border-neutral-300">
          Seguridad
        </h2>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
