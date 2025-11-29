import Link from "next/link";

import { Container } from "@/components/ui";

import { auth } from "@/lib/auth";

import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export const metadata = {
  robots: { index: false, follow: false },
};

type AccountLayoutProps = {
  children: ReactNode;
};

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth();

  const name = (session?.user.name ?? "").trim() || "Tu cuenta";

  return (
    <Container className="py-8 px-6 max-w-4xl">
      <header className="mb-6 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Sesión iniciada como <span className="font-medium">{name}</span>
          </p>
        </div>
      </header>

      <main>{children}</main>
    </Container>
  );
}
