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
    <Container className="py-4 sm:py-6 px-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <AccountSidebar user={session.user} />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 min-w-0 w-full lg:max-w-5xl mx-auto shadow bg-background p-4 sm:p-0 sm:shadow-none sm:bg-transparent border sm:border-none">
          {children}
        </main>
      </div>
    </Container>
  );
}
