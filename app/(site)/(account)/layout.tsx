import { redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <Container className="py-8 px-4">
      <div className="flex flex-col gap-8">
        <AccountSidebar user={session.user} />

        {/* CONTENIDO PRINCIPAL */}
        <main className="w-full lg:max-w-5xl mx-auto">{children}</main>
      </div>
    </Container>
  );
}
